const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://estoque_user:admin@localhost:5433/estoque_hsi?schema=public'
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    await prisma.$connect();
    console.log('✓ Connected successfully to database');
    const users = await prisma.user.count();
    console.log(`✓ Found ${users} users in database`);
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
