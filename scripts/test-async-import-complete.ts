/**
 * Script completo de teste do workflow de importação com BullMQ e SSE
 * 
 * Testa o fluxo completo:
 * 1. Upload do arquivo CSV
 * 2. Detecção de formato
 * 3. Validação (dry-run)
 * 4. Commit (cria job assíncrono)
 * 5. Monitoramento via SSE (Server-Sent Events)
 * 
 * Uso:
 *   tsx scripts/test-async-import-complete.ts <caminho-do-csv>
 * 
 * Exemplo:
 *   tsx scripts/test-async-import-complete.ts "HSI Inventário.csv"
 */

import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';
const AUTH_EMAIL = process.env.AUTH_EMAIL || 'admin@hsi.com';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'admin123';

let authToken: string = '';

// Helper para fazer requisições autenticadas
async function apiRequest(method: string, url: string, data?: any, headers?: any) {
  return axios({
    method,
    url: `${API_BASE_URL}${url}`,
    data,
    headers: {
      ...headers,
      Authorization: authToken ? `Bearer ${authToken}` : undefined,
    },
  });
}

async function authenticate() {
  console.log('\n🔐 1. Autenticando...');
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email: AUTH_EMAIL,
    password: AUTH_PASSWORD,
  });
  
  authToken = response.data.access_token;
  console.log('✅ Autenticado com sucesso');
  return authToken;
}

async function uploadFile(filePath: string) {
  console.log('\n📤 2. Upload do arquivo CSV...');
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  
  const response = await apiRequest('post', '/import/upload', form, {
    ...form.getHeaders(),
  });
  
  console.log(`✅ Arquivo enviado: ${response.data.filename}`);
  console.log(`   Tamanho: ${(response.data.size / 1024).toFixed(2)} KB`);
  console.log(`   Path: ${response.data.filePath}`);
  
  return response.data;
}

async function detectFormat(filePath: string) {
  console.log('\n🔍 3. Detectando formato do CSV...');
  const response = await apiRequest('post', '/import/detect', {
    filePath,
  });
  
  const data = response.data;
  console.log(`✅ Formato detectado:`);
  console.log(`   Encoding: ${data.encoding}`);
  console.log(`   Delimiter: "${data.delimiter}"`);
  console.log(`   Total de linhas: ${data.totalRows}`);
  console.log(`   Tipo de arquivo: ${data.fileType}`);
  console.log(`   Colunas: ${data.headers.length}`);
  console.log(`   Tempo estimado: ${data.stats.estimatedProcessingTime}`);
  
  if (data.suggestedMappings.length > 0) {
    console.log('\n📋 Sugestões de mapeamento (top 5):');
    data.suggestedMappings.slice(0, 5).forEach((m: any) => {
      console.log(`   ${m.csvColumn} → ${m.systemField} (confiança: ${(m.confidence * 100).toFixed(0)}%)`);
    });
  }
  
  return data;
}

async function validateImport(filePath: string, fileType: string, config: any) {
  console.log('\n✅ 4. Validando importação (dry-run)...');
  const response = await apiRequest('post', '/import/validate', {
    filePath,
    fileType,
    config,
  });
  
  const data = response.data;
  console.log(`${data.isValid ? '✅' : '❌'} Validação ${data.isValid ? 'aprovada' : 'reprovada'}`);
  console.log(`   Total de linhas: ${data.stats.totalRows}`);
  console.log(`   Linhas válidas: ${data.validRows}`);
  console.log(`   Linhas com erro: ${data.errorRows}`);
  console.log(`   Linhas com avisos: ${data.warningRows}`);
  console.log(`   Novos ativos: ${data.stats.newAssets}`);
  console.log(`   Ativos existentes: ${data.stats.existingAssets}`);
  console.log(`   Duração estimada: ${data.stats.estimatedDuration}`);
  
  if (data.errors && data.errors.length > 0) {
    console.log(`\n⚠️  Primeiros erros (${Math.min(5, data.errors.length)}/${data.errors.length}):`);
    data.errors.slice(0, 5).forEach((err: any) => {
      console.log(`   Linha ${err.row}: ${err.message} (${err.severity})`);
    });
  }
  
  if (data.preview) {
    console.log(`\n📊 Preview:`);
    console.log(`   Ativos a criar: ${data.preview.assetsToCreate?.length || 0}`);
    console.log(`   Ativos a atualizar: ${data.preview.assetsToUpdate?.length || 0}`);
  }
  
  return data;
}

async function commitImport(filePath: string, fileType: string, config: any) {
  console.log('\n🚀 5. Confirmando importação (criando job assíncrono)...');
  const response = await apiRequest('post', '/import/commit', {
    filePath,
    fileType,
    config,
  });
  
  const data = response.data;
  console.log(`✅ Job criado com sucesso!`);
  console.log(`   Job ID: ${data.jobId}`);
  console.log(`   Import Log ID: ${data.importLogId}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Mensagem: ${data.message}`);
  
  return data;
}

