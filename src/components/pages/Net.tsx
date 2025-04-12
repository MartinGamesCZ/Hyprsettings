import { useEffect, useState } from "react";
import Dialog from "../ui/Dialog";
import * as Icons from "react-icons/pi";

declare const ipcRenderer: any;

export default function Net() {
  const [isOpen, setIsOpen] = useState(false);
  const [networks, setNetworks] = useState<
    | null
    | {
        ssid: string;
        bssid: string;
        active: boolean;
        mode: string;
        channel: number;
        frequency: number;
        signal_strength: number;
        security: string[];
        quality: number;
        security_flags: string[];
      }[]
  >(null);
  const [connNetName, setConnNetName] = useState<string | null>(null);
  const [connNetPass, setConnNetPass] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNetworks = () => {
    setIsLoading(true);
    ipcRenderer.invoke("net-list").then((result: any) => {
      console.log(result);
      setNetworks(result);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchNetworks();

    const intervalId = setInterval(fetchNetworks, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleConnect = (ssid: string) => (pwd?: string) => {
    ipcRenderer.invoke("net-connect", ssid, pwd).then((res: any) => {
      fetchNetworks();

      if (res == "ok") {
        setIsOpen(false);
        return;
      }

      setIsOpen(true);
      setConnNetName(ssid);
      setConnNetPass(null);
    });
  };

  return (
    <div className="flex flex-col gap-2 p-4 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Wireless Networks
        </h1>
        <button
          onClick={fetchNetworks}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-sm font-medium"
        >
          <Icons.PiArrowsClockwise />
          Refresh
        </button>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => handleConnect(connNetName!)(connNetPass!)}
        title={`Connect to "${connNetName}"`}
        size="sm"
        confirmText="Connect"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            This network requires a password to connect
          </p>
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-gray-400 text-gray-800"
                placeholder="Enter network password"
                value={connNetPass || ""}
                onChange={(e) => setConnNetPass(e.target.value)}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icons.PiLock />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password will be securely saved for future connections
            </p>
          </div>
        </div>
      </Dialog>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
          <p className="text-gray-600">Scanning for networks...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {networks && networks.length > 0 ? (
            networks
              .sort((a, b) => (a.signal_strength > b.signal_strength ? -1 : 1))
              .map((network) => (
                <div
                  key={network.bssid}
                  className={`
                    relative group 
                    border rounded-xl p-4 
                    transition-all duration-200 
                    hover:shadow-md 
                    ${
                      network.active
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }
                    cursor-pointer
                  `}
                  onClick={() => handleConnect(network.ssid)()}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {network.ssid}
                        </span>
                        {network.active && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1 gap-4">
                        <span className="text-sm text-gray-500">
                          Channel {network.channel}
                        </span>
                        {network.security.length > 0 && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            {network.security}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-gray-500">
                        {network.security.length > 0 ? (
                          <Icons.PiLock size={20} />
                        ) : (
                          <Icons.PiLockOpen size={20} />
                        )}
                      </div>
                      <div
                        className={`
                        ${
                          network.signal_strength >= 50
                            ? "text-green-500"
                            : network.signal_strength >= 70
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }
                      `}
                      >
                        {network.signal_strength >= 50 ? (
                          <Icons.PiWifiHigh size={20} />
                        ) : network.signal_strength >= 70 ? (
                          <Icons.PiWifiMedium size={20} />
                        ) : (
                          <Icons.PiWifiLow size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-xl group-hover:bg-gray-50 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                </div>
              ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <Icons.PiWifiHigh size={64} />
              <p className="text-gray-600">No wireless networks found</p>
              <button
                onClick={fetchNetworks}
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
