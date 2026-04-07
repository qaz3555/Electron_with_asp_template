const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const net = require("net");

let backendProcess = null;

/** Asks the OS for a free TCP port on 127.0.0.1. */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

/**
 * In dev: backend is started manually on 5050, so just return 5050.
 * In packaged: find a free port, spawn the backend bound to it, return the port.
 */
async function startBackend() {
  if (!app.isPackaged) {
    return 5050;
  }

  const port = await getFreePort();
  const backendExe = path.join(process.resourcesPath, "publish", "MyBackend.exe");

  await new Promise((resolve, reject) => {
    backendProcess = spawn(backendExe, [], {
      stdio: "ignore",
      detached: false,
      env: {
        ...process.env,
        Urls: `http://localhost:${port}`,
      },
    });

    backendProcess.on("error", (err) => reject(err));

    pollBackend(`http://localhost:${port}`, 60, resolve, reject);
  });

  return port;
}

function pollBackend(url, retriesLeft, resolve, reject) {
  http
    .get(url, () => {
      resolve();
    })
    .on("error", () => {
      if (retriesLeft <= 0) {
        reject(new Error("Backend did not start in time"));
        return;
      }
      setTimeout(() => pollBackend(url, retriesLeft - 1, resolve, reject), 500);
    });
}

function createWindow(apiPort) {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // Pass the resolved port into the preload script via process.argv
      additionalArguments: [`--api-port=${apiPort}`],
    },
  });

  if (app.isPackaged) {
    win.loadFile(
      path.join(process.resourcesPath, "dist", "index.html")
    );
  } else {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  }

  win.webContents.on("did-finish-load", () => {
    console.log("Renderer loaded successfully.");
  });

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error("Failed to load renderer:", errorCode, errorDescription);
  });
}

app.whenReady().then(async () => {
  console.log("Electron app ready, isPackaged:", app.isPackaged);
  try {
    const apiPort = await startBackend();
    console.log("Backend ready on port", apiPort);
    createWindow(apiPort);
  } catch (err) {
    console.error("Failed to start backend:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
