#!/usr/bin/env pwsh
# Script para instalar dependências e preparar o projeto

Write-Host "🚀 Instalando Sistema de Estoque TI HSI..." -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "✓ Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js não encontrado. Instale Node.js >= 20.0.0" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Verificar npm
$npmVersion = npm --version
Write-Host "  npm: v$npmVersion" -ForegroundColor Green
Write-Host ""

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependências instaladas" -ForegroundColor Green
Write-Host ""

# Copiar .env.example para .env se não existir
if (-not (Test-Path .env)) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Arquivo .env criado. Configure as variáveis antes de continuar." -ForegroundColor Green
    Write-Host "  Edite o arquivo .env com suas configurações." -ForegroundColor Cyan
} else {
    Write-Host "✓ Arquivo .env já existe" -ForegroundColor Green
}
Write-Host ""

# Gerar Prisma Client
Write-Host "🗄️  Gerando Prisma Client..." -ForegroundColor Yellow
Set-Location packages/db
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar Prisma Client" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Set-Location ../..
Write-Host "✓ Prisma Client gerado" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Instalação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Configure o arquivo .env com suas credenciais" -ForegroundColor White
Write-Host "  2. Inicie o banco de dados: docker-compose up -d db redis" -ForegroundColor White
Write-Host "  3. Execute as migrações: npm run db:migrate" -ForegroundColor White
Write-Host "  4. Popule o banco: npm run db:seed" -ForegroundColor White
Write-Host "  5. Inicie o projeto: npm run dev" -ForegroundColor White
Write-Host ""
