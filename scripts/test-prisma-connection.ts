import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://estoque_user:admin@127.0.0.1:5432/estoque_hsi';

console.log('🔗 Testando conexão Prisma...');
console.log('URL:', DATABASE_URL.replace(/:[^:@]+@/, ':***@'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
});

async function test() {
  try {
    console.log('\n📋 Executando query de teste...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão OK!', result);

    console.log('\n👤 Buscando usuários...');
    const users = await prisma.user.findMany({ take: 5 });
    console.log(`✅ Encontrados ${users.length} usuários`);
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
