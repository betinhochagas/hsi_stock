import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { 
      email: true, 
      name: true,
      role: true
    }
  })
  
  console.log('\n📋 Usuários cadastrados no banco:')
  users.forEach(user => {
    console.log(`- ${user.email} (${user.name}) - ${user.role}`)
  })
  console.log(`\nTotal: ${users.length} usuário(s)\n`)
}

checkUsers()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error('Erro:', err)
    prisma.$disconnect()
  })