async function monitorProgressSSE(importLogId: string) {
  console.log('\n📡 6. Monitorando progresso via SSE...');
  console.log(`   URL: ${API_BASE_URL}/import/jobs/${importLogId}/progress`);
  console.log('   (Aguardando eventos...)\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/import/jobs/${importLogId}/progress`, {
      headers: {
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    let lastProgress = -1;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n✅ Stream SSE finalizado');
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.substring(5).trim();
          
          try {
            const parsed = JSON.parse(data);
            
            // Only log if progress changed
            if (parsed.progress !== lastProgress) {
              const progressBar = '█'.repeat(Math.floor(parsed.progress / 5)) + '░'.repeat(20 - Math.floor(parsed.progress / 5));
              console.log(`   [${progressBar}] ${parsed.progress}% | ${parsed.status} | ${parsed.successRows || 0}/${parsed.totalRows || 0} linhas`);
              lastProgress = parsed.progress;
            }
            
            if (parsed.status === 'COMPLETED') {
              console.log('\n🎉 Importação concluída com sucesso!');
              console.log(`   ⏱️  Duração: ${parsed.duration}s`);
              console.log(`   ✅ Linhas processadas: ${parsed.successRows || 0}`);
              console.log(`   ❌ Erros: ${parsed.errorRows || 0}`);
              
              if (parsed.stats) {
                console.log('\n📈 Estatísticas finais:');
                const stats = typeof parsed.stats === 'string' ? JSON.parse(parsed.stats) : parsed.stats;
                console.log(`   Ativos criados: ${stats.assetsCreated || 0}`);
                console.log(`   Ativos atualizados: ${stats.assetsUpdated || 0}`);
                console.log(`   Total processado: ${stats.totalProcessed || 0}`);
              }
              break;
            } else if (parsed.status === 'FAILED') {
              console.log('\n❌ Importação falhou!');
              if (parsed.errors) {
                console.log('   Erros:', parsed.errors);
              }
              break;
            }
          } catch (e) {
            // Ignore parse errors for non-JSON events
          }
        }
      }
    }
  } catch (error: any) {
    console.error('\n❌ Erro ao conectar ao SSE:', error.message);
    console.log('\n💡 Dica: Verifique se a API está rodando e se o Redis está ativo');
    throw error;
  }
}

async function pollJobStatus(importLogId: string) {
  console.log('\n📊 Alternativa: Polling do status do job...');
  
  let attempts = 0;
  const maxAttempts = 60; // 1 minuto com polling a cada 1s
  
  while (attempts < maxAttempts) {
    try {
      const response = await apiRequest('get', `/import/jobs/${importLogId}/status`);
      const status = response.data;
      
      const progressBar = '█'.repeat(Math.floor(status.progress / 5)) + '░'.repeat(20 - Math.floor(status.progress / 5));
      console.log(`   [${progressBar}] ${status.progress}% | ${status.status} | ${status.successRows || 0}/${status.totalRows || 0} linhas`);
      
      if (status.status === 'COMPLETED' || status.status === 'FAILED') {
        console.log(`\n✅ Job finalizado com status: ${status.status}`);
        console.log(`   Duração: ${status.duration}s`);
        console.log(`   Linhas processadas: ${status.successRows || 0}`);
        console.log(`   Erros: ${status.errorRows || 0}`);
        
        if (status.stats) {
          console.log('\n📈 Estatísticas:');
          const stats = typeof status.stats === 'string' ? JSON.parse(status.stats) : status.stats;
          console.log(JSON.stringify(stats, null, 2));
        }
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    } catch (error: any) {
      console.error(`❌ Erro ao consultar status: ${error.message}`);
      break;
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⏱️  Timeout: Job ainda processando após 1 minuto');
  }
}

async function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('❌ Uso: tsx scripts/test-async-import-complete.ts <caminho-do-csv>');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }
  
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🧪 Teste Completo: Importação Assíncrona com BullMQ    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n📁 Arquivo: ${path.basename(filePath)}`);
  
  try {
    // 1. Authenticate
    await authenticate();
    
    // 2. Upload
    const uploadData = await uploadFile(filePath);
    const uploadedPath = uploadData.filePath;
    
    // 3. Detect format
    const detection = await detectFormat(uploadedPath);
    
    // 4. Validate
    const validation = await validateImport(
      uploadedPath,
      detection.fileType,
      {
        encoding: detection.encoding,
        delimiter: detection.delimiter,
        skipRows: 0,
      }
    );
    
    if (!validation.isValid && validation.errorRows > 0) {
      console.log('\n⚠️  Validação falhou. Deseja continuar mesmo assim? (y/n)');
      // For automated testing, we'll skip this
      console.log('   Continuando para teste automatizado...');
    }
    
    // 5. Commit (create async job)
    const commitData = await commitImport(
      uploadedPath,
      detection.fileType,
      {
        encoding: detection.encoding,
        delimiter: detection.delimiter,
        skipRows: 0,
      }
    );
    
    // 6. Monitor progress via SSE
    try {
      await monitorProgressSSE(commitData.importLogId);
    } catch (sseError) {
      console.log('\n⚠️  SSE não disponível ou erro ocorreu. Usando polling como fallback...');
      await pollJobStatus(commitData.importLogId);
    }
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Teste completo finalizado com sucesso!              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
  } catch (error: any) {
    console.error('\n❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
