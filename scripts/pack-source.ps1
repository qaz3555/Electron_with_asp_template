$ErrorActionPreference = "Stop"
$root   = Split-Path $PSScriptRoot -Parent
$parent = Split-Path $root -Parent
$name   = Split-Path $root -Leaf
$zip    = Join-Path $parent "${name}_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"

$targets = @(
    "frontend\node_modules",
    "desktop\node_modules",
    "frontend\dist",
    "desktop\out",
    "backend\MyBackend\bin",
    "backend\MyBackend\obj",
    "backend\MyBackend\publish"
)

Write-Host "Cleaning..."
foreach ($rel in $targets) {
    $path = Join-Path $root $rel
    if (Test-Path $path) {
        Write-Host "  del $rel"
        Remove-Item $path -Recurse -Force
    }
}

Write-Host ""
Write-Host "Creating $zip ..."
$items = Get-ChildItem -Path $root | Where-Object { $_.Name -notlike 'electron-*.zip' }
Compress-Archive -Path $items.FullName -DestinationPath $zip -CompressionLevel Optimal
Write-Host "Done: $zip"
