// Teste de limpeza de dados
const mockData = {
  name: "teste",
  assetTag: "hsi-teste",
  serialNumber: "123123123",
  model: "teste",
  categoryId: "cmigdj28p0003h1cfwe3qemfs", // Desktop
  manufacturerId: "", // Vazio - deve ser removido
  purchaseDate: "2025-11-19",
  purchasePrice: "0.00", // Zero como string
  warrantyUntil: "2025-11-29",
  locationId: "cmigdj293000yh1cf6z8m5vkm", // Almoxarifado TI
  status: "EM_ESTOQUE",
  observations: "Informações adicionais sobre o ativo..."
}

// Simular limpeza
const cleanData = {
  name: mockData.name,
  categoryId: mockData.categoryId,
  status: mockData.status,
  createdById: "cmigdj2590000h1cfs8gj7p8s", // Admin
}

// Adicionar campos opcionais apenas se tiverem valor
if (mockData.assetTag && mockData.assetTag.trim()) cleanData.assetTag = mockData.assetTag
if (mockData.serialNumber && mockData.serialNumber.trim()) cleanData.serialNumber = mockData.serialNumber
if (mockData.model && mockData.model.trim()) cleanData.model = mockData.model
if (mockData.observations && mockData.observations.trim()) cleanData.observations = mockData.observations

// IDs opcionais
if (mockData.locationId && mockData.locationId !== '') cleanData.locationId = mockData.locationId
if (mockData.manufacturerId && mockData.manufacturerId !== '') cleanData.manufacturerId = mockData.manufacturerId

// Datas e números
if (mockData.purchaseDate) cleanData.purchaseDate = new Date(mockData.purchaseDate)
if (mockData.purchasePrice && mockData.purchasePrice !== '' && mockData.purchasePrice !== '0.00') {
  cleanData.purchasePrice = Number(mockData.purchasePrice)
}
if (mockData.warrantyUntil) cleanData.warrantyUntil = new Date(mockData.warrantyUntil)

console.log('\n📦 Payload original:')
console.log(JSON.stringify(mockData, null, 2))

console.log('\n✨ Payload limpo (será enviado):')
console.log(JSON.stringify(cleanData, null, 2))

console.log('\n✅ Validações:')
console.log(`- name: ${cleanData.name ? '✓' : '✗'}`)
console.log(`- categoryId: ${cleanData.categoryId ? '✓' : '✗'}`)
console.log(`- createdById: ${cleanData.createdById ? '✓' : '✗'}`)
console.log(`- manufacturerId removido: ${!cleanData.manufacturerId ? '✓' : '✗'}`)
console.log(`- purchasePrice ${mockData.purchasePrice}: ${cleanData.purchasePrice !== undefined ? `${cleanData.purchasePrice}` : 'removido ✓'}`)
