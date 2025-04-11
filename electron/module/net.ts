import * as wifi from "node-wifi";

export default class Net {
  constructor() {
    wifi.init({
      iface: null,
    });
  }

  list() {
    return wifi.scan();
  }
}
