const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("afcDesktop", {
  version: "1.0.0",
  pickFolder: (defaultDir) => ipcRenderer.invoke("afc:pick-folder", defaultDir),
  writeFile: (target, parts, data) => ipcRenderer.invoke("afc:write-file", target, parts, data),
  joinPath: (a, b) => ipcRenderer.invoke("afc:join", a, b),
  openFolder: (dir) => ipcRenderer.invoke("afc:open-folder", dir),
  onOpenFile: (cb) => {
    ipcRenderer.on("afc:open-file", (_e, payload) => cb(payload));
    ipcRenderer.send("afc:ready");
  }
});
