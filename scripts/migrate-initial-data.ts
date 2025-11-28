#!/usr/bin/env tsx

/**
 * Script de Migração Inicial de Dados
 * 
 * Importa dados dos CSVs históricos para popular o banco de dados inicial.
 * Executa UMA VEZ para migração de dados legados.
 * 
 * Ordem de processamento:
 * 1. HSI Inventário (ativos principais)
 * 2. Entradas (movimentações IN)
 * 3. Saídas (movimentações OUT)
 * 4. Balanço (ajustes de estoque)
 */

import { PrismaClient } from '@estoque-hsi/db';
import * as fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import * as chardet from 'chardet';
import * as path from 'path';

const prisma = new PrismaClient();

interface MigrationStats {
  assetsCreated: number;
  assetsUpdated: number;
  movementsCreated: number;
  categoriesCreated: number;
  locationsCreated: number;
  manufacturersCreated: number;
  errors: Array<{ file: string; row: number; error: string }>;
}

const stats: MigrationStats = {
  assetsCreated: 0,
  assetsUpdated: 0,
  movementsCreated: 0,
  categoriesCreated: 0,
  locationsCreated: 0,
  manufacturersCreated: 0,
  errors: [],
};

// Cache para evitar buscas repetidas
const cache = {
  categories: new Map<string, string>(),
  locations: new Map<string, string>(),
  manufacturers: new Map<string, string>(),
  assets: new Map<string, string>(),
};

/**
 * Detecta encoding do arquivo
 */
async function detectEncoding(filePath: string): Promise<BufferEncoding> {
  const buffer = await fs.readFile(filePath);
  const detected = chardet.detect(buffer);
  
  // Mapear para BufferEncoding válido
  if (detected === 'ISO-8859-1' || detected === 'windows-1252') {
    return 'latin1';
  }
  return 'utf-8';
}

/**
 * Lê e parseia CSV com encoding correto
 * @param filePath Caminho do arquivo CSV
 * @param skipRows Número de linhas a pular ANTES do header (linhas vazias/título)
 */
async function readCSV(filePath: string, skipRows: number = 0): Promise<any[]> {
  const encoding = await detectEncoding(filePath);
  console.log(`   Encoding detectado: ${encoding}`);
  
  const content = await fs.readFile(filePath, encoding);
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== ''); // Remove apenas linhas completamente vazias
  
  // Pular linhas vazias/título conforme especificado
  const relevantLines = lines.slice(skipRows);
  const rejoinedContent = relevantLines.join('\n');
  
  // Parse sem columns para ter arrays
  const rawRecords = parse(rejoinedContent, {
    delimiter: ';',
    trim: true,
    relax_column_count: true,
    skip_empty_lines: false,
  }) as string[][];
  
  if (rawRecords.length === 0) return [];
  
  // Primeira linha é o cabeçalho
  const header = rawRecords[0];
  
  // Se o primeiro elemento do header for vazio, remove (coluna vazia no início)
  const hasEmptyFirstColumn = header[0] === '' || !header[0];
  const cleanHeader = hasEmptyFirstColumn ? header.slice(1) : header;
  
  // Mapear demais linhas
  const records = rawRecords.slice(1).map(row => {
    const dataRow = hasEmptyFirstColumn ? row.slice(1) : row;
    const obj: Record<string, string> = {};
    cleanHeader.forEach((colName, index) => {
      obj[colName] = dataRow[index] || '';
    });
    return obj;
  });
  
  return records;
}

/**
 * Busca ou cria categoria
 */
async function getOrCreateCategory(name: string): Promise<string> {
  if (!name || name.trim() === '' || name === 'N/A') {
    // Categoria padrão
    const defaultName = 'Sem Categoria';
    if (cache.categories.has(defaultName)) {
      return cache.categories.get(defaultName)!;
    }
    
    let category = await prisma.category.findFirst({
      where: { name: defaultName },
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: { name: defaultName, description: 'Categoria padrão para itens não classificados' },
      });
      stats.categoriesCreated++;
    }
    
    cache.categories.set(defaultName, category.id);
    return category.id;
  }
  
  const normalizedName = name.trim();
  
  if (cache.categories.has(normalizedName)) {
    return cache.categories.get(normalizedName)!;
  }
  
  let category = await prisma.category.findFirst({
    where: { name: normalizedName },
  });
  
  if (!category) {
    category = await prisma.category.create({
      data: { name: normalizedName },
    });
    stats.categoriesCreated++;
    console.log(`   ✓ Categoria criada: ${normalizedName}`);
  }
  
  cache.categories.set(normalizedName, category.id);
  return category.id;
}

