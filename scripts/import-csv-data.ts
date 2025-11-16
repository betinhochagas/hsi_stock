import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente do .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

// Resolve path for CSVs in root directory
const rootDir = path.join(process.cwd());

interface EntradaRow {
  item: string;
  serialNumber: string;
  patrimonio: string;
  quantidade: string;
  dataEntrada: string;
  ticket: string;
  observacao: string;
}

interface SaidaRow {
  item: string;
  serialNumber: string;
  patrimonio: string;
  quantidade: string;
  dataSaida: string;
  ticket: string;
  observacao: string;
}

async function importarCSVs() {
  console.log('🚀 INICIANDO IMPORTAÇÃO DE DADOS CSV\n');

  try {
    // 1. Ler arquivo de Entrada
    console.log('📄 Processando: Estoque_HSI(Entrada).csv');
    const entradaPath = path.join(rootDir, 'Estoque_HSI(Entrada).csv');
    const entradaContent = fs.readFileSync(entradaPath, 'utf-8');
    
    // Remover linhas vazias e cabeçalhos
    const entradaLines = entradaContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith(';;;') && !line.startsWith(';ENTRADA'))
      .slice(1); // Remove header
    
    console.log(`   Linhas a processar: ${entradaLines.length}`);

    // 2. Ler arquivo de Saída
    console.log('\n📄 Processando: Estoque_HSI(Saída).csv');
    const saidaPath = path.join(rootDir, 'Estoque_HSI(Saída).csv');
    const saidaContent = fs.readFileSync(saidaPath, 'utf-8');
    
    const saidaLines = saidaContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith(';;;') && !line.startsWith(';SAÍDA'))
      .slice(1);
    
    console.log(`   Linhas a processar: ${saidaLines.length}`);

    // 3. Processar Entradas (CHECK_IN)
    console.log('\n⬇️  Importando ENTRADAS...');
    let entradasImportadas = 0;
    
    for (const line of entradaLines) {
      const cols = line.split(';');
      if (cols.length < 7 || !cols[1]?.trim()) continue;

      const item = cols[1]?.trim();
      const serialNumber = cols[2]?.trim();
      const patrimonio = cols[3]?.trim();
      const dataEntrada = cols[5]?.trim();
      const ticket = cols[6]?.trim();
      const observacao = cols[7]?.trim();

      if (!item) continue;

      try {
        // Buscar ou criar asset baseado no patrimônio ou nome
        let asset = null;
        
        if (patrimonio) {
          asset = await prisma.asset.findFirst({
            where: { assetTag: patrimonio }
          });
        }

        if (!asset) {
          // Buscar por nome similar
          asset = await prisma.asset.findFirst({
            where: {
              name: {
                contains: item.substring(0, 20)
              }
            }
          });
        }

        if (asset) {
          // Buscar localização "Almoxarifado TI"
          const almoxarifado = await prisma.location.findFirst({
            where: { 
              name: {
                contains: 'Almoxarifado'
              }
            }
          });

          // Criar movimentação de entrada
          await prisma.movement.create({
            data: {
              type: 'CHECK_IN',
              assetId: asset.id,
              fromLocationId: almoxarifado?.id,
              toLocation: 'Almoxarifado TI',
              reason: observacao || 'Entrada de estoque',
              ticketNumber: ticket || null,
              movedBy: 'Sistema - Importação CSV',
              movedAt: dataEntrada ? new Date(dataEntrada) : new Date()
            }
          });

          entradasImportadas++;
        }
      } catch (error: any) {
        console.log(`   ⚠️  Erro ao importar: ${item} - ${error.message}`);
      }
    }

    console.log(`   ✅ ${entradasImportadas} entradas importadas`);

    // 4. Processar Saídas (CHECK_OUT)
    console.log('\n⬆️  Importando SAÍDAS...');
    let saidasImportadas = 0;
    
    for (const line of saidaLines) {
      const cols = line.split(';');
      if (cols.length < 7 || !cols[1]?.trim()) continue;

      const item = cols[1]?.trim();
      const serialNumber = cols[2]?.trim();
      const patrimonio = cols[3]?.trim();
      const dataSaida = cols[5]?.trim();
      const ticket = cols[6]?.trim();
      const observacao = cols[7]?.trim();

      if (!item) continue;

      try {
        let asset = null;
        
        if (patrimonio) {
          asset = await prisma.asset.findFirst({
            where: { assetTag: patrimonio }
          });
        }

        if (!asset) {
          asset = await prisma.asset.findFirst({
            where: {
              name: {
                contains: item.substring(0, 20)
              }
            }
          });
        }

        if (asset) {
          // Buscar localização "Almoxarifado TI"
          const almoxarifado = await prisma.location.findFirst({
            where: { 
              name: {
                contains: 'Almoxarifado'
              }
            }
          });

          await prisma.movement.create({
            data: {
              type: 'CHECK_OUT',
              assetId: asset.id,
              fromLocationId: almoxarifado?.id,
              toLocation: observacao || 'Em uso',
              reason: observacao || 'Saída de estoque',
              ticketNumber: ticket || null,
              movedBy: 'Sistema - Importação CSV',
              movedAt: dataSaida ? new Date(dataSaida) : new Date()
            }
          });

          saidasImportadas++;
        }
      } catch (error: any) {
        console.log(`   ⚠️  Erro ao importar: ${item} - ${error.message}`);
      }
    }

    console.log(`   ✅ ${saidasImportadas} saídas importadas`);

    // 5. Validação final
    console.log('\n📊 VALIDAÇÃO FINAL');
    const totalMovements = await prisma.movement.count();
    const totalAssets = await prisma.asset.count();
    
    console.log(`   Total de movimentações no banco: ${totalMovements}`);
    console.log(`   Total de ativos no banco: ${totalAssets}`);
    console.log(`   Entradas importadas: ${entradasImportadas}`);
    console.log(`   Saídas importadas: ${saidasImportadas}`);
    console.log(`   Total importado: ${entradasImportadas + saidasImportadas}`);

    // Comparação
    const esperado = entradaLines.length + saidaLines.length;
    const importado = entradasImportadas + saidasImportadas;
    const percentual = ((importado / esperado) * 100).toFixed(1);

    console.log(`\n   📈 Taxa de importação: ${percentual}%`);
    console.log(`   (${importado} de ${esperado} linhas processadas)`);

    if (importado < esperado) {
      console.log(`\n   ⚠️  ${esperado - importado} linhas não foram importadas`);
      console.log(`   Motivo: Ativos não encontrados no banco (sem correspondência)`);
    }

    console.log('\n✅ IMPORTAÇÃO CONCLUÍDA!\n');

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar importação
importarCSVs()
  .then(() => {
    console.log('✅ Processo finalizado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
