@echo off
setlocal

set ROOT=%~dp0..
:: Resolve ROOT to an absolute path without trailing backslash
for %%I in ("%ROOT%") do set ROOT=%%~fI

:: Parent directory of the repo
for %%I in ("%ROOT%\..") do set PARENT=%%~fI

:: Repo folder name
for %%I in ("%ROOT%") do set REPONAME=%%~nxI

:: Timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set DT=%%I
set TIMESTAMP=%DT:~0,8%_%DT:~8,6%
set ZIP=%PARENT%\%REPONAME%_%TIMESTAMP%.zip

echo Cleaning...

for %%D in (
    "frontend\node_modules"
    "desktop\node_modules"
    "frontend\dist"
    "desktop\out"
    "backend\MyBackend\bin"
    "backend\MyBackend\obj"
    "backend\MyBackend\publish"
) do (
    if exist "%ROOT%\%%~D" (
        echo   del %%~D
        rd /s /q "%ROOT%\%%~D"
    )
)

echo.
echo Creating %ZIP% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$items = Get-ChildItem -Path '%ROOT%' | Where-Object { $_.Name -notlike 'electron-*.zip' }; Compress-Archive -Path $items.FullName -DestinationPath '%ZIP%' -CompressionLevel Optimal"
if errorlevel 1 exit /b 1

echo Done: %ZIP%
