import { spawn } from "child_process";
import * as wifi from "node-wifi";

export default class Net {
  constructor() {
    wifi.init({
      iface: null,
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
        "list",
      ]);

      let buf = "";

      proc.stdout.on("data", (d) => (buf += d.toString()));

      proc.on("exit", () => {
        res(
          buf
            .split("\n")
            .filter((a) => a.length > 1)
            .map((line) => {
              // Split by colon but not by escaped colon
              const parts = line.split(/(?<!\\):/);
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
                rsn_flags,
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
                rsn_flags,
              };
            })
        );
      });
    });
  }

  connect(ssid: string, password?: string) {
    return new Promise(async (res) => {
      if (password) {
        const re = await new Promise((r) => {
          const proc = spawn("nmcli", ["connection", "delete", ssid], {});

          proc.on("exit", (code) => {
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
        ...(password ? ["password", password] : []),
      ]);

      proc.on("exit", (code) => {
        if (code! > 0) return res("error");
        res("ok");
      });
    });
  }
}
