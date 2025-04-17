package wifi

import (
	"os/exec"

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

			device.RequestScan()

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

				networks = append(networks, WiFiNetwork{
					SSID: ssid,
					MAC:  bssid,
				})
			}
		}
	}

	return networks, nil
}

func FixConnectionBug(ssid string) error {
	cmd := exec.Command("nmcli", "connection", "delete", ssid)

	if err := cmd.Run(); err != nil {
		println("Error deleting connection:", err)

		return err
	}

	return nil
}

func ConnectToWifi(ssid string, password string, afterPatch bool) error {
	cmd := exec.Command("nmcli", "device", "wifi", "connect", ssid)

	if len(password) > 0 {
		cmd = exec.Command("nmcli", "device", "wifi", "connect", ssid, "password", password)
	}

	if err := cmd.Run(); err != nil {
		if !afterPatch && len(password) > 0 {
			FixConnectionBug(ssid)

			return ConnectToWifi(ssid, password, true)
		}

		println("Error connecting to WiFi:", err)

		return err
	}

	return nil
}
