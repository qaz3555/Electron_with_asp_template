$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

Set-Location "$root\backend\MyBackend"
dotnet restore
dotnet publish -c Release -r win-x64 --self-contained --nologo -v q -o publish

Set-Location "$root\frontend"
npm install --no-audit
npm run build

Set-Location "$root\desktop"
npm install --no-audit
npm run package