/**
 * Busca ou cria localização
 */
async function getOrCreateLocation(name: string): Promise<string> {
  if (!name || name.trim() === '' || name === 'N/A') {
    const defaultName = 'Não Especificado';
    if (cache.locations.has(defaultName)) {
      return cache.locations.get(defaultName)!;
    }
    
    let location = await prisma.location.findFirst({
      where: { name: defaultName },
    });
    
    if (!location) {
      location = await prisma.location.create({
        data: { name: defaultName },
      });
      stats.locationsCreated++;
    }
    
    cache.locations.set(defaultName, location.id);
    return location.id;
  }
  
  const normalizedName = name.trim();
  
  if (cache.locations.has(normalizedName)) {
    return cache.locations.get(normalizedName)!;
  }
  
  let location = await prisma.location.findFirst({
    where: { name: normalizedName },
  });
  
  if (!location) {
    location = await prisma.location.create({
      data: { name: normalizedName },
    });
    stats.locationsCreated++;
    console.log(`   ✓ Localização criada: ${normalizedName}`);
  }
  
  cache.locations.set(normalizedName, location.id);
  return location.id;
}

/**
 * Busca ou cria fabricante
 */
async function getOrCreateManufacturer(name: string): Promise<string> {
  if (!name || name.trim() === '' || name === 'N/A') {
    const defaultName = 'Desconhecido';
    if (cache.manufacturers.has(defaultName)) {
      return cache.manufacturers.get(defaultName)!;
    }
    
    let manufacturer = await prisma.manufacturer.findFirst({
      where: { name: defaultName },
    });
    
    if (!manufacturer) {
      manufacturer = await prisma.manufacturer.create({
        data: { name: defaultName },
      });
      stats.manufacturersCreated++;
    }
    
    cache.manufacturers.set(defaultName, manufacturer.id);
    return manufacturer.id;
  }
  
  const normalizedName = name.trim();
  
  if (cache.manufacturers.has(normalizedName)) {
    return cache.manufacturers.get(normalizedName)!;
  }
  
  let manufacturer = await prisma.manufacturer.findFirst({
    where: { name: normalizedName },
  });
  
  if (!manufacturer) {
    manufacturer = await prisma.manufacturer.create({
      data: { name: normalizedName },
    });
    stats.manufacturersCreated++;
    console.log(`   ✓ Fabricante criado: ${normalizedName}`);
  }
  
  cache.manufacturers.set(normalizedName, manufacturer.id);
  return manufacturer.id;
}

/**
 * Processa HSI Inventário (ativos principais)
 */
