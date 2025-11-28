$ErrorActionPreference = "Stop"

$loginBody = '{"email":"admin@hsi.local","password":"admin123"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"

$token = $loginResponse.access_token
Write-Host "Login OK - Token obtido" -ForegroundColor Green

Write-Host "`nBuscando categorias..." -ForegroundColor Cyan
$categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/categories?take=1000" -Headers @{ Authorization = "Bearer $token" }

Write-Host "`nRESULTADO:" -ForegroundColor Yellow
Write-Host "Total: $($categoriesResponse.total)"
Write-Host "Items retornados: $($categoriesResponse.items.Count)"

Write-Host "`nPrimeiras 10 categorias:" -ForegroundColor Cyan
$categoriesResponse.items | Select-Object -First 10 | ForEach-Object {
    Write-Host "- $($_.name)"
}
