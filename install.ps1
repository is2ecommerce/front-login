# Script de instalación para PowerShell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Instalando dependencias del proyecto..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot
npm install

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Instalacion completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor de desarrollo:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Para hacer un build de produccion:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor White
Write-Host ""