async function processInventario() {
  console.log('\n📦 STEP 1: Processando HSI Inventário...');
  
  const filePath = path.join(process.cwd(), 'dados_CSV', 'HSI Inventário(HSI Inventário 02-07-2025).csv');
  const records = await readCSV(filePath);
  
  console.log(`   Total de registros: ${records.length}`);
  
  // Buscar usuário admin
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@hsi.local' } });
  if (!adminUser) {
    throw new Error('Usuário admin não encontrado. Execute o seed primeiro: npx tsx packages/db/prisma/seed.ts');
  }
  const userId = adminUser.id;
  
  let processed = 0;
  
  for (const record of records) {
    try {
      // Verificar se linha está vazia
      const values = Object.values(record).filter(v => v && String(v).trim() !== '');
      if (values.length === 0) continue;
      
      const patrimonio = record['Patrimônio']?.trim();
      const hostname = record['Hostname']?.trim();
      const serialNumber = record['Serial Number CPU']?.trim();
      
      // Precisa ter pelo menos um identificador
      if (!patrimonio && !hostname && !serialNumber) {
        continue;
      }
      
      const locationName = record['Localização']?.trim() || 'Não Especificado';
      const manufacturerName = record['Fabricante']?.trim() || 'Desconhecido';
      const model = record['Modelo']?.trim() || '';
      
      // Determinar categoria pelo tipo de chassi
      const chassiType = record['Tipo de chassi']?.toLowerCase() || '';
      let categoryName = 'Computador';
      if (chassiType.includes('notebook') || chassiType.includes('laptop')) {
        categoryName = 'Notebook';
      } else if (chassiType.includes('desktop')) {
        categoryName = 'Desktop';
      }
      
      // Buscar ou criar entidades relacionadas
      const categoryId = await getOrCreateCategory(categoryName);
      const locationId = await getOrCreateLocation(locationName);
      const manufacturerId = await getOrCreateManufacturer(manufacturerName);
      
      // Verificar se ativo já existe
      const existing = await prisma.asset.findFirst({
        where: {
          OR: [
            patrimonio ? { assetTag: patrimonio } : {},
            serialNumber ? { serialNumber: serialNumber } : {},
          ].filter(obj => Object.keys(obj).length > 0),
        },
      });
      
      if (existing) {
        // Atualizar
        await prisma.asset.update({
          where: { id: existing.id },
          data: {
            name: hostname || existing.name,
            categoryId,
            locationId,
            manufacturerId,
            model: model || existing.model,
            status: 'EM_USO',
          },
        });
        stats.assetsUpdated++;
        cache.assets.set(patrimonio || serialNumber || hostname, existing.id);
      } else {
        // Criar
        const asset = await prisma.asset.create({
          data: {
            name: hostname || `Computador ${patrimonio || serialNumber}`,
            assetTag: patrimonio || serialNumber || `AUTO-${Date.now()}`,
            serialNumber: serialNumber || null,
            categoryId,
            locationId,
            manufacturerId,
            model: model || null,
            status: 'EM_USO',
            createdById: userId,
          },
        });
        stats.assetsCreated++;
        cache.assets.set(patrimonio || serialNumber || hostname, asset.id);
      }
      
      processed++;
      if (processed % 100 === 0) {
        console.log(`   Processados: ${processed}/${records.length}`);
      }
      
    } catch (error: any) {
      stats.errors.push({
        file: 'HSI Inventário',
        row: processed + 2,
        error: error?.message || String(error),
      });
    }
  }
  
  console.log(`   ✅ Concluído: ${stats.assetsCreated} criados, ${stats.assetsUpdated} atualizados`);
}

/**
 * Processa Entradas
 */
