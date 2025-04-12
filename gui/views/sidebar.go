package sidebar_view

import "github.com/diamondburned/gotk4/pkg/gtk/v4"

func Get() *gtk.Box {
	box := gtk.NewBox(gtk.OrientationVertical, 0)

	box.SetCSSClasses([]string{"sidebar"})
	box.SetSizeRequest(300, 0)

	label := gtk.NewLabel("HyprSettings")
	label.SetCSSClasses([]string{"sidebar-label"})
	label.SetHAlign(gtk.AlignStart)

	box.Append(label)

	return box
}