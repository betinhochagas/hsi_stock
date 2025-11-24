/**
 * Script para testar o endpoint SSE de progresso de importação
 * 
 * Uso:
 *   tsx scripts/test-sse-progress.ts <importLogId>
 * 
 * Exemplo:
 *   tsx scripts/test-sse-progress.ts abc123
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

async function testSSEProgress(importLogId: string) {
  console.log(`🔄 Conectando ao stream SSE para job: ${importLogId}`);
  console.log(`📡 URL: ${API_BASE_URL}/import/jobs/${importLogId}/progress\n`);

  try {
    // Note: For a real SSE client, you would use EventSource or a library like eventsource
    // This is a simplified example using fetch
    const response = await fetch(`${API_BASE_URL}/import/jobs/${importLogId}/progress`, {
      headers: {
        'Accept': 'text/event-stream',
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

    console.log('✅ Conexão SSE estabelecida. Aguardando eventos...\n');

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n✅ Stream finalizado');
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.substring(5).trim();
          
          try {
            const parsed = JSON.parse(data);
            console.log(`📊 Progresso: ${parsed.progress}% | Status: ${parsed.status} | Linhas: ${parsed.successRows || 0}/${parsed.totalRows || 0}`);
            
            if (parsed.status === 'COMPLETED' || parsed.status === 'FAILED') {
              console.log('\n🎉 Importação finalizada!');
              console.log(`⏱️  Duração: ${parsed.duration}s`);
              console.log(`✅ Sucesso: ${parsed.successRows || 0} linhas`);
              console.log(`❌ Erros: ${parsed.errorRows || 0} linhas`);
              
              if (parsed.stats) {
                console.log('\n📈 Estatísticas:');
                console.log(JSON.stringify(parsed.stats, null, 2));
              }
            }
          } catch (e) {
            // Ignore parse errors for non-JSON events
          }
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao conectar ao SSE:', error.message);
    process.exit(1);
  }
}

// Get importLogId from command line arguments
const importLogId = process.argv[2];

if (!importLogId) {
  console.error('❌ Uso: tsx scripts/test-sse-progress.ts <importLogId>');
  process.exit(1);
}

testSSEProgress(importLogId);
