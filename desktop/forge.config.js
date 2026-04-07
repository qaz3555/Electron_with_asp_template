const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// ── Load build config from repo root ─────────────────────────────────────────
const REPO_ROOT = path.resolve(__dirname, '..');
const configPath = path.join(REPO_ROOT, 'electron_build_config.yaml');

let buildConfig;
try {
  buildConfig = yaml.load(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  throw new Error(`Failed to read electron_build_config.yaml: ${err.message}`);
}

const ELECTRON_VERSION = buildConfig.electronVersion;
if (!ELECTRON_VERSION) {
  throw new Error('electron_build_config.yaml must specify "electronVersion"');
}

// If electronZipDir is provided, resolve it relative to repo root and use the
// local ZIP. Otherwise leave it undefined so Electron Forge downloads online.
const electronZipDir = buildConfig.electronZipDir
  ? path.resolve(REPO_ROOT, buildConfig.electronZipDir)
  : undefined;

// ── Makers ────────────────────────────────────────────────────────────────────
// Map maker name → Electron Forge maker config.
// Each maker declares which platforms it supports; unsupported ones are skipped
// at runtime so the same YAML works across all OS without manual changes.
const MAKERS_MAP = {
  squirrel: {
    platforms: ['win32'],
    config: {
      name: '@electron-forge/maker-squirrel',
      config: { name: 'ElectronAspNetApp' },
    },
  },
  zip: {
    platforms: ['win32', 'linux', 'darwin'],
    config: {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'linux', 'darwin'],
    },
  },
  deb: {
    platforms: ['linux'],
    config: {
      name: '@electron-forge/maker-deb',
      config: {},
    },
  },
  rpm: {
    platforms: ['linux'],
    config: {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  },
  dmg: {
    platforms: ['darwin'],
    config: {
      name: '@electron-forge/maker-dmg',
      config: {},
    },
  },
};

const DEFAULT_MAKERS = ['squirrel', 'zip'];
const requestedMakers = buildConfig.makers ?? DEFAULT_MAKERS;
const currentPlatform = process.platform === 'win32' ? 'win32'
  : process.platform === 'darwin' ? 'darwin'
  : 'linux';

const makers = requestedMakers
  .map((name) => {
    const entry = MAKERS_MAP[name];
    if (!entry) throw new Error(`Unknown maker "${name}" in electron_build_config.yaml`);
    return entry;
  })
  .filter(({ platforms }) => platforms.includes(currentPlatform))
  .map(({ config }) => config);
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  packagerConfig: {
    electronVersion: ELECTRON_VERSION,
    ...(electronZipDir && { electronZipDir }),
    extraResource: [
      // Copied to resources/dist/  → loaded via process.resourcesPath + "/dist/index.html"
      path.resolve(__dirname, '../frontend/dist'),
      // Copied to resources/publish/ → spawned via process.resourcesPath + "/publish/MyBackend.exe"
      path.resolve(__dirname, '../backend/MyBackend/publish'),
    ],
    asar: true,
  },
  rebuildConfig: {},
  makers,
};
