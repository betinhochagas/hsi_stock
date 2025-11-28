const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://estoque_user:admin@127.0.0.1:5432/estoque_hsi?schema=public&connect_timeout=10'
      }
    },
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Testando conexão com o banco...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executada:', result);
    
    const userCount = await prisma.user.count();
    console.log(`✅ Usuários no banco: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('Código do erro:', error.code);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
