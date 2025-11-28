import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAssetCreation() {
  console.log('\n🔍 Verificando estrutura para criar ativo...\n')
  
  // Buscar primeira categoria
  const category = await prisma.category.findFirst()
  console.log(`✅ Categoria: ${category?.name} (${category?.id})`)
  
  // Buscar primeira localização
  const location = await prisma.location.findFirst()
  console.log(`✅ Localização: ${location?.name} (${location?.id})`)
  
  // Buscar primeiro fabricante
  const manufacturer = await prisma.manufacturer.findFirst()
  console.log(`✅ Fabricante: ${manufacturer?.name} (${manufacturer?.id})`)
  
  // Buscar usuário admin
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@hsi.local' }
  })
  console.log(`✅ Usuário: ${admin?.name} (${admin?.id})`)
  
  console.log('\n📋 Payload de exemplo para criar ativo:')
  console.log(JSON.stringify({
    name: "Teste Notebook",
    assetTag: "TEST-001",
    categoryId: category?.id,
    locationId: location?.id,
    manufacturerId: manufacturer?.id,
    status: "EM_ESTOQUE",
    createdById: admin?.id,
    observations: "Teste de criação"
  }, null, 2))
  
  console.log('\n✅ Todos os IDs necessários estão disponíveis!\n')
}

testAssetCreation()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error('Erro:', err)
    prisma.$disconnect()
  })
