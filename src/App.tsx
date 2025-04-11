import { useEffect, useState } from "react";
import Net from "./components/pages/Net";

declare const ipcRenderer: any;

export default function App() {
  return (
    <div className="flex flex-row w-screen h-screen">
      <div className="flex w-64 shadow-sm p-4 flex-col gap-2">
        <p className="text-lg">Hyprsettings</p>
        <div className="flex flex-col gap-px">
          <a
            href="#net"
            className="text-black/70 hover:text-black/90 transition duration-200"
          >
            Network
          </a>
          <a
            href="#bluetooth"
            className="text-black/70 hover:text-black/90 transition duration-200"
          >
            Bluetooth
          </a>
        </div>
      </div>
      <div className="flex flex-col w-full h-full p-4">
        <Net />
      </div>
    </div>
  );
}
