package sidebar_view

import (
	"github.com/diamondburned/gotk4/pkg/gtk/v4"
	"github.com/diamondburned/gotk4/pkg/pango"
)

type MenuItem struct {
	Label    string
	IsActive bool
	OnClick  func()
}

type SidebarSection struct {
	Title string
	Items []MenuItem
}

func createMenuItem(item MenuItem) *gtk.Box {
	itemBox := gtk.NewBox(gtk.OrientationHorizontal, 8)
	itemBox.SetCSSClasses([]string{"sidebar-item"})
	if item.IsActive {
		itemBox.AddCSSClass("active")
	}

	labelWidget := gtk.NewLabel(item.Label)
	labelWidget.SetHAlign(gtk.AlignStart)
	labelWidget.SetEllipsize(pango.EllipsizeEnd)

	itemBox.Append(labelWidget)

	if item.OnClick != nil {
		gesture := gtk.NewGestureClick()
		gesture.SetButton(1)
		gesture.ConnectReleased(func(n int, x, y float64) {
			item.OnClick()
		})
		itemBox.AddController(gesture)
	}

	return itemBox
}

func createSectionTitle(title string) *gtk.Label {
	sectionLabel := gtk.NewLabel(title)
	sectionLabel.SetCSSClasses([]string{"sidebar-section-title"})
	sectionLabel.SetHAlign(gtk.AlignStart)

	return sectionLabel
}

func createDivider() *gtk.Box {
	divider := gtk.NewBox(gtk.OrientationHorizontal, 0)
	divider.SetCSSClasses([]string{"sidebar-divider"})
	return divider
}

func Get() *gtk.Box {
	return GetConfigurable("HyprSettings", getDefaultSections(), "v1.0.0")
}

func GetConfigurable(title string, sections []SidebarSection, version string) *gtk.Box {
	box := gtk.NewBox(gtk.OrientationVertical, 0)
	box.SetCSSClasses([]string{"sidebar"})
	box.SetSizeRequest(300, -1)

	titleBox := gtk.NewBox(gtk.OrientationHorizontal, 0)
	titleBox.SetHAlign(gtk.AlignStart)

	label := gtk.NewLabel(title)
	label.SetCSSClasses([]string{"sidebar-label"})
	label.SetHAlign(gtk.AlignStart)
	label.SetSizeRequest(300, -1)

	titleBox.Append(label)
	box.Append(titleBox)

	contentBox := gtk.NewBox(gtk.OrientationVertical, 0)
	box.Append(contentBox)

	for i, section := range sections {
		if i > 0 {
			contentBox.Append(createDivider())
		}

		sectionTitle := createSectionTitle(section.Title)
		contentBox.Append(sectionTitle)

		for _, item := range section.Items {
			menuItem := createMenuItem(item)
			contentBox.Append(menuItem)
		}
	}

	if version != "" {
		spacer := gtk.NewBox(gtk.OrientationVertical, 0)
		spacer.SetVExpand(true)
		contentBox.Append(spacer)

		versionLabel := gtk.NewLabel(version)
		versionLabel.SetHAlign(gtk.AlignStart)
		versionLabel.SetOpacity(0.7)
		contentBox.Append(versionLabel)
	}

	return box
}

func getDefaultSections() []SidebarSection {
	return []SidebarSection{
		{
			Title: "Wireless",
			Items: []MenuItem{
				{Label: "WiFi", IsActive: true},
				{Label: "Bluetooth", IsActive: false},
			},
		},
	}
}
