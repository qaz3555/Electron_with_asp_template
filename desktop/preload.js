const { contextBridge } = require("electron");

// Receive the port assigned to this instance's backend via additionalArguments.
// Falls back to 5050 (dev mode where backend is started manually).
const apiPortArg = process.argv.find((a) => a.startsWith("--api-port="));
const apiPort = apiPortArg ? apiPortArg.split("=")[1] : "5050";

contextBridge.exposeInMainWorld("desktopApi", {
  getApiBaseUrl: () => `http://localhost:${apiPort}`,
});
