package pages

import (
	"hyprsettings/func/net/wifi"

	"github.com/diamondburned/gotk4/pkg/gtk/v4"
)

func GetWifiPage(win *gtk.ApplicationWindow) *gtk.Box {
	wifiPage := gtk.NewBox(gtk.OrientationVertical, 5)
	wifiPage.SetCSSClasses([]string{"wifi-page"})

	// Header section
	label := gtk.NewLabel("WiFi Networks")
	label.SetCSSClasses([]string{"wifi-label"})
	label.SetHAlign(gtk.AlignStart)
	wifiPage.Append(label)

	// Create a scrolled window for the network list
	scrolledWindow := gtk.NewScrolledWindow()
	scrolledWindow.SetVExpand(true) // Make it expand vertically
	scrolledWindow.SetHExpand(true) // Make it expand horizontally
	scrolledWindow.SetPolicy(gtk.PolicyAutomatic, gtk.PolicyAutomatic)
	scrolledWindow.SetCSSClasses([]string{"wifi-scrolled-container"})

	// Create a container for the network items
	networksContainer := gtk.NewBox(gtk.OrientationVertical, 5)
	networksContainer.SetCSSClasses([]string{"networks-container"})

	networks, err := wifi.ListWifi()

	if err != nil {
		errorLabel := gtk.NewLabel("Error fetching WiFi networks")
		errorLabel.SetCSSClasses([]string{"wifi-error-label"})
		networksContainer.Append(errorLabel)
	} else {
		for _, network := range networks {
			networksContainer.Append(GetNetwork(network.SSID, win))
		}
	}

	// Add the networks container to the scrolled window
	scrolledWindow.SetChild(networksContainer)

	// Add the scrolled window to the main page
	wifiPage.Append(scrolledWindow)

	return wifiPage
}

func GetNetwork(ssid string, win *gtk.ApplicationWindow) *gtk.Box {
	networkButton := gtk.NewButton()
	networkButton.SetCSSClasses([]string{"network-button"})

	networkButton.ConnectClicked(func() {
		err := wifi.ConnectToWifi(ssid, "", false)

		if err != nil {
			dialog := gtk.NewDialogWithFlags("Enter password", &win.Window, gtk.DialogModal)

			contentBox := gtk.NewBox(gtk.OrientationVertical, 10)
			contentBox.SetSpacing(10)
			contentBox.SetMarginTop(10)
			contentBox.SetMarginBottom(10)
			contentBox.SetMarginStart(10)
			contentBox.SetMarginEnd(10)

			// Add a header with network name
			networkHeader := gtk.NewLabel("Connect to " + ssid)
			networkHeader.SetHAlign(gtk.AlignStart)
			networkHeader.SetCSSClasses([]string{"wifi-dialog-header"})
			contentBox.Append(networkHeader)

			// Add password label and entry in a container
			passwordContainer := gtk.NewBox(gtk.OrientationVertical, 5)
			passwordLabel := gtk.NewLabel("Password:")
			passwordLabel.SetHAlign(gtk.AlignStart)
			passwordContainer.Append(passwordLabel)

			passwordEntry := gtk.NewPasswordEntry()
			passwordEntry.SetHExpand(true)
			passwordContainer.Append(passwordEntry)
			contentBox.Append(passwordContainer)

			// Add some spacing
			contentBox.Append(gtk.NewSeparator(gtk.OrientationHorizontal))

			// Button box with right alignment
			buttonBox := gtk.NewBox(gtk.OrientationHorizontal, 10)
			buttonBox.SetHAlign(gtk.AlignEnd)
			buttonBox.SetMarginTop(10)

			cancelButton := gtk.NewButtonWithLabel("Cancel")
			cancelButton.ConnectClicked(func() {
				dialog.Destroy()
			})

			acceptButton := gtk.NewButtonWithLabel("Connect")
			acceptButton.SetCSSClasses([]string{"suggested-action"})
			acceptButton.ConnectClicked(func() {
				dialog.Destroy()
				wifi.ConnectToWifi(ssid, passwordEntry.Text(), false)
			})

			buttonBox.Append(cancelButton)
			buttonBox.Append(acceptButton)
			contentBox.Append(buttonBox)

			dialog.SetChild(contentBox)

			dialog.SetVisible(true)
		}
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
