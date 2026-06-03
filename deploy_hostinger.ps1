# deploy_hostinger.ps1
# Script de empaquetado para despliegue en Hostinger
# Ejecutar desde: CONTROL_DE_ADQUISICIONES_PRESUPUESTO_INCIDENCIASv4\

$FRONTEND = ".\frontend"
$DIST = ".\dist_hostinger"

Write-Host "=== Preparando paquete para Hostinger ===" -ForegroundColor Cyan

# 1. Build
Write-Host "`n[1/4] Compilando Next.js..." -ForegroundColor Yellow
Set-Location $FRONTEND
npx next build
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FALLIDO" -ForegroundColor Red; exit 1 }
Set-Location ..

# 2. Limpiar dist anterior
if (Test-Path $DIST) { Remove-Item $DIST -Recurse -Force }
New-Item -ItemType Directory -Path $DIST | Out-Null

# 3. Copiar archivos standalone
Write-Host "`n[2/4] Copiando archivos standalone..." -ForegroundColor Yellow
Copy-Item "$FRONTEND\.next\standalone\*" $DIST -Recurse
Copy-Item "$FRONTEND\.next\static" "$DIST\.next\static" -Recurse
if (Test-Path "$FRONTEND\public") {
    Copy-Item "$FRONTEND\public" "$DIST\public" -Recurse
}

# 4. Copiar config PM2 y .env.production
Copy-Item "$FRONTEND\ecosystem.config.js" $DIST
if (Test-Path "$FRONTEND\.env.production") {
    Copy-Item "$FRONTEND\.env.production" $DIST
}

# 5. Crear .env si no existe .env.production
if (-not (Test-Path "$DIST\.env")) {
    Write-Host "`n[3/4] Copiando .env..." -ForegroundColor Yellow
    Copy-Item "$FRONTEND\.env" "$DIST\.env"
}

# 6. Comprimir
Write-Host "`n[4/4] Comprimiendo paquete..." -ForegroundColor Yellow
Compress-Archive -Path "$DIST\*" -DestinationPath ".\rado_hostinger.zip" -Force

Write-Host "`n=== LISTO ===" -ForegroundColor Green
Write-Host "Paquete generado: rado_hostinger.zip" -ForegroundColor Green
Write-Host ""
Write-Host "PASOS EN HOSTINGER:" -ForegroundColor Cyan
Write-Host "  1. Subir rado_hostinger.zip via FTP/File Manager"
Write-Host "  2. Descomprimir en /home/u_XXXXX/public_html/"
Write-Host "  3. Configurar variables de entorno en el panel de Hostinger"
Write-Host "     - DB_PASSWORD = SxucXihjIVEMUCAD"
Write-Host "  4. En el panel Node.js de Hostinger, apuntar Entry Point a: server.js"
Write-Host "  5. Iniciar la aplicacion"
