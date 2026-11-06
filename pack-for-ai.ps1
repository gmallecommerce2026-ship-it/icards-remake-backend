# pack-for-ai.ps1: nén source NestJS để gửi cho AI (không kèm secret)
$ErrorActionPreference = "Stop"

$src     = $PSScriptRoot
$outZip  = Join-Path (Split-Path $src -Parent) "icards-nestjs-for-ai.zip"
$staging = Join-Path $env:TEMP ("icards-pack-" + [guid]::NewGuid().ToString("N"))

# Thư mục và file bỏ qua
$excludeDirs  = @("node_modules", "dist", ".git", "coverage", ".idea", ".vscode", "uploads", "tmp")
$excludeFiles = @(".env", ".env.*", "*.log", "*.zip", "package-lock.json", ".DS_Store")

Write-Host "Nguon : $src"
Write-Host "Zip   : $outZip"

# 1. Copy sang thu muc tam, loai tru file khong can
New-Item -ItemType Directory -Path $staging | Out-Null
$null = robocopy $src $staging /E /XD $excludeDirs /XF $excludeFiles /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -ge 8) { throw "robocopy loi (ma $LASTEXITCODE)" }

# 2. Sinh .env.example tu .env (xoa gia tri, giu ten bien)
$envFile = Join-Path $src ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') { "$($Matches[1])=" } else { $_ }
    } | Set-Content (Join-Path $staging ".env.example") -Encoding UTF8
    Write-Host "Da tao .env.example (khong chua gia tri that)"
}

# 3. Nen zip bang tar (tao zip dung chuan, duong dan '/' de AI giai nen duoc)
if (Test-Path $outZip) { Remove-Item $outZip -Force }
tar -a -c -f $outZip -C $staging .
if ($LASTEXITCODE -ne 0) { throw "tar loi (ma $LASTEXITCODE)" }

# 4. Don dep va bao ket qua
Remove-Item $staging -Recurse -Force
$mb = [math]::Round((Get-Item $outZip).Length / 1MB, 2)
Write-Host "Xong: $outZip ($mb MB)" -ForegroundColor Green