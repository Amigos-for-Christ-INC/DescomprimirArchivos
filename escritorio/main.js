/* Descomprimir AFC - app de escritorio (Amigos for Christ) */
const { app, BrowserWindow, protocol, ipcMain, dialog, shell, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_DIR = path.join(__dirname, "app");
const ARCHIVE_EXT = /\.(zip|rar|7z|tar|gz|tgz|bz2|xz|cab|iso)$/i;
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".wasm": "application/wasm", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json", ".txt": "text/plain"
};

protocol.registerSchemesAsPrivileged([
  { scheme: "afc", privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);

let win = null;
let rendererReady = false;
const pending = [];

function archiveFromArgv(argv) {
  return argv.slice(1).find(a => ARCHIVE_EXT.test(a) && fs.existsSync(a));
}

async function sendFile(filePath) {
  if (!filePath) return;
  if (!win || !rendererReady) { pending.push(filePath); return; }
  try {
    const data = await fs.promises.readFile(filePath);
    win.webContents.send("afc:open-file", {
      name: path.basename(filePath),
      dir: path.dirname(filePath),
      data: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    });
    if (win.isMinimized()) win.restore();
    win.focus();
  } catch (e) {
    dialog.showErrorBox("Descomprimir AFC", "No se pudo abrir el archivo:\n" + filePath + "\n\n" + e.message);
  }
}

/* Solo una ventana: si ya está abierta, el archivo nuevo se abre en ella */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_e, argv) => sendFile(archiveFromArgv(argv)));
  const first = archiveFromArgv(process.argv);
  if (first) pending.push(first);

  app.whenReady().then(() => {
    protocol.handle("afc", async (req) => {
      const url = new URL(req.url);
      let rel = decodeURIComponent(url.pathname);
      if (rel === "/" || rel === "") rel = "/index.html";
      const file = path.normalize(path.join(APP_DIR, rel));
      if (!file.startsWith(APP_DIR)) return new Response("No permitido", { status: 403 });
      try {
        const body = await fs.promises.readFile(file);
        return new Response(body, { headers: { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" } });
      } catch {
        return new Response("No encontrado", { status: 404 });
      }
    });

    Menu.setApplicationMenu(null);
    win = new BrowserWindow({
      width: 1000, height: 760, minWidth: 420, minHeight: 520,
      title: "Descomprimir AFC",
      icon: path.join(__dirname, "app", "img", "icono-512.png"),
      backgroundColor: "#0A2240",
      autoHideMenuBar: true,
      webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false }
    });

    /* La app no navega fuera de sí misma; los enlaces externos se abren en el navegador */
    win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
    win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("afc://")) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
    /* Sin acceso a cámara, micrófono, etc. */
    win.webContents.session.setPermissionRequestHandler((_wc, perm, cb) => cb(perm === "clipboard-sanitized-write"));

    win.loadURL("afc://app/index.html");
  });

  ipcMain.on("afc:ready", () => { rendererReady = true; while (pending.length) sendFile(pending.shift()); });

  ipcMain.handle("afc:pick-folder", async (_e, defaultDir) => {
    const r = await dialog.showOpenDialog(win, {
      title: "Elegir dónde extraer",
      buttonLabel: "Extraer aquí",
      defaultPath: defaultDir || app.getPath("downloads"),
      properties: ["openDirectory", "createDirectory"]
    });
    return r.canceled ? null : r.filePaths[0];
  });

  /* Escribe un archivo extraído, sin permitir rutas que salgan de la carpeta elegida */
  ipcMain.handle("afc:write-file", async (_e, target, parts, data) => {
    const clean = parts.map(s => String(s).replace(/[<>:"|?*\x00-\x1f\\/]/g, "_").replace(/[. ]+$/, "")).filter(s => s && s !== "." && s !== "..");
    if (!clean.length) return false;
    const root = path.resolve(target);
    const dest = path.resolve(root, ...clean);
    if (!dest.startsWith(root + path.sep)) throw new Error("Ruta no permitida");
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    await fs.promises.writeFile(dest, Buffer.from(data));
    return true;
  });

  ipcMain.handle("afc:join", (_e, a, b) => path.join(a, b));
  ipcMain.handle("afc:open-folder", (_e, dir) => shell.openPath(dir));

  app.on("window-all-closed", () => app.quit());
}
