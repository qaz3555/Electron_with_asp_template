const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktopApi", {
  getApiBaseUrl: () => "http://localhost:5050"
});