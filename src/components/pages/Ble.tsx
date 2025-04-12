import { useEffect, useState } from "react";
import Dialog from "../ui/Dialog";
import * as Icons from "react-icons/pi";

declare const ipcRenderer: any;

export default function Ble() {
  const [isOpen, setIsOpen] = useState(false);
  const [devices, setDevices] = useState<
    | null
    | {
        mac: string;
        name: string;
        alias: string;
        class: string;
        icon: string;
        paired: string;
        bonded: string;
        trusted: string;
        blocked: string;
        connected: string;
        legacypairing: string;
        uuid: string;
        modalias: string;
        "battery percentage": string;
      }[]
  >(null);
  const [connectDevice, setConnectDevice] = useState<string | null>(null);
  const [connectPin, setConnectPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = () => {
    setIsLoading(true);
    ipcRenderer.invoke("ble-list").then(setDevices);
    // Allow some time for scanning
    setTimeout(() => setIsLoading(false), 2000);
  };

  useEffect(() => {
    fetchDevices();

    const intervalId = setInterval(fetchDevices, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleConnect = (mac: string) => (pin?: string) => {
    ipcRenderer.invoke("ble-connect", mac, pin).then((res: any) => {
      fetchDevices();

      if (res == "ok") {
        setIsOpen(false);
        return;
      }

      setIsOpen(true);
      setConnectDevice(mac);
      setConnectPin(null);
    });
  };

  return (
    <div className="flex flex-col gap-2 p-4 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Bluetooth Devices
        </h1>
        <button
          onClick={fetchDevices}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-sm font-medium"
        >
          <Icons.PiArrowsClockwise />
          Refresh
        </button>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => handleConnect(connectDevice!)(connectPin!)}
        title={`Connect to device`}
        size="sm"
        confirmText="Connect"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            This device requires a PIN to connect
          </p>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="pin" className="text-sm font-medium text-gray-700">
              PIN Code
            </label>
            <div className="relative">
              <input
                id="pin"
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400 text-gray-800"
                placeholder="Enter device PIN"
                value={connectPin || ""}
                onChange={(e) => setConnectPin(e.target.value)}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icons.PiLock />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The PIN may be displayed on the device or in its documentation
            </p>
          </div>
        </div>
      </Dialog>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
          <p className="text-gray-600">Scanning for devices...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {devices && devices.length > 0 ? (
            devices.map((device) => (
              <div
                key={device.mac}
                className={`
                    relative group 
                    border rounded-xl p-4 
                    transition-all duration-200 
                    hover:shadow-md 
                    ${
                      device.connected === "yes"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }
                    cursor-pointer
                  `}
                onClick={() => handleConnect(device.mac)()}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {device.name || device.alias || "Unknown Device"}
                      </span>
                      {device.connected === "yes" && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Connected
                        </span>
                      )}
                      {device.paired === "yes" && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Paired
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1 gap-4">
                      <span className="text-sm text-gray-500">
                        {device.mac}
                      </span>
                      {device["battery percentage"] && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Icons.PiBatteryFull className="text-gray-400" />
                          {parseInt(device["battery percentage"].split(" ")[0])}
                          %
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {device.trusted === "yes" && (
                      <div className="text-green-500">
                        <Icons.PiShieldCheck size={20} />
                      </div>
                    )}
                    <div
                      className={`
                        ${
                          device.connected === "yes"
                            ? "text-blue-500"
                            : device.paired === "yes"
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {device.connected === "yes" ? (
                        <Icons.PiBluetoothConnected size={20} />
                      ) : device.paired === "yes" ? (
                        <Icons.PiBluetooth size={20} />
                      ) : (
                        <Icons.PiBluetoothX size={20} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-xl group-hover:bg-gray-50 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <Icons.PiBluetooth size={64} className="text-gray-400 mb-2" />
              <p className="text-gray-600">No Bluetooth devices found</p>
              <button
                onClick={fetchDevices}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Scan Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
