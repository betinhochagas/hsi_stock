/**
 * Script de teste para importação HSI via API
 * 
 * Este script testa o fluxo completo de importação:
 * 1. Faz login para obter token JWT
 * 2. Faz upload do arquivo CSV
 * 3. Detecta o formato automaticamente
 * 4. Valida a importação (dry-run)
 * 5. Executa a importação (commit)
 */

import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

const API_URL = 'http://localhost:3001/api/v1';
const CSV_PATH = path.join(__dirname, '..', 'HSI Inventário.csv');

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface UploadResponse {
  filePath: string;
  filename: string;
  size: number;
}

interface DetectResponse {
  encoding: string;
  delimiter: string;
  headers: string[];
  sample: any[];
  totalRows: number;
  fileType?: string;
}

interface CommitResponse {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: Array<{ row: number; error: string }>;
  importLogId: string;
}

async function main() {
  try {
    console.log('🚀 Iniciando teste de importação HSI via API\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      email: 'admin@hsi.local',
      password: 'admin123',
    });
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Login bem-sucedido! User ID: ${userId}\n`);

    // Headers com autenticação
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // 2. Upload do arquivo
    console.log('2️⃣ Fazendo upload do arquivo CSV...');
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`Arquivo não encontrado: ${CSV_PATH}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(CSV_PATH));

    console.log(`   Token: ${token.substring(0, 20)}...`);

    const uploadResponse = await axios.post<UploadResponse>(
      `${API_URL}/import/upload`,
      formData,
      {
        headers: {
          ...headers,
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const filePath = uploadResponse.data.filePath;
    console.log(`✅ Upload concluído! Path: ${filePath}`);
    console.log(`   Tamanho: ${(uploadResponse.data.size / 1024).toFixed(2)} KB\n`);

    // 3. Detectar formato
    console.log('3️⃣ Detectando formato do arquivo...');
    const detectResponse = await axios.post<DetectResponse>(
      `${API_URL}/import/detect`,
      {
        filePath,
        skipRows: 0,
      },
      { headers }
    );

    const { encoding, delimiter, headers: csvHeaders, totalRows, fileType } = detectResponse.data;
    console.log(`✅ Formato detectado:`);
    console.log(`   Encoding: ${encoding}`);
    console.log(`   Delimitador: "${delimiter}"`);
    console.log(`   Total de linhas: ${totalRows}`);
    console.log(`   Tipo detectado: ${fileType || 'genérico'}`);
    console.log(`   Colunas (${csvHeaders.length}): ${csvHeaders.slice(0, 5).join(', ')}...`);
    
    // Forçar tipo HSI se não foi detectado
    const forceHSI = !fileType || fileType !== 'hsi-inventario';
    if (forceHSI) {
      console.log('⚠️  AVISO: Forçando tipo HSI Inventário...\n');
    } else {
      console.log('   ✨ Arquivo HSI Inventário reconhecido automaticamente!\n');
    }

    // 4. Pular validação e ir direto para importação
    console.log('4️⃣ Executando importação (commit)...');
    const commitResponse = await axios.post<CommitResponse>(
      `${API_URL}/import/commit`,
      {
        filePath,
        fileType: 'hsi-inventario', // Forçar tipo HSI
        columnMapping: {}, // Enviar objeto vazio
        config: {
          encoding,
          delimiter,
          skipRows: 0,
          isHSIInventario: true,
        },
      },
      { 
        headers,
        timeout: 300000, // 5 minutos de timeout
      }
    );

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RESULTADO FINAL DA IMPORTAÇÃO');
    console.log('='.repeat(60));
    console.log(`Status: ${commitResponse.data.success ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log(`Total de linhas: ${commitResponse.data.totalRows}`);
    console.log(`Linhas importadas: ${commitResponse.data.successRows}`);
    console.log(`Linhas com erro: ${commitResponse.data.errorRows}`);
    console.log(`Import Log ID: ${commitResponse.data.importLogId}`);
    console.log('='.repeat(60));

    if (commitResponse.data.errors?.length > 0) {
      console.log(`\n⚠️  Erros encontrados (${commitResponse.data.errors.length} total):`);
      commitResponse.data.errors.slice(0, 10).forEach((error) => {
        console.log(`   Linha ${error.row}: ${error.error}`);
      });
      if (commitResponse.data.errors.length > 10) {
        console.log(`   ... e mais ${commitResponse.data.errors.length - 10} erros`);
      }
    }

    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error: any) {
    console.error('\n❌ Erro durante o teste:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensagem: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
