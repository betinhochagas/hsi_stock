import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkPasswords() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@hsi.local' }
  })
  
  if (!admin) {
    console.log('❌ Usuário admin não encontrado!')
    return
  }
  
  console.log('\n🔍 Verificando senha do admin:')
  console.log(`Email: ${admin.email}`)
  console.log(`Hash armazenado: ${admin.password.substring(0, 30)}...`)
  console.log(`Ativo: ${admin.active}`)
  
  // Testar senha
  const senha1 = 'admin123'
  const senha2 = 'Admin123!'
  
  const match1 = await bcrypt.compare(senha1, admin.password)
  const match2 = await bcrypt.compare(senha2, admin.password)
  
  console.log(`\n✅ Senha '${senha1}': ${match1 ? 'CORRETA ✓' : 'INCORRETA ✗'}`)
  console.log(`✅ Senha '${senha2}': ${match2 ? 'CORRETA ✓' : 'INCORRETA ✗'}`)
  
  // Gerar novo hash para comparação
  const newHash = await bcrypt.hash('admin123', 10)
  console.log(`\n🔑 Novo hash gerado: ${newHash.substring(0, 30)}...`)
  
  const matchNew = await bcrypt.compare('admin123', newHash)
  console.log(`Teste novo hash: ${matchNew ? 'OK ✓' : 'FALHOU ✗'}`)
}

checkPasswords()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error('Erro:', err)
    prisma.$disconnect()
  })
