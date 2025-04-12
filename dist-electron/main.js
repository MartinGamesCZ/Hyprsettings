var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import require$$0, { spawn } from "child_process";
import "fs";
import require$$4 from "path";
import require$$5 from "os";
Object.assign(process.env, {
  LANG: "en_US.UTF-8",
  LC_ALL: "en_US.UTF-8",
  LC_MESSAGES: "en_US.UTF-8"
});
let frequency = 2412;
for (let i = 1; i < 15; i++) {
  frequency.toString();
  frequency = frequency + 5;
}
frequency = 5180;
for (let j = 36; j <= 64; j += 2) {
  frequency.toString();
  frequency += 10;
}
frequency = 5500;
for (let k = 100; k <= 144; k += 2) {
  frequency.toString();
  frequency += 10;
}
frequency = 5745;
for (let l = 149; l <= 161; l += 2) {
  frequency.toString();
  frequency += 10;
}
frequency = 5825;
for (let m = 165; m <= 173; m += 4) {
  frequency.toString();
  frequency += 20;
}
require$$0.execFile;
require$$0.execFile;
const path = require$$4;
const os = require$$5;
path.join(os.tmpdir(), "nodeWifiConnect.xml");
require$$0.execFile;
require$$0.execFile;
require$$0.execFile;
require$$0.execFile;
require$$0.execFile;
require$$0.execFile;
const { execFile } = require$$0;
function init(options) {
  if (options && options.debug) {
    options.debug;
  }
  if (options && options.iface) {
    options.iface;
  }
  switch (process.platform) {
    case "linux":
      break;
    case "darwin":
      break;
    case "win32":
      break;
    default:
      throw new Error("ERROR : UNRECOGNIZED OS");
  }
}
var init_1 = init;
class Net {
  constructor() {
    init_1({
      iface: null
    });
  }
  list() {
    return new Promise(async (res) => {
      const proc = spawn("nmcli", [
        "--terse",
        "--fields",
        "active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags",
        "device",
        "wifi",
        "list"
      ]);
      let buf = "";
      proc.stdout.on("data", (d) => buf += d.toString());
      proc.on("exit", () => {
        res(
          buf.split("\n").filter((a) => a.length > 1).map((line) => {
            const parts = line.split(new RegExp("(?<!\\\\):"));
            const [
              active,
              ssid,
              bssid,
              mode,
              chan,
              freq,
              signal,
              security,
              wpa_flags,
              rsn_flags
            ] = parts;
            return {
              active: active == "yes",
              ssid,
              bssid: bssid.replace(/\\\:/gm, ":"),
              mode,
              channel: chan,
              frequency: freq,
              signal_strength: signal,
              security,
              wpa_flags,
              rsn_flags
            };
          })
        );
      });
    });
  }
  connect(ssid, password) {
    return new Promise(async (res) => {
      if (password) {
        const re = await new Promise((r) => {
          const proc2 = spawn("nmcli", ["connection", "delete", ssid], {});
          proc2.on("exit", (code) => {
            if (code !== 0) return r("error");
            r("ok");
          });
        });
        if (re !== "ok") return res("error");
      }
      const proc = spawn("nmcli", [
        "device",
        "wifi",
        "connect",
        ssid,
        ...password ? ["password", password] : []
      ]);
      proc.on("exit", (code) => {
        if (code > 0) return res("error");
        res("ok");
      });
    });
  }
}
class Bluetooth {
  constructor() {
    __publicField(this, "scanProcess", null);
  }
  async list() {
    return new Promise((r) => {
      const proc = spawn("bash", [
        "-c",
        "bluetoothctl devices | cut -f2 -d' ' | while read uuid; do bluetoothctl info $uuid; done"
      ]);
      let buf = "";
      proc.stdout.on("data", (d) => buf += d.toString());
      proc.on("exit", () => r(this.parseBluetoothData(buf)));
    });
  }
  async startScan() {
    this.stopScan();
    return new Promise((r) => {
      this.scanProcess = spawn("bluetoothctl", ["scan", "on"]);
      setTimeout(() => {
        r(true);
      }, 1e3);
    });
  }
  stopScan() {
    if (this.scanProcess) {
      this.scanProcess.kill();
      this.scanProcess = null;
      spawn("bluetoothctl", ["scan", "off"]);
    }
  }
  async scan(duration = 5e3) {
    await this.startScan();
    return new Promise(async (r) => {
      setTimeout(async () => {
        this.stopScan();
        const devices = await this.list();
        r(devices);
      }, duration);
    });
  }
  parseBluetoothData(data) {
    const packets = data.split("\n");
    let buf = [];
    let deviceBlocks = [];
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i].trim();
      if (packet == "") {
        deviceBlocks.push(buf);
        buf = [];
        continue;
      }
      buf.push(packet);
    }
    const devices = deviceBlocks.map(
      (device) => Object.fromEntries(
        device.map(
          (a, i) => i == 0 ? ["mac", a.split(" ")[1]] : a.split(":").map((b) => b.trim()).map((a2, i2) => i2 == 0 ? a2.toLowerCase() : a2)
        )
      )
    );
    return devices;
  }
}
const net = new Net();
const ble = new Bluetooth();
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.openDevTools();
  win.setMenu(null);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
ipcMain.handle("net-list", async () => {
  return await net.list();
});
ipcMain.handle(
  "net-connect",
  async (_event, ssid, password) => {
    return await net.connect(ssid, password);
  }
);
ipcMain.handle("ble-scan", async () => {
  return "";
});
ipcMain.handle("ble-list", async () => {
  const devices = await ble.scan();
  return devices;
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
