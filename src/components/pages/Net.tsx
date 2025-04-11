import { useEffect, useState } from "react";

declare const ipcRenderer: any;

export default function Net() {
  const [networks, setNetworks] = useState<
    | null
    | {
        ssid: string;
        bssid: string;
        mac: string;
        mode: string;
        channel: number;
        frequency: number;
        signal_level: number;
        security: string[];
        quality: number;
        security_flags: string[];
      }[]
  >(null);

  useEffect(() => {
    ipcRenderer.invoke("net-list").then(setNetworks);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl">Network</h1>
      <div className="flex flex-col gap-2">
        {networks
          ? networks.map((network) => (
              <div
                key={network.mac}
                className="shadow-xs border border-gray-200 rounded-md px-4 py-3 flex flex-row"
              >
                <p>{network.ssid}</p>
              </div>
            ))
          : ""}
      </div>
    </div>
  );
}
