import { readFileSync } from 'fs';
import * as chardet from 'chardet';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: ts-node analyze-csv.ts <path-to-csv>');
  process.exit(1);
}

console.log(`\n📊 Analisando arquivo: ${filePath}\n`);

// Detectar encoding
const buffer = readFileSync(filePath);
const detectedEncoding = chardet.detect(buffer);
console.log(`🔤 Encoding detectado: ${detectedEncoding}`);

const encoding = detectedEncoding?.toLowerCase().includes('utf') ? 'utf-8' : 'latin1';
const content = readFileSync(filePath, encoding as BufferEncoding);

const lines = content.split('\n');
console.log(`\n📝 Total de linhas (split \\n): ${lines.length}`);

// Analisar linhas
let emptyLines = 0;
let headerLines = 0;
let dataLines = 0;
let problematicLines: number[] = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  if (trimmed === '' || trimmed === '\r') {
    emptyLines++;
    if (index > 10) { // Se linha vazia após as primeiras 10
      problematicLines.push(index + 1);
    }
  } else if (index === 0 || trimmed.includes('Localização') || trimmed.includes('Hostname')) {
    headerLines++;
  } else {
    dataLines++;
  }
});

console.log(`\n📋 Composição:`);
console.log(`   - Linhas de cabeçalho: ${headerLines}`);
console.log(`   - Linhas com dados: ${dataLines}`);
console.log(`   - Linhas vazias: ${emptyLines}`);
console.log(`   - Total esperado de registros: ${dataLines} (excluindo header)`);

if (problematicLines.length > 0) {
  console.log(`\n⚠️  Linhas vazias encontradas (primeiras 10):`);
  console.log(`   ${problematicLines.slice(0, 10).join(', ')}`);
  if (problematicLines.length > 10) {
    console.log(`   ... e mais ${problematicLines.length - 10} linhas vazias`);
  }
}

// Analisar primeira e última linha com dados
console.log(`\n🔍 Primeira linha (header):`);
console.log(`   ${lines[0].substring(0, 100)}...`);

console.log(`\n🔍 Última linha com dados (linha ${lines.length}):`);
const lastNonEmpty = lines.reverse().find(l => l.trim() !== '');
console.log(`   ${lastNonEmpty?.substring(0, 100) || '(vazia)'}...`);

// Detectar delimiter
const firstLine = lines[0];
const delimiters = [';', ',', '\t', '|'];
const counts = delimiters.map(d => ({
  delimiter: d,
  count: (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length,
}));
const bestDelimiter = counts.reduce((prev, current) =>
  current.count > prev.count ? current : prev
);

console.log(`\n🔧 Delimitador detectado: "${bestDelimiter.delimiter}" (${bestDelimiter.count} ocorrências)`);

// Contar colunas
const columns = firstLine.split(bestDelimiter.delimiter);
console.log(`\n📊 Número de colunas: ${columns.length}`);
console.log(`\n📋 Primeiras 5 colunas:`);
columns.slice(0, 5).forEach((col, i) => {
  console.log(`   ${i + 1}. ${col.trim()}`);
});

console.log('\n✅ Análise concluída!\n');