async function processEntradas() {
  console.log('\n📥 STEP 2: Processando Entradas...');
  
  const filePath = path.join(process.cwd(), 'dados_CSV', 'Estoque_HSI(Entrada).csv');
  const records = await readCSV(filePath, 2); // Pula 2 linhas de cabeçalho
  
  console.log(`   Total de registros: ${records.length}`);
  
  let processed = 0;
  let skipped = 0;
  const userId = (await prisma.user.findFirst({ where: { email: 'admin@hsi.local' } }))?.id;
  
  if (!userId) {
    console.log('   ⚠️  Usuário admin não encontrado. Pulando movimentações.');
    return;
  }
  
    for (const record of records) {
    try {
      // Verificar se linha está vazia ou só tem "encontrado"
      const values = Object.values(record).filter(v => v && String(v).trim() !== '');
      if (values.length === 0 || (values.length === 1 && String(values[0]).includes('encontrado'))) {
        continue;
      }
      
      const itemName = record['Item']?.trim();
      const patrimonio = record['Patrimônio']?.trim();
      const serialNumber = record['Serial Number/Service Tag']?.trim();
      const quantidade = parseInt(record['Quantidade']?.trim() || '1');
      const dataEntrada = record['Data de Entrada']?.trim();
      const observacao = record['Observação/Recebido por:']?.trim();
      
      if (!itemName) {
        if (processed === 0) {
          console.log(`   ⚠️  Primeira linha sem item. Colunas: ${Object.keys(record).join(', ')}`);
          console.log(`   ⚠️  Record: ${JSON.stringify(record)}`);
        }
        continue;
      }
      
      // Determinar categoria pelo nome do item
      const categoryId = await getOrCreateCategory(itemName);
      const locationId = await getOrCreateLocation('Estoque');
      const manufacturerId = await getOrCreateManufacturer('Desconhecido');
      
      // Buscar ou criar ativo
      let assetId: string;
      
      // Se tem patrimônio válido, buscar se já existe
      if (patrimonio && patrimonio !== 'N/A') {
        const existing = await prisma.asset.findFirst({
          where: { assetTag: patrimonio },
        });
        
        if (existing) {
          assetId = existing.id;
        } else {
          // Criar ativo com patrimônio
          const asset = await prisma.asset.create({
            data: {
              name: itemName,
              assetTag: patrimonio,
              serialNumber: serialNumber !== 'N/A' ? serialNumber : null,
              categoryId,
              locationId,
              manufacturerId,
              status: 'EM_ESTOQUE',
              createdById: userId,
            },
          });
          assetId = asset.id;
          stats.assetsCreated++;
        }
      } else {
        // Item sem patrimônio - criar sempre (para itens de estoque como mouse, teclado, etc.)
        const asset = await prisma.asset.create({
          data: {
            name: itemName,
            assetTag: `EST-${itemName.substring(0, 3).toUpperCase()}-${Date.now()}-${processed}`,
            serialNumber: serialNumber !== 'N/A' ? serialNumber : null,
            categoryId,
            locationId,
            manufacturerId,
            status: 'EM_ESTOQUE',
            createdById: userId,
          },
        });
        assetId = asset.id;
        stats.assetsCreated++;
      }
      
      // Criar movimentação de entrada
      await prisma.movement.create({
        data: {
          assetId,
          userId,
          type: 'CHECK_IN',
          reason: observacao || `Entrada registrada em ${dataEntrada || 'data não informada'}`,
          movedAt: dataEntrada ? new Date(dataEntrada.split('/').reverse().join('-')) : new Date(),
        },
      });
      stats.movementsCreated++;
      
      processed++;
      if (processed % 50 === 0) {
        console.log(`   Processados: ${processed}/${records.length} (${skipped} ignorados)`);
      }
      
    } catch (error: any) {
      stats.errors.push({
        file: 'Entradas',
        row: processed + 4,
        error: error?.message || String(error),
      });
    }
  }
  
  console.log(`   ✅ Concluído: ${stats.movementsCreated} movimentações criadas`);
  console.log(`   📝 ${skipped} linhas ignoradas (vazias ou só com "encontrado")`);
}

/**
 * Validação final dos dados importados
 */
