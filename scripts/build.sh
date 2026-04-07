#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT/backend/MyBackend"
dotnet restore
dotnet publish -c Release -r win-x64 --self-contained --nologo -v q -o publish

cd "$ROOT/frontend"
npm install --no-audit
npm run build

cd "$ROOT/desktop"
npm install --no-audit
npm run package
