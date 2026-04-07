const path = require('path');

// ── Version Configuration ─────────────────────────────────────────────────────
// When upgrading Electron:
//   1. Change ELECTRON_VERSION below
//   2. Place the matching zip at <repo-root>/electron-v{ELECTRON_VERSION}-win32-x64.zip
//   3. Update the "electron" version in package.json to match exactly
const ELECTRON_VERSION = '41.1.1';
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  packagerConfig: {
    electronVersion: ELECTRON_VERSION,
    // Use the local zip under the repo root instead of downloading
    electronZipDir: path.resolve(__dirname, '..'),
    extraResource: [
      // Copied to resources/dist/  → loaded via process.resourcesPath + "/dist/index.html"
      path.resolve(__dirname, '../frontend/dist'),
      // Copied to resources/publish/ → spawned via process.resourcesPath + "/publish/MyBackend.exe"
      path.resolve(__dirname, '../backend/MyBackend/publish'),
    ],
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ElectronAspNetApp',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
  ],
};
