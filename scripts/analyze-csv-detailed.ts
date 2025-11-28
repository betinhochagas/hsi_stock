import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import * as chardet from 'chardet';

const filePath = 'HSI Inventário.csv';

console.log(`\n📊 Análise detalhada do CSV\n`);

// Detectar encoding
const buffer = readFileSync(filePath);
const detectedEncoding = chardet.detect(buffer);
const encoding = detectedEncoding?.toLowerCase().includes('utf') ? 'utf-8' : 'latin1';

console.log(`Encoding: ${detectedEncoding} -> usando ${encoding}`);

// Ler conteúdo
const content = readFileSync(filePath, encoding as BufferEncoding);

// Parse com csv-parse
try {
  const records = parse(content, {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
    skip_records_with_empty_values: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`\n✅ Parse com skip_records_with_empty_values: ${records.length} registros\n`);

  // Analisar registros vazios ou problemáticos
  let completelyEmpty = 0;
  let missingPatrimonioHostname = 0;
  let missingAllIdentifiers = 0;
  const problematicRows: number[] = [];

  records.forEach((record: any, index: number) => {
    const patrimonio = record['Patrimônio']?.trim();
    const hostname = record['Hostname']?.trim();
    const serialNumber = record['Serial Number CPU']?.trim();
    const localizacao = record['Localização']?.trim();

    // Verificar se está completamente vazio
    const hasAnyData = Object.values(record).some((v: any) => v && String(v).trim() !== '');
    
    if (!hasAnyData) {
      completelyEmpty++;
      problematicRows.push(index + 2); // +2 porque index é 0-based e tem header
    } else if (!patrimonio && !hostname && !serialNumber) {
      missingAllIdentifiers++;
      console.log(`Linha ${index + 2}: Sem identificadores - Localização: "${localizacao}"`);
    } else if (!patrimonio && !hostname) {
      missingPatrimonioHostname++;
    }
  });

  console.log(`\n📊 Estatísticas:`);
  console.log(`   Total parseado: ${records.length}`);
  console.log(`   Completamente vazios: ${completelyEmpty}`);
  console.log(`   Sem Patrimônio/Hostname: ${missingPatrimonioHostname}`);
  console.log(`   Sem nenhum identificador: ${missingAllIdentifiers}`);
  console.log(`   Registros válidos: ${records.length - completelyEmpty - missingAllIdentifiers}`);

  if (problematicRows.length > 0) {
    console.log(`\n⚠️  Linhas problemáticas: ${problematicRows.slice(0, 10).join(', ')}`);
  }

} catch (error) {
  console.error('❌ Erro ao parsear:', error);
}

// Parse SEM skip_records_with_empty_values
try {
  const recordsAll = parse(content, {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`\n📋 Parse SEM skip_records_with_empty_values: ${recordsAll.length} registros`);
  console.log(`   Diferença: ${recordsAll.length - 728} linhas`);

} catch (error) {
  console.error('❌ Erro ao parsear:', error);
}

console.log('\n✅ Análise concluída!\n');
