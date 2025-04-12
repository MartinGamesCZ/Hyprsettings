import { spawn } from "child_process";

export default class Bluetooth {
  private scanProcess: any = null;

  async list() {
    return new Promise((r) => {
      const proc = spawn("bash", [
        "-c",
        "bluetoothctl devices | cut -f2 -d' ' | while read uuid; do bluetoothctl info $uuid; done",
      ]);

      let buf = "";

      proc.stdout.on("data", (d) => (buf += d.toString()));
      proc.on("exit", () => r(this.parseBluetoothData(buf)));
    });
  }

  async startScan() {
    // Kill any existing scan process
    this.stopScan();

    return new Promise((r) => {
      this.scanProcess = spawn("bluetoothctl", ["scan", "on"]);

      // Wait a bit to let scanning begin, then resolve
      setTimeout(() => {
        r(true);
      }, 1000);
    });
  }

  stopScan() {
    if (this.scanProcess) {
      this.scanProcess.kill();
      this.scanProcess = null;
      // Also run the command to explicitly turn off scanning
      spawn("bluetoothctl", ["scan", "off"]);
    }
  }

  async scan(duration: number = 5000) {
    await this.startScan();

    return new Promise(async (r) => {
      // Scan for the specified duration
      setTimeout(async () => {
        this.stopScan();
        // Get the list of devices after scanning
        const devices = await this.list();
        r(devices);
      }, duration);
    });
  }

  parseBluetoothData(data: string) {
    const packets = data.split("\n");

    let buf: string[] = [];
    let deviceBlocks: string[][] = [];

    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i].trim();

      if (packet == "") {
        deviceBlocks.push(buf);
        buf = [];

        continue;
      }

      buf.push(packet);
    }

    const devices = deviceBlocks.map((device) =>
      Object.fromEntries(
        device.map((a, i) =>
          i == 0
            ? ["mac", a.split(" ")[1]]
            : a
                .split(":")
                .map((b) => b.trim())
                .map((a, i) => (i == 0 ? a.toLowerCase() : a))
        )
      )
    );

    return devices;
  }
}

/*import { ChildProcess, spawn } from "child_process";
import stripAnsi from "strip-ansi";

export default class Bluetooth {
  devices: {
    mac: string;
    data: string[][];
  }[] = [];
  proc: ChildProcess;

  eventListeners: {
    [key: string]: ((data: any) => void)[];
  } = {};

  constructor() {
    this.proc = spawn("bluetoothctl", ["--timeout=0"], {});

    this.proc.stdout?.on("data", (d) => {
      const data = d.toString();

      this.parseBluetoothData(stripAnsi(data));
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];

    this.eventListeners[event].push(callback);
  }

  emit(event: string, data: any) {
    if (!this.eventListeners[event]) return;

    this.eventListeners[event].forEach((callback) => callback(data));
  }

  list() {
    return new Promise((resolve, reject) => {
      this.proc.stdin?.write("devices\n");
    });
  }

  scan() {
    return new Promise((resolve, reject) => {
      this.proc.stdin?.write("scan on\n");
    });
  }

  parseBluetoothData(data: string) {
    const packets = data
      .split("\n")
      .map((a) => a.replace(/\r/gm, "").split(" "));

    packets.forEach((packet) => {
      let [type, ...rest] = packet
        .map((a) => a.trim())
        .map((a, i) => (i > 1 ? a : a.replace(/[\[\]]/gm, "")))
        .filter((a) => a && a.length > 0);

      if (!type || (type.length > 3 && type != "Device")) return;
      if (type.length <= 3) [type, ...rest] = rest;

      if (type == "Device") this.processDevicePacket(rest);
    });
  }

  processDevicePacket(packet: string[]) {
    const [mac, ...rest] = packet;

    const existingDevice = this.devices.find((a) => a.mac == mac);

    if (existingDevice) {
      existingDevice.data.push(rest);
    } else {
      this.devices.push({
        mac,
        data: [rest],
      });
    }

    const dev = this.objectifyBluetoothDevices();

    this.emit("devices", dev);
  }

  objectifyBluetoothDevices() {
    return this.devices.map((device) => {
      const rssi = (device.data.find((a) => this.dataCheckRssi(a[0])) ?? [
        "",
        "",
      ])[1];
      const name = (
        device.data.find((a) => this.dataCheckName(a[0], mac)) ?? []
      ).join(" ");

      return {
        mac,
        rssi,
        name,
      };
    });
  }

  dataCheckMac(mac: string, data: string) {
    return mac.trim() == data.trim().replace(/-/gm, ":");
  }

  dataCheckRssi(data: string) {
    return data.trim().toLowerCase().startsWith("rssi");
  }

  dataCheckName(data: string, mac: string) {
    return (
      !this.dataCheckRssi(data) &&
      !this.dataCheckMac(mac, data) &&
      !data.includes(":")
    );
  }
}
*/
