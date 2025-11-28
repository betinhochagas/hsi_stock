import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTestData() {
  console.log('\n🧹 Removendo dados de teste...\n')
  
  // Remover categoria "Teste"
  const deletedCategories = await prisma.category.deleteMany({
    where: { 
      name: {
        contains: 'Teste',
        mode: 'insensitive'
      }
    }
  })
  console.log(`✅ Categorias removidas: ${deletedCategories.count}`)
  
  // Remover localização "Teste"
  const deletedLocations = await prisma.location.deleteMany({
    where: { 
      name: {
        contains: 'Teste',
        mode: 'insensitive'
      }
    }
  })
  console.log(`✅ Localizações removidas: ${deletedLocations.count}`)
  
  // Contar totais finais
  const totalCategories = await prisma.category.count()
  const totalLocations = await prisma.location.count()
  
  console.log(`\n📊 Totais finais:`)
  console.log(`   Categorias: ${totalCategories}`)
  console.log(`   Localizações: ${totalLocations}\n`)
}

cleanupTestData()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error('Erro:', err)
    prisma.$disconnect()
  })