async function validateData() {
  console.log('\n🔍 STEP 3: Validando dados importados...');
  
  const validation = {
    totalAssets: 0,
    assetsWithoutCategory: 0,
    assetsWithoutLocation: 0,
    assetsWithoutManufacturer: 0,
    assetsWithoutTag: 0,
    duplicateTags: [] as string[],
    totalMovements: 0,
    totalCategories: 0,
    totalLocations: 0,
    totalManufacturers: 0,
  };
  
  // Contar totais
  validation.totalAssets = await prisma.asset.count();
  validation.totalMovements = await prisma.movement.count();
  validation.totalCategories = await prisma.category.count();
  validation.totalLocations = await prisma.location.count();
  validation.totalManufacturers = await prisma.manufacturer.count();
  
  // Validar integridade
  validation.assetsWithoutCategory = await prisma.asset.count({
    where: { categoryId: null },
  });
  
  validation.assetsWithoutLocation = await prisma.asset.count({
    where: { locationId: null },
  });
  
  validation.assetsWithoutManufacturer = await prisma.asset.count({
    where: { manufacturerId: null },
  });
  
  validation.assetsWithoutTag = await prisma.asset.count({
    where: { assetTag: null },
  });
  
  // Buscar tags duplicadas
  const duplicates = await prisma.$queryRaw<Array<{ assetTag: string; count: bigint }>>`
    SELECT "assetTag", COUNT(*) as count
    FROM assets
    WHERE "assetTag" IS NOT NULL
    GROUP BY "assetTag"
    HAVING COUNT(*) > 1
  `;
  
  validation.duplicateTags = duplicates.map(d => `${d.assetTag} (${d.count} vezes)`);
  
  console.log(`   📊 Total de ativos: ${validation.totalAssets}`);
  console.log(`   📊 Total de movimentações: ${validation.totalMovements}`);
  console.log(`   📊 Total de categorias: ${validation.totalCategories}`);
  console.log(`   📊 Total de localizações: ${validation.totalLocations}`);
  console.log(`   📊 Total de fabricantes: ${validation.totalManufacturers}`);
  
  console.log(`\n   🔍 Validação de integridade:`);
  
  if (validation.assetsWithoutCategory > 0) {
    console.log(`   ⚠️  ${validation.assetsWithoutCategory} ativos sem categoria`);
  } else {
    console.log(`   ✅ Todos os ativos têm categoria`);
  }
  
  if (validation.assetsWithoutLocation > 0) {
    console.log(`   ⚠️  ${validation.assetsWithoutLocation} ativos sem localização`);
  } else {
    console.log(`   ✅ Todos os ativos têm localização`);
  }
  
  if (validation.assetsWithoutManufacturer > 0) {
    console.log(`   ⚠️  ${validation.assetsWithoutManufacturer} ativos sem fabricante`);
  } else {
    console.log(`   ✅ Todos os ativos têm fabricante`);
  }
  
  if (validation.assetsWithoutTag > 0) {
    console.log(`   ⚠️  ${validation.assetsWithoutTag} ativos sem tag`);
  } else {
    console.log(`   ✅ Todos os ativos têm tag`);
  }
  
  if (validation.duplicateTags.length > 0) {
    console.log(`   ⚠️  ${validation.duplicateTags.length} tags duplicadas:`);
    validation.duplicateTags.slice(0, 5).forEach(tag => {
      console.log(`      - ${tag}`);
    });
    if (validation.duplicateTags.length > 5) {
      console.log(`      ... e mais ${validation.duplicateTags.length - 5}`);
    }
  } else {
    console.log(`   ✅ Nenhuma tag duplicada`);
  }
  
  return validation;
}

/**
 * Processa Saídas
 */
