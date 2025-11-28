import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCategories() {
  const categories = await prisma.category.findMany()
  console.log('Total de categorias:', categories.length)
  console.log('Categorias:', categories)
  await prisma.$disconnect()
}

checkCategories()
