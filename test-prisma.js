const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    const count = await prisma.user.count();
    console.log('✅ Conexão OK - Usuários no banco:', count);
    
    const users = await prisma.user.findMany({ select: { name: true, role: true } });
    console.log('Usuários:', users);
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
