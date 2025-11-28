const { Client } = require('pg');

async function testPgDirect() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'estoque_hsi',
    user: 'estoque_user',
    password: 'admin',
    ssl: false, // Desabilitar SSL
  });

  try {
    console.log('🔍 Testando conexão direta com pg...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query executada:', result.rows);
    
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`✅ Usuários no banco: ${userCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Código:', error.code);
  } finally {
    await client.end();
  }
}

testPgDirect();
