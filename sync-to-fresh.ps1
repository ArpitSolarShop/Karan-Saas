# ⚡ SYNC-TO-FRESH.PS1
# This script syncs your projects to the Fresh PC and restarts the backend.

$PRIMARY_PATH = "C:\Users\arpit\OneDrive\Desktop\Karan Saas"
$FRESH_IP = "192.168.1.17"
$FRESH_USER = "arpit solar 3"
$FRESH_PATH = "C:\Users\Arpit Solar 3\Desktop\Karan Saas"

Write-Host "🚀 Starting Sync to Fresh PC ($FRESH_IP)..." -ForegroundColor Cyan

# 1. Ensure the directory exists on Fresh PC
Write-Host "📂 Creating directory on Fresh PC..."
& "C:\Windows\System32\OpenSSH\ssh.exe" "$FRESH_USER@$FRESH_IP" "if not exist '$FRESH_PATH' mkdir '$FRESH_PATH'"

# 2. Syncing files (Excluding node_modules to save time)
Write-Host "📦 Syncing code (Excluding node_modules)..."
robocopy "$PRIMARY_PATH" "\\$FRESH_IP\C$\Users\Arpit Solar 3\Desktop\Karan Saas" /MIR /XD "node_modules" ".next" ".git" "dist"

# 3. Restart Docker on Fresh PC
Write-Host "🔄 Restarting Backend on Fresh PC..."
& "C:\Windows\System32\OpenSSH\ssh.exe" "$FRESH_USER@$FRESH_IP" "powershell -Command { cd '$FRESH_PATH' ; docker compose down ; docker compose up -d }"

Write-Host "✅ SYNC COMPLETE! Backend is live at http://$FRESH_IP:5000" -ForegroundColor Green
