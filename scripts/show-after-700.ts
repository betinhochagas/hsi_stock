import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import * as chardet from 'chardet';

const filePath = 'HSI Inventário.csv';

console.log(`\n📊 Verificando linhas após linha 700\n`);

// Detectar encoding
const buffer = readFileSync(filePath);
const detectedEncoding = chardet.detect(buffer);
const encoding = detectedEncoding?.toLowerCase().includes('utf') ? 'utf-8' : 'latin1';

const content = readFileSync(filePath, encoding as BufferEncoding);

// Parse completo
const records = parse(content, {
  delimiter: ';',
  columns: true,
  skip_empty_lines: true,
  skip_records_with_empty_values: true,
  trim: true,
  relax_column_count: true,
});

console.log(`Total de registros no CSV: ${records.length}`);
console.log(`Última linha visível no Excel: 700 (UCO)`);
console.log(`Diferença: ${records.length - 700} linhas\n`);

// Mostrar linhas após 700
console.log(`📋 Linhas de 695 a ${records.length} (últimas linhas):\n`);

for (let i = 694; i < records.length; i++) {
  const record = records[i];
  const rowNum = i + 2; // +1 para index 0-based, +1 para header
  const localizacao = record['Localização'] || '-';
  const hostname = record['Hostname'] || '-';
  const patrimonio = record['Patrimônio'] || '-';
  const serial = record['Serial Number CPU'] || '-';
  
  console.log(`Linha ${rowNum}: ${localizacao.substring(0, 30).padEnd(30)} | Host: ${hostname.substring(0, 20).padEnd(20)} | Pat: ${patrimonio.substring(0, 15)}`);
}

// Procurar pela linha 700 (UCO)
console.log(`\n🔍 Procurando linha 700 (UCO)...\n`);

const ucoIndex = records.findIndex((r: any) => 
  r['Localização']?.includes('UCO') || 
  r['Hostname']?.includes('UCO')
);

if (ucoIndex >= 0) {
  console.log(`✅ Encontrado UCO na linha ${ucoIndex + 2} (índice ${ucoIndex})`);
  console.log(`   Linhas APÓS UCO: ${records.length - ucoIndex - 1}`);
  
  console.log(`\n📋 Registros APÓS a linha UCO:\n`);
  for (let i = ucoIndex + 1; i < Math.min(ucoIndex + 31, records.length); i++) {
    const record = records[i];
    const rowNum = i + 2;
    const localizacao = record['Localização'] || '(vazio)';
    const hostname = record['Hostname'] || '(vazio)';
    const patrimonio = record['Patrimônio'] || '(vazio)';
    
    console.log(`${rowNum}. ${localizacao.substring(0, 30).padEnd(32)} | ${hostname.substring(0, 20).padEnd(22)} | ${patrimonio}`);
  }
} else {
  console.log('❌ Não encontrei UCO no arquivo');
}

console.log('\n✅ Análise concluída!\n');
