const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  console.log("createWindow called");

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  const url = "http://localhost:5173";
  console.log("Loading:", url);

  win.loadURL(url);

  win.webContents.on("did-finish-load", () => {
    console.log("Renderer loaded successfully.");
  });

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error("Failed to load renderer:", errorCode, errorDescription);
  });

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  console.log("Electron app ready");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});