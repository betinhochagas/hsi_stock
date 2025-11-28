# Script para testar API de categorias
$ErrorActionPreference = "Stop"

Write-Host "`n🔐 Fazendo login..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@hsi.local"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
    -Uri "http://localhost:3001/api/v1/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.access_token
Write-Host "✅ Token obtido: $($token.Substring(0,20))..." -ForegroundColor Green

Write-Host "`n📋 Buscando categorias..." -ForegroundColor Cyan
$headers = @{
    Authorization = "Bearer $token"
}

$categoriesResponse = Invoke-RestMethod `
    -Uri "http://localhost:3001/api/v1/categories?take=1000" `
    -Headers $headers

Write-Host "`n📊 RESULTADO:" -ForegroundColor Yellow
Write-Host "   Total no banco: $($categoriesResponse.total)" -ForegroundColor White
Write-Host "   Retornadas: $($categoriesResponse.items.Count)" -ForegroundColor White
Write-Host "   Skip: $($categoriesResponse.skip)" -ForegroundColor White
Write-Host "   Take: $($categoriesResponse.take)" -ForegroundColor White

Write-Host "`n📝 Primeiras 10 categorias:" -ForegroundColor Cyan
$categoriesResponse.items | Select-Object -First 10 | ForEach-Object {
    Write-Host "   - $($_.name) ($_count.assets ativos)" -ForegroundColor White
}

Write-Host "`n✅ API funcionando corretamente!`n" -ForegroundColor Green
