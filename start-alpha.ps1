param (
    [switch]$InstallDeps = $false
)

Write-Host "=============================" -ForegroundColor Cyan
Write-Host " PROJECT ALPHA: STARTUP SCRIPT" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# 1. Start Docker Containers
Write-Host "`n[1/3] Starting Docker compose infrastructure..." -ForegroundColor Yellow
docker-compose up -d

# Wait for databases to initialize
Write-Host "Waiting 5 seconds for databases to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

# Optional Installation
if ($InstallDeps) {
    Write-Host "`n[*] Installing Backend Dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location

    Write-Host "`n[*] Installing Frontend Dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
}

# 2. Start Backend
Write-Host "`n[2/3] Starting NestJS Backend (Port 3001)..." -ForegroundColor Yellow
$BackendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$BackendPath'; npm run start:dev`"" -WindowStyle Normal

# 3. Start Frontend
Write-Host "`n[3/3] Starting Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
$FrontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$FrontendPath'; npm run dev`"" -WindowStyle Normal

Write-Host "`n=============================" -ForegroundColor Green
Write-Host " Startup Initiated!" -ForegroundColor Green
Write-Host " - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host " - Backend:  http://localhost:3001" -ForegroundColor White
Write-Host " - DB Admin: See Docker Desktop" -ForegroundColor White
Write-Host "=============================" -ForegroundColor Green
Write-Host "Close the spawned PowerShell windows to stop the servers." -ForegroundColor DarkGray