async function processSaidas() {
  console.log('\n📤 STEP 3: Processando Saídas...');
  
  const filePath = path.join(process.cwd(), 'dados_CSV', 'Estoque_HSI(Saída).csv');
  const records = await readCSV(filePath, 2);
  
  console.log(`   Total de registros: ${records.length}`);
  
  let processed = 0;
  const userId = (await prisma.user.findFirst({ where: { email: 'admin@hsi.local' } }))?.id;
  
  if (!userId) {
    console.log('   ⚠️  Usuário admin não encontrado. Pulando movimentações.');
    return;
  }
  
  for (const record of records) {
    try {
      const values = Object.values(record).filter(v => v && String(v).trim() !== '');
      if (values.length === 0) continue;
      
      const itemName = record['Item']?.trim();
      const patrimonio = record['Patrimônio']?.trim();
      const serialNumber = record['Serial Number/Service Tag']?.trim();
      const quantidade = parseInt(record['Quantidade']?.trim() || '1');
      const dataSaida = record['Data de Saída']?.trim();
      const usuarioSetor = record['Usuário/Setor']?.trim();
      const observacao = record['Observação']?.trim();
      const retiradoPor = record['Retirado por:']?.trim();
      
      if (!itemName) {
        if (processed === 0) {
          console.log(`   ⚠️  Primeira linha sem item. Colunas: ${Object.keys(record).join(', ')}`);
          console.log(`   ⚠️  Record: ${JSON.stringify(record).substring(0, 200)}`);
        }
        continue;
      }
      
      const categoryId = await getOrCreateCategory(itemName);
      const locationId = await getOrCreateLocation(usuarioSetor || 'Desconhecido');
      const manufacturerId = await getOrCreateManufacturer('Desconhecido');
      
      let assetId: string;
      
      if (patrimonio && patrimonio !== 'N/A') {
        const existing = await prisma.asset.findFirst({
          where: { assetTag: patrimonio },
        });
        
        if (existing) {
          assetId = existing.id;
          await prisma.asset.update({
            where: { id: assetId },
            data: { 
              status: 'EM_USO',
              locationId,
            },
          });
          stats.assetsUpdated++;
        } else {
          const newAsset = await prisma.asset.create({
            data: {
              name: itemName,
              assetTag: patrimonio,
              categoryId,
              locationId,
              manufacturerId,
              serialNumber: serialNumber !== 'N/A' ? serialNumber : undefined,
              status: 'EM_USO',
              createdById: userId,
            },
          });
          assetId = newAsset.id;
          stats.assetsCreated++;
        }
      } else {
        const tag = `AUTO-${itemName.substring(0, 10).toUpperCase()}-${Date.now()}-${processed}`;
        const newAsset = await prisma.asset.create({
          data: {
            name: itemName,
            assetTag: tag,
            categoryId,
            locationId,
            manufacturerId,
            serialNumber: serialNumber !== 'N/A' ? serialNumber : undefined,
            status: 'EM_USO',
            createdById: userId,
          },
        });
        assetId = newAsset.id;
        stats.assetsCreated++;
      }
      
      let movementDate = new Date();
      if (dataSaida) {
        const [day, month, year] = dataSaida.split('/');
        if (day && month && year) {
          movementDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
      
      await prisma.movement.create({
        data: {
          assetId,
          userId,
          type: 'CHECK_OUT',
          fromLocationId: locationId,
          toLocation: usuarioSetor || 'Desconhecido',
          movedAt: movementDate,
          reason: [observacao, retiradoPor].filter(Boolean).join(' | '),
        },
      });
      
      stats.movementsCreated++;
      processed++;
      
      if (processed % 50 === 0) {
        console.log(`   Processados: ${processed}/${records.length}`);
      }
    } catch (error) {
      stats.errors.push({
        file: 'Saída',
        row: processed,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
  
  console.log(`   ✅ Concluído: ${stats.movementsCreated - stats.movementsCreated + processed} movimentações criadas`);
}

/**
 * Processa Estoque Clausura
 */
async function processEstoqueClausura() {
  console.log('\n🏪 STEP 4: Processando Estoque Clausura...');
  
  const filePath = path.join(process.cwd(), 'dados_CSV', 'Estoque_HSI(Estoque Clausura).csv');
  const records = await readCSV(filePath, 1);
  
  console.log(`   Total de registros: ${records.length}`);
  
  let processed = 0;
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@hsi.local' } });
  
  if (!adminUser) {
    console.log('   ⚠️  Usuário admin não encontrado. Pulando processamento.');
    return;
  }
  
  for (const record of records) {
    try {
      const itemName = record['Item']?.trim();
      const quantidade = parseInt(record['Quantidade']?.trim() || '0');
      const patrimonio = record['Patrimônio']?.trim();
      const serialNumber = record['S/N ou S/T']?.trim();
      const observacao = record['Observação']?.trim();
      
      if (!itemName || quantidade === 0) {
        if (processed === 0) {
          console.log(`   ⚠️  Primeira linha sem item. Colunas: ${Object.keys(record).join(', ')}`);
          console.log(`   ⚠️  Record: ${JSON.stringify(record).substring(0, 200)}`);
        }
        continue;
      }
      
      const categoryId = await getOrCreateCategory(itemName);
      const locationId = await getOrCreateLocation('Clausura');
      const manufacturerId = await getOrCreateManufacturer('Desconhecido');
      
      // Criar ou atualizar múltiplos ativos (baseado na quantidade)
      for (let i = 0; i < quantidade; i++) {
        const tag = patrimonio && patrimonio !== '' 
          ? `${patrimonio}-${i + 1}` 
          : `CLAUS-${itemName.substring(0, 10).toUpperCase()}-${Date.now()}-${processed}-${i}`;
        
        await prisma.asset.create({
          data: {
            name: itemName,
            assetTag: tag,
            categoryId,
            locationId,
            manufacturerId,
            serialNumber: serialNumber || undefined,
            status: 'EM_ESTOQUE',
            observations: `Clausura: ${observacao || ''}`,
            createdById: adminUser.id,
          },
        });
        
        stats.assetsCreated++;
      }
      
      processed++;
      
      if (processed % 10 === 0) {
        console.log(`   Processados: ${processed}/${records.length}`);
      }
    } catch (error) {
      stats.errors.push({
        file: 'Estoque Clausura',
        row: processed,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
  
  console.log(`   ✅ Concluído: ${processed} itens processados`);
}

/**
 * Processa Balanço de Estoque
 */
async function processBalanco() {
  console.log('\n⚖️  STEP 5: Processando Balanço de Estoque...');
  
  const filePath = path.join(process.cwd(), 'dados_CSV', 'Estoque_HSI(Balanço Estoque).csv');
  const records = await readCSV(filePath, 2);
  
  console.log(`   Total de registros: ${records.length}`);
  console.log(`   ℹ️  Balanço é apenas informativo - já processamos entradas/saídas`);
  
  let processed = 0;
  const report: Array<{item: string, entradas: number, saidas: number, estoque: number, fisico: number}> = [];
  
  for (const record of records) {
    try {
      const itemName = record['Item']?.trim();
      const entradas = parseInt(record['Entradas']?.trim() || '0');
      const saidas = parseInt(record['Saídas']?.trim() || '0');
      const estoque = parseInt(record['Quantidade em estoque']?.trim() || '0');
      const validacao = parseInt(record['Validação estoque']?.trim() || '0');
      
      if (!itemName) continue;
      
      report.push({
        item: itemName,
        entradas,
        saidas,
        estoque,
        fisico: validacao,
      });
      
      processed++;
    } catch (error) {
      stats.errors.push({
        file: 'Balanço',
        row: processed,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
  
  console.log(`   ✅ Concluído: ${processed} itens analisados`);
  
  // Mostrar divergências
  const divergencias = report.filter(r => r.estoque !== r.fisico && r.fisico > 0);
  if (divergencias.length > 0) {
    console.log(`\n   ⚠️  ${divergencias.length} itens com divergência estoque x físico:`);
    divergencias.slice(0, 5).forEach(d => {
      console.log(`      ${d.item}: Esperado ${d.estoque}, Físico ${d.fisico}`);
    });
    if (divergencias.length > 5) {
      console.log(`      ... e mais ${divergencias.length - 5}`);
    }
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Iniciando migração de dados...\n');
  console.log('⚠️  ATENÇÃO: Este script deve ser executado UMA VEZ apenas!');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    // Step 1: Inventário
    await processInventario();
    
    // Step 2: Entradas
    await processEntradas();
    
    // Step 3: Saídas
    await processSaidas();
    
    // Step 4: Estoque Clausura
    await processEstoqueClausura();
    
    // Step 5: Balanço
    await processBalanco();
    
    // Step 6: Validação
    await validateData();
    
    // Relatório final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RELATÓRIO FINAL:');
    console.log(`   Ativos criados: ${stats.assetsCreated}`);
    console.log(`   Ativos atualizados: ${stats.assetsUpdated}`);
    console.log(`   Movimentações criadas: ${stats.movementsCreated}`);
    console.log(`   Categorias criadas: ${stats.categoriesCreated}`);
    console.log(`   Localizações criadas: ${stats.locationsCreated}`);
    console.log(`   Fabricantes criados: ${stats.manufacturersCreated}`);
    console.log(`   Erros encontrados: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ ERROS:');
      stats.errors.slice(0, 10).forEach(err => {
        console.log(`   ${err.file} linha ${err.row}: ${err.error}`);
      });
      if (stats.errors.length > 10) {
        console.log(`   ... e mais ${stats.errors.length - 10} erros`);
      }
    }
    
    console.log('\n✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro fatal na migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
