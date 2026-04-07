@echo off
setlocal
set ROOT=%~dp0..

echo [1/5] Backend restore...
cd /d "%ROOT%\backend\MyBackend"
dotnet restore --nologo
if errorlevel 1 exit /b 1

echo [2/5] Backend publish...
dotnet publish -c Release -r win-x64 --self-contained --nologo -v q -o publish
if errorlevel 1 exit /b 1

echo [3/5] Frontend install...
cd /d "%ROOT%\frontend"
call npm install --no-audit
if errorlevel 1 exit /b 1

echo [4/5] Frontend build...
call npm run build
if errorlevel 1 exit /b 1

echo [5/5] Desktop install + package...
cd /d "%ROOT%\desktop"
call npm install --no-audit
if errorlevel 1 exit /b 1
call npm run package
if errorlevel 1 exit /b 1

echo.
echo Done.
