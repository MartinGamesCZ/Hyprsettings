package wifi

import (
	"github.com/Wifx/gonetworkmanager"
)

type WiFiNetwork struct {
	SSID string
	MAC  string
}

func ListWifi() ([]WiFiNetwork, error) {
	netmgr, err := gonetworkmanager.NewNetworkManager()

	if err != nil {
		return nil, err
	}

	devices, err := netmgr.GetDevices()

	if err != nil {
		return nil, err
	}

	var networks []WiFiNetwork

	for _, device := range devices {
		devtype, err := device.GetPropertyDeviceType()

		if err != nil {
			return nil, err
		}

		if devtype == gonetworkmanager.NmDeviceTypeWifi {
			device, err := gonetworkmanager.NewDeviceWireless(device.GetPath())

			if err != nil {
				return nil, err
			}

			nets, err := device.GetAccessPoints()

			if err != nil {
				return nil, err
			}

			for _, net := range nets {
				ssid, err := net.GetPropertySSID()

				if err != nil {
					return nil, err
				}

				bssid, err := net.GetPropertyHWAddress()

				if err != nil {
					return nil, err
				}

				println("SSID:", ssid, "BSSID:", bssid)

				networks = append(networks, WiFiNetwork{
					SSID: ssid,
					MAC:  bssid,
				})
			}
		}
	}

	return networks, nil
}
