# Script para abrir portas do firewall para acesso mobile
# Execute como Administrador

Write-Host "Configurando Firewall do Windows..." -ForegroundColor Cyan

# Verifica se já existe a regra
$ruleExists = Get-NetFirewallRule -DisplayName "HSI Stock - Next.js" -ErrorAction SilentlyContinue

if ($ruleExists) {
    Write-Host "Removendo regras antigas..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "HSI Stock - Next.js" -ErrorAction SilentlyContinue
    Remove-NetFirewallRule -DisplayName "HSI Stock - API" -ErrorAction SilentlyContinue
}

# Cria novas regras
Write-Host "Criando regras de firewall..." -ForegroundColor Yellow

New-NetFirewallRule `
    -DisplayName "HSI Stock - Next.js" `
    -Direction Inbound `
    -LocalPort 3000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Domain,Private `
    -Description "Permite acesso ao frontend Next.js do HSI Stock na rede local"

New-NetFirewallRule `
    -DisplayName "HSI Stock - API" `
    -Direction Inbound `
    -LocalPort 3001 `
    -Protocol TCP `
    -Action Allow `
    -Profile Domain,Private `
    -Description "Permite acesso à API do HSI Stock na rede local"

Write-Host "`n✓ Firewall configurado com sucesso!" -ForegroundColor Green
Write-Host "`nAgora você pode acessar pelo celular:" -ForegroundColor Cyan
Write-Host "http://10.30.1.8:3000" -ForegroundColor Green

Read-Host "`nPressione ENTER para fechar"
