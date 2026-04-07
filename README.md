# Electron + ASP.NET Core + React Template

A desktop application template that bundles three processes into a single packaged `.exe`:

- **Backend** — ASP.NET Core 9 Web API
- **Frontend** — React 19 + TypeScript (Vite)
- **Desktop Shell** — Electron 41

The goal is to provide a starting point for building cross-platform desktop apps where the UI is a web frontend and the business logic runs in a self-hosted .NET backend — all packaged as a single Windows executable via Electron Forge.

---

## Architecture

```
┌─────────────────────────────────────────┐
│               Electron (desktop/)        │
│  - Spawns MyBackend.exe on a free port  │
│  - Loads frontend from resources/dist/  │
│  - Exposes API base URL via preload.js  │
└───────────────┬──────────────┬──────────┘
                │              │
    window.desktopApi     spawns process
                │              │
┌───────────────▼──┐  ┌────────▼──────────┐
│  React Frontend  │  │  ASP.NET Core API  │
│  (frontend/)     │  │  (backend/)        │
│  Vite + React 19 │  │  http://localhost  │
│  DevExtreme UI   │  │  :{dynamic port}   │
└──────────────────┘  └────────────────────┘
```

### Process Communication

| Concern | Mechanism |
|---|---|
| Frontend calls backend | `fetch()` to `window.desktopApi.getApiBaseUrl()` |
| Electron passes port to frontend | `additionalArguments: ['--api-port=N']` in `webPreferences` |
| Electron spawns backend | `child_process.spawn(MyBackend.exe, { env: { Urls: ... } })` |

---

## Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 9.0+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Project Structure

```
.
├── backend/
│   └── MyBackend/           # ASP.NET Core 9 Web API
│       ├── Controllers/     # API controllers (e.g. HelloController)
│       └── Program.cs       # Entry point, CORS + port config
├── frontend/
│   └── src/
│       └── App.tsx          # React app entry, calls /api/hello
├── desktop/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Exposes window.desktopApi to renderer
│   └── forge.config.js      # Electron Forge packaging config
└── scripts/
    ├── build.sh             # Full build script (Linux/macOS/Git Bash)
    └── build.bat            # Full build script (Windows CMD)
```

---

## Development

Run all three processes separately:

**1. Backend**
```bash
cd backend/MyBackend
dotnet run
# Starts on http://localhost:5050
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:5173
```

**3. Electron**
```bash
cd desktop
npm install
npm start
# Loads http://localhost:5173 in a BrowserWindow
```

In dev mode, Electron does **not** spawn the backend — you must start it manually.

---

## Build & Package

One-command build (requires Git Bash or WSL on Windows):
```bash
./scripts/build.sh
```

Or step by step:

```bash
# 1. Publish backend (self-contained win-x64 exe)
cd backend/MyBackend
dotnet publish -c Release -r win-x64 --self-contained -o publish

# 2. Build frontend
cd frontend
npm run build

# 3. Package with Electron Forge
cd desktop
npm run package   # outputs to desktop/out/ (no installer)
npm run make      # outputs Squirrel installer + zip
```

The packaged app is output to `desktop/out/`.

---

## How the Packaged App Works

1. Electron starts and calls `getFreePort()` to get an available OS port.
2. It spawns `MyBackend.exe` (from `resources/publish/`) with `Urls=http://localhost:{port}`.
3. It polls the backend until it responds (up to 30 seconds).
4. It opens a `BrowserWindow` loading `resources/dist/index.html` (the built React app).
5. The port is passed to the renderer via `--api-port=N` so `window.desktopApi.getApiBaseUrl()` returns the correct URL.
6. When all windows close, the backend process is killed.

Multiple instances of the app can run simultaneously — each gets its own backend on a distinct port.

---

## Adding Features

### New API Endpoint

1. Create a controller in `backend/MyBackend/Controllers/`:
```csharp
[ApiController]
[Route("api/[controller]")]
public class MyController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { data = "hello" });
}
```

2. Call it from the frontend:
```ts
const res = await fetch(`${baseUrl}/api/my`);
```

### Expose New APIs to Renderer via Preload

Add methods to `desktop/preload.js` inside `contextBridge.exposeInMainWorld("desktopApi", { ... })` and extend the `Window` type declaration in `frontend/src/App.tsx`.

---

## Key Ports (Dev Mode)

| Service | URL |
|---|---|
| Backend | http://localhost:5050 |
| Frontend (Vite) | http://localhost:5173 |
