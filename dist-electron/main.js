import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import "fs";
import require$$0 from "child_process";
import require$$4 from "path";
import require$$5 from "os";
var env$2 = Object.assign(process.env, {
  LANG: "en_US.UTF-8",
  LC_ALL: "en_US.UTF-8",
  LC_MESSAGES: "en_US.UTF-8"
});
var networkUtils$1 = {};
const channels$1 = {};
let frequency$1 = 2412;
for (let i = 1; i < 15; i++) {
  channels$1[i] = frequency$1.toString();
  frequency$1 = frequency$1 + 5;
}
frequency$1 = 5180;
for (let j = 36; j <= 64; j += 2) {
  channels$1[j] = frequency$1.toString();
  frequency$1 += 10;
}
frequency$1 = 5500;
for (let k = 100; k <= 144; k += 2) {
  channels$1[k] = frequency$1.toString();
  frequency$1 += 10;
}
frequency$1 = 5745;
for (let l = 149; l <= 161; l += 2) {
  channels$1[l] = frequency$1.toString();
  frequency$1 += 10;
}
frequency$1 = 5825;
for (let m = 165; m <= 173; m += 4) {
  channels$1[m] = frequency$1.toString();
  frequency$1 += 20;
}
function frequencyFromChannel$2(channelId) {
  return channels$1[parseInt(channelId)];
}
function dBFromQuality(quality) {
  return parseFloat(quality) / 2 - 100;
}
function qualityFromDB(db) {
  return 2 * (parseFloat(db) + 100);
}
networkUtils$1.frequencyFromChannel = frequencyFromChannel$2;
networkUtils$1.dBFromQuality = dBFromQuality;
networkUtils$1.qualityFromDB = qualityFromDB;
const execFile$1 = require$$0.execFile;
const networkUtils = networkUtils$1;
const env$1 = env$2;
function scanWifi$2(config2, callback) {
  try {
    execFile$1(
      "netsh",
      ["wlan", "show", "networks", "mode=Bssid"],
      { env: env$1 },
      (err, scanResults) => {
        if (err) {
          callback && callback(err);
          return;
        }
        scanResults = scanResults.toString("utf8").split("\r").join("").split("\n").slice(4, scanResults.length);
        let numNetworks = -1;
        let currentLine = 0;
        let networkTmp;
        const networksTmp = [];
        let network;
        const networks = [];
        let i;
        for (i = 0; i < scanResults.length; i++) {
          if (scanResults[i] === "") {
            numNetworks++;
            networkTmp = scanResults.slice(currentLine, i);
            networksTmp.push(networkTmp);
            currentLine = i + 1;
          }
        }
        for (i = 0; i < numNetworks; i++) {
          if (networksTmp[i] && networksTmp[i].length > 0) {
            network = parse$4(networksTmp[i]);
            networks.push(network);
          }
        }
        callback && callback(null, networks);
      }
    );
  } catch (e) {
    callback && callback(e);
  }
}
function parse$4(networkTmp) {
  const network = {};
  network.mac = networkTmp[4] ? networkTmp[4].match(/.*?:\s(.*)/)[1] : "";
  network.bssid = network.mac;
  network.ssid = networkTmp[0] ? networkTmp[0].match(/.*?:\s(.*)/)[1] : "";
  network.channel = networkTmp[7] ? parseInt(networkTmp[7].match(/.*?:\s(.*)/)[1]) : -1;
  network.frequency = network.channel ? parseInt(networkUtils.frequencyFromChannel(network.channel)) : 0;
  network.signal_level = networkTmp[5] ? networkUtils.dBFromQuality(networkTmp[5].match(/.*?:\s(.*)/)[1]) : Number.MIN_VALUE;
  network.quality = networkTmp[5] ? parseFloat(networkTmp[5].match(/.*?:\s(.*)/)[1]) : 0;
  network.security = networkTmp[2] ? networkTmp[2].match(/.*?:\s(.*)/)[1] : "";
  network.security_flags = networkTmp[3] ? networkTmp[3].match(/.*?:\s(.*)/)[1] : "";
  network.mode = "Unknown";
  return network;
}
var windowsScan$1 = (config2) => {
  return (callback) => {
    if (callback) {
      scanWifi$2(config2, callback);
    } else {
      return new Promise((resolve, reject) => {
        scanWifi$2(config2, (err, networks) => {
          if (err) {
            reject(err);
          } else {
            resolve(networks);
          }
        });
      });
    }
  };
};
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
const env = env$2;
var executer = ({ cmd, args }) => new Promise((resolve, reject) => {
  execFile(cmd, args, { env }, (error, output) => {
    if (error) {
      reject(error);
    } else {
      resolve(output);
    }
  });
});
const extractArgs = (allArgs) => {
  const callbackIndex = allArgs.length - 1;
  if (callbackIndex >= 0 && typeof allArgs[callbackIndex] === "function") {
    return {
      callback: allArgs[callbackIndex],
      args: allArgs.slice(0, callbackIndex)
    };
  }
  return {
    callback: null,
    args: allArgs
  };
};
var promiser$2 = (func) => (config2) => (...allArgs) => {
  const { args, callback } = extractArgs(allArgs);
  if (typeof callback === "function") {
    func(config2, ...args).then((response) => {
      callback(null, response);
    }).catch((error) => {
      callback(error);
    });
  } else {
    return func(config2, ...args);
  }
};
const command$3 = (config2) => {
  const args = [
    "--terse",
    "--fields",
    "active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags",
    "device",
    "wifi",
    "list"
  ];
  if (config2.iface) {
    args.push("ifname");
    args.push(config2.iface);
  }
  return {
    cmd: "nmcli",
    args
  };
};
var command_1$1 = command$3;
const percentageFromDB$1 = (db) => 2 * (parseFloat(db) + 100);
const dBFromPercentage$1 = (quality) => parseFloat(quality) / 2 - 100;
var percentageDb = {
  percentageFromDB: percentageFromDB$1,
  dBFromPercentage: dBFromPercentage$1
};
const { dBFromPercentage } = percentageDb;
const matchBssid = (line) => line.match(
  /[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}/
);
const parse$3 = (stdout) => stdout.split("\n").filter((line) => line !== "" && line.includes(":")).filter((line) => matchBssid(line)).map((line) => {
  const match = matchBssid(line);
  const bssid = match[0].replace(/\\:/g, ":");
  const fields = line.replace(match[0]).split(":");
  const [
    // eslint-disable-next-line no-unused-vars
    active,
    ssid,
    // eslint-disable-next-line no-unused-vars
    bssidAlreadyProcessed,
    mode,
    channel,
    frequency2,
    quality,
    security,
    security_flags_wpa,
    security_flags_rsn
  ] = fields;
  return {
    ssid,
    bssid,
    mac: bssid,
    // for retrocompatibility with version 1.x
    mode,
    channel: parseInt(channel),
    frequency: parseInt(frequency2),
    signal_level: dBFromPercentage(quality),
    quality: parseInt(quality),
    security: security !== "(none)" ? security : "none",
    security_flags: {
      wpa: security_flags_wpa,
      rsn: security_flags_rsn
    }
  };
});
var parser$1 = parse$3;
const execute$1 = executer;
const promiser$1 = promiser$2;
const command$2 = command_1$1;
const parse$2 = parser$1;
const scanWifi$1 = (config2) => execute$1(command$2(config2)).then((output) => parse$2(output));
var linuxScan$1 = promiser$1(scanWifi$1);
const command$1 = () => ({
  cmd: "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport",
  args: ["--scan"]
});
var command_1 = command$1;
const channels = {};
let frequency = 2412;
for (let i = 1; i < 15; i++) {
  channels[i] = frequency;
  frequency = frequency + 5;
}
frequency = 5180;
for (let j = 36; j <= 64; j += 2) {
  channels[j] = frequency;
  frequency += 10;
}
frequency = 5500;
for (let k = 100; k <= 144; k += 2) {
  channels[k] = frequency;
  frequency += 10;
}
frequency = 5745;
for (let l = 149; l <= 161; l += 2) {
  channels[l] = frequency;
  frequency += 10;
}
frequency = 5825;
for (let m = 165; m <= 173; m += 4) {
  channels[m] = frequency;
  frequency += 20;
}
var frequencyFromChannel$1 = (channel) => channels[parseInt(channel)];
const { percentageFromDB } = percentageDb;
const frequencyFromChannel = frequencyFromChannel$1;
const isNotEmpty = (line) => line.trim() !== "";
const parseSecurity = (security) => {
  const securities = security === "NONE" ? [{ protocole: "NONE", flag: "" }] : security.split(" ").map((s) => s.match(/(.*)\((.*)\)/)).filter(Boolean).map(([, protocole, flag]) => ({
    protocole,
    flag
  }));
  return {
    security: securities.map((s) => s.protocole).join(" "),
    security_flags: securities.filter((s) => s.flag).map((s) => `(${s.flag})`)
  };
};
const parse$1 = (stdout) => {
  const lines = stdout.split("\n");
  const [, ...otherLines] = lines;
  const networks = otherLines.filter(isNotEmpty).map((line) => line.trim()).map((line) => {
    const match = line.match(
      /(.*)\s+([a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}|)\s+(-[0-9]+)\s+([0-9]+).*\s+([A-Z]+)\s+([a-zA-Z-]+)\s+([A-Z0-9(,)\s/]+)/
    );
    if (match) {
      const [
        ,
        ssid,
        bssid,
        rssi,
        channelStr,
        // eslint-disable-next-line no-unused-vars
        ht,
        // eslint-disable-next-line no-unused-vars
        countryCode,
        security
      ] = match;
      const channel = parseInt(channelStr);
      return {
        mac: bssid,
        // for retrocompatibility
        bssid,
        ssid: ssid.trim(),
        channel,
        frequency: frequencyFromChannel(channel),
        signal_level: rssi,
        quality: percentageFromDB(rssi),
        ...parseSecurity(security)
      };
    }
    return false;
  }).filter(Boolean);
  return networks;
};
var parser = parse$1;
const execute = executer;
const promiser = promiser$2;
const command = command_1;
const parse = parser;
const scanWifi = (config2) => execute(command()).then((output) => parse(output));
var macScan$1 = promiser(scanWifi);
const windowsScan = windowsScan$1;
const linuxScan = linuxScan$1;
const macScan = macScan$1;
const config = {
  debug: false,
  iface: null
};
function init(options) {
  if (options && options.debug) {
    config.debug = options.debug;
  }
  if (options && options.iface) {
    config.iface = options.iface;
  }
  let scan = () => {
    throw new Error("ERROR : not available for this OS");
  };
  switch (process.platform) {
    case "linux":
      scan = linuxScan(config);
      break;
    case "darwin":
      scan = macScan(config);
      break;
    case "win32":
      scan = windowsScan(config);
      break;
    default:
      throw new Error("ERROR : UNRECOGNIZED OS");
  }
  scan_1 = scan;
}
var init_1 = init;
var scan_1 = () => {
  throw new Error("ERROR : use init before");
};
class Net {
  constructor() {
    init_1({
      iface: null
    });
  }
  list() {
    return scan_1();
  }
}
createRequire(import.meta.url);
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
const net = new Net();
ipcMain.handle("net-list", async () => {
  return await net.list();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
