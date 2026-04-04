const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktopApi", {
  getApiBaseUrl: () => process.env.API_BASE_URL ?? "http://localhost:5050"
});