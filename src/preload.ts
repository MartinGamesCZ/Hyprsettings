const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  listNetworks: () => ipcRenderer.send("net-list"),
  onListNetworks: (callback: any) =>
    ipcRenderer.on("net-list-response", console.log),
});
