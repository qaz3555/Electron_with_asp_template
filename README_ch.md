# Electron + ASP.NET Core + React 專案範本

這是一個桌面應用程式範本，將三個 process 打包成單一 `.exe` 執行檔：

- **後端 (Backend)** — ASP.NET Core 9 Web API
- **前端 (Frontend)** — React 19 + TypeScript (Vite)
- **桌面殼層 (Desktop Shell)** — Electron 41

本範本的目標是提供一個起點，讓開發者能夠建立以網頁前端為 UI、以自託管 .NET 後端處理商業邏輯的桌面應用程式，並透過 Electron Forge 打包成單一 Windows 執行檔。

---

## 架構說明

```
┌─────────────────────────────────────────┐
│           Electron (desktop/)           │
│  - 在動態 port 上啟動 MyBackend.exe      │
│  - 從 resources/dist/ 載入前端頁面       │
│  - 透過 preload.js 將 API 網址傳給前端    │
└───────────────┬──────────────┬──────────┘
                │              │
    window.desktopApi     spawn 子程序
                │              │
┌───────────────▼──┐  ┌────────▼──────────┐
│    React 前端     │  │  ASP.NET Core API  │
│  (frontend/)     │  │  (backend/)        │
│  Vite + React 19 │  │  http://localhost  │
│  DevExtreme UI   │  │  :{動態 port}      │
└──────────────────┘  └────────────────────┘
```

### Process 間的通訊方式

| 情境 | 機制 |
|---|---|
| 前端呼叫後端 API | `fetch()` 至 `window.desktopApi.getApiBaseUrl()` 取得的網址 |
| Electron 將 port 傳給前端 | `webPreferences` 中的 `additionalArguments: ['--api-port=N']` |
| Electron 啟動後端 | `child_process.spawn(MyBackend.exe, { env: { Urls: ... } })` |

---

## 環境需求

| 工具 | 版本 |
|---|---|
| .NET SDK | 9.0 以上 |
| Node.js | 18 以上 |
| npm | 9 以上 |

---

## 目錄結構

```
.
├── backend/
│   └── MyBackend/           # ASP.NET Core 9 Web API
│       ├── Controllers/     # API 控制器（例如 HelloController）
│       └── Program.cs       # 進入點，設定 CORS 與 port
├── frontend/
│   └── src/
│       └── App.tsx          # React 進入點，呼叫 /api/hello
├── desktop/
│   ├── main.js              # Electron 主程序
│   ├── preload.js           # 將 window.desktopApi 暴露給渲染器
│   └── forge.config.js      # Electron Forge 打包設定
└── scripts/
    ├── build.sh             # 完整建置腳本（Linux / macOS / Git Bash）
    └── build.bat            # 完整建置腳本（Windows CMD）
```

---

## 開發模式

分別啟動三個 process：

**1. 後端**
```bash
cd backend/MyBackend
dotnet run
# 啟動於 http://localhost:5050
```

**2. 前端**
```bash
cd frontend
npm install
npm run dev
# 啟動於 http://localhost:5173
```

**3. Electron**
```bash
cd desktop
npm install
npm start
# 在 BrowserWindow 中載入 http://localhost:5173
```

> 開發模式下，Electron **不會**自動啟動後端，需手動執行。

---

## 建置與打包

使用scipt一鍵建置（Windows 請使用 Git Bash 或 WSL）：
```bash
./scripts/build.sh
```

或手動逐步執行：

```bash
# 1. 發佈後端（self-contained win-x64 執行檔）
cd backend/MyBackend
dotnet publish -c Release -r win-x64 --self-contained -o publish

# 2. 建置前端
cd frontend
npm run build

# 3. 使用 Electron Forge 打包
cd desktop
npm run package   # 輸出至 desktop/out/（不含安裝程式）
npm run make      # 輸出 Squirrel 安裝程式 + zip
```

打包結果輸出至 `desktop/out/`。

---

## 打包後的應用程式運作流程

1. Electron 啟動，呼叫 `getFreePort()` 取得一個可用的 OS port。
2. 從 `resources/publish/` 啟動 `MyBackend.exe`，並設定環境變數 `Urls=http://localhost:{port}`。
3. 持續輪詢後端，直到收到回應（最多等待 30 秒）。
4. 開啟 `BrowserWindow`，載入 `resources/dist/index.html`（已建置的 React 應用程式）。
5. 透過 `--api-port=N` 將 port 傳入渲染器，使 `window.desktopApi.getApiBaseUrl()` 回傳正確的網址。
6. 所有視窗關閉時，後端 process 一併終止。

多個應用程式實例可同時執行，每個實例會各自取得獨立的後端 port，不會互相衝突。

---

## 功能擴充指南

### 新增 API Endpoint

1. 在 `backend/MyBackend/Controllers/` 建立新的控制器：
```csharp
[ApiController]
[Route("api/[controller]")]
public class MyController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { data = "hello" });
}
```

2. 在前端呼叫：
```ts
const res = await fetch(`${baseUrl}/api/my`);
```

### 透過 Preload 向渲染器暴露新 API

在 `desktop/preload.js` 的 `contextBridge.exposeInMainWorld("desktopApi", { ... })` 中新增方法，並在 `frontend/src/App.tsx` 的 `Window` 型別宣告中補充對應的型別定義。

---

## 關鍵 Port（開發模式）

| 服務 | 網址 |
|---|---|
| 後端 | http://localhost:5050 |
| 前端（Vite） | http://localhost:5173 |
