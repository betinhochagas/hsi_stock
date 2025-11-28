import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import * as chardet from 'chardet';

const filePath = 'HSI Inventário.csv';

console.log(`\n🔍 Analisando linha 729 (Agência Transfusional)\n`);

const buffer = readFileSync(filePath);
const detectedEncoding = chardet.detect(buffer);
const encoding = detectedEncoding?.toLowerCase().includes('utf') ? 'utf-8' : 'latin1';
const content = readFileSync(filePath, encoding as BufferEncoding);

// Parse COM skip (o que o sistema usa)
const recordsWithSkip = parse(content, {
  delimiter: ';',
  columns: true,
  skip_empty_lines: true,
  skip_records_with_empty_values: true,
  trim: true,
  relax_column_count: true,
});

// Parse SEM skip (todos os registros)
const recordsAll = parse(content, {
  delimiter: ';',
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
});

console.log(`Com skip_records_with_empty_values: ${recordsWithSkip.length} registros`);
console.log(`Sem skip_records_with_empty_values: ${recordsAll.length} registros`);
console.log(`Diferença: ${recordsAll.length - recordsWithSkip.length} linha(s)\n`);

// Encontrar a linha que foi filtrada
const filtered = recordsAll.filter((rec: any) => {
  return !recordsWithSkip.some((r: any) => 
    r['Patrimônio'] === rec['Patrimônio'] && 
    r['Hostname'] === rec['Hostname']
  );
});

console.log(`📋 Linha(s) filtrada(s):\n`);
filtered.forEach((rec: any, idx: number) => {
  console.log(`Registro ${idx + 1}:`);
  
  // Contar campos vazios
  const fields = Object.entries(rec);
  const emptyFields = fields.filter(([_, value]) => !value || String(value).trim() === '');
  const filledFields = fields.filter(([_, value]) => value && String(value).trim() !== '');
  
  console.log(`  Total de campos: ${fields.length}`);
  console.log(`  Campos preenchidos: ${filledFields.length}`);
  console.log(`  Campos vazios: ${emptyFields.length}`);
  console.log(`  % vazio: ${Math.round(emptyFields.length / fields.length * 100)}%\n`);
  
  console.log(`  Campos PREENCHIDOS:`);
  filledFields.forEach(([key, value]) => {
    console.log(`    - ${key}: "${value}"`);
  });
});

console.log('\n✅ Análise concluída!\n');
