package gui

import (
	sidebar_view "hyprsettings/gui/views"
	"hyprsettings/gui/views/pages"
	"os"

	_ "embed"

	"github.com/diamondburned/gotk4/pkg/gdk/v4"
	"github.com/diamondburned/gotk4/pkg/gio/v2"
	"github.com/diamondburned/gotk4/pkg/gtk/v4"
)

//go:embed styles/sidebar.css
var sidebarCSS string

//go:embed styles/pages/wifi.css
var wifiCSS string

func Create() {
	app := gtk.NewApplication("tech.mpdev.hyprsettings", gio.ApplicationDefaultFlags)

	app.ConnectActivate(func() {
		activate(app)
	})

	if code := app.Run(os.Args); code != 0 {
		os.Exit(code)
	}
}

func activate(app *gtk.Application) {
	gtk.StyleContextAddProviderForDisplay(
		gdk.DisplayGetDefault(), LoadCss(sidebarCSS), gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
	)
	gtk.StyleContextAddProviderForDisplay(
		gdk.DisplayGetDefault(), LoadCss(wifiCSS), gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
	)

	appView := gtk.NewBox(gtk.OrientationHorizontal, 0)

	window := gtk.NewApplicationWindow(app)
	window.SetTitle("HyprSettings")

	appView.Append(sidebar_view.Get())
	appView.Append(pages.GetWifiPage(window))

	window.SetChild(appView)
	window.SetVisible(true)
}

func LoadCss(content string) *gtk.CSSProvider {
	provider := gtk.NewCSSProvider()

	provider.ConnectParsingError(func(sec *gtk.CSSSection, err error) {
		loc := sec.StartLocation()

		println("Error parsing CSS at line", loc.Lines())
	})

	provider.LoadFromString(content)

	return provider
}
