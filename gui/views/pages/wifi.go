package pages

import (
	"hyprsettings/func/net/wifi"

	"github.com/diamondburned/gotk4/pkg/gtk/v4"
)

func GetWifiPage() *gtk.Box {
	wifiPage := gtk.NewBox(gtk.OrientationVertical, 5)
	wifiPage.SetCSSClasses([]string{"wifi-page"})

	label := gtk.NewLabel("WiFi Networks")
	label.SetCSSClasses([]string{"wifi-label"})
	label.SetHAlign(gtk.AlignStart)

	wifiPage.Append(label)

	networks, err := wifi.ListWifi()

	if err != nil {
		errorLabel := gtk.NewLabel("Error fetching WiFi networks")
		errorLabel.SetCSSClasses([]string{"wifi-error-label"})

		wifiPage.Append(errorLabel)

		return wifiPage
	}

	for _, network := range networks {
		wifiPage.Append(GetNetwork(network.SSID))
	}

	return wifiPage
}

func GetNetwork(ssid string) *gtk.Box {
	networkButton := gtk.NewButton()
	networkButton.SetCSSClasses([]string{"network-button"})

	networkButton.ConnectClicked(func() {
		println("Connecting to network:", ssid)
	})

	networkContainer := gtk.NewBox(gtk.OrientationVertical, 0)
	networkContainer.SetCSSClasses([]string{"network-container"})
	networkContainer.SetHExpand(true)

	networkLabel := gtk.NewLabel(ssid)
	networkLabel.SetCSSClasses([]string{"network-label"})
	networkLabel.SetHAlign(gtk.AlignStart)

	networkContainer.Append(networkLabel)
	networkButton.SetChild(networkContainer)

	outerContainer := gtk.NewBox(gtk.OrientationVertical, 0)
	outerContainer.Append(networkButton)

	return outerContainer
}
