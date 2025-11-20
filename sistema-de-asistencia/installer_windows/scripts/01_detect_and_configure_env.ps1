Write-Host "Detectando IP local..."

$ip = (Get-NetIPAddress -AddressFamily IPv4 `
        | Where-Object { $_.IPAddress -notlike "169.*" -and $_.InterfaceAlias -notlike "*Virtual*" } `
        | Select-Object -ExpandProperty IPAddress -First 1)

if (-not $ip) { $ip = "127.0.0.1" }

Write-Host "IP detectada: $ip"
$inputIP = Read-Host "Presione ENTER para usarla o ingrese una nueva"
if ($inputIP -ne "") { $ip = $inputIP }

Write-Host "Usando IP final: $ip"

$secretKey = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 255 }))

# Backend .env
$backendEnv = @"
DEBUG=False
SECRET_KEY=$secretKey
DB_HOST=localhost
DB_NAME=sistema_db
DB_USER=admin
DB_PASSWORD=admin123
ALLOWED_HOSTS=localhost,$ip,sistema.de.asistencia
"@

Set-Content -Path "$PSScriptRoot\..\backend\.env" -Value $backendEnv -Encoding UTF8

# Frontend .env
$frontendEnv = @"
HOST=$ip
PORT=3000
API_URL=http://$ip:8000
"@

Set-Content -Path "$PSScriptRoot\..\frontend\.env" -Value $frontendEnv -Encoding UTF8

# DNS interno institucional
$domain = "sistema.de.asistencia"
Add-Content -Path "$env:SystemRoot\System32\drivers\etc\hosts" -Value "`n$ip    $domain"

Write-Host ".env y DNS configurados correctamente."
