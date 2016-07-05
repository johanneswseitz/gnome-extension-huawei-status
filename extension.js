/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const getData = Me.imports.huawei._getHuaweiStatus;
const Mainloop = imports.mainloop;
const Lang = imports.lang;

let _indicator, _backgroundUpdateTag, _batteryEntry, _messageEntry, _usersEntry;

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    let pollIntervalInSeconds = 2;
    _indicator = new HuaweiStatusMenu();
    _updateMenubar();
    Main.panel.addToStatusArea('huawei-status-menu', _indicator, 0, 'right');
    _backgroundUpdateTag = Mainloop.timeout_add_seconds(pollIntervalInSeconds, Lang.bind(this, function (){
         _updateMenubar();
         return true;
    }));
}

function _updateMenubar() {
    getData().then(function(response) {
        let signalStrength = response["signalIcon"];
        _indicator.changeIcon('signal-' + signalStrength);
	_indicator.changeNetworkLabel(response["networkType"]);
        _indicator.actor.show();
    }, function(error) {
        _indicator.actor.hide();
    });
}

function disable() {
    _indicator.destroy();
    Mainloop.source_remove(_backgroundUpdateTag);
}

const HuaweiStatusMenu = new Lang.Class({
    Name: 'HuaweiStatusMenu',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Huawei Status");
        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        this._icon = new St.Icon({ icon_name: 'signal-0',
                             style_class: 'system-status-icon huawei-status-icon' });
	hbox.add_child(this._icon);
        this._connectionLabel = new St.Label({ text: _("3G"),
                                   y_expand: true,
                                   y_align: Clutter.ActorAlign.CENTER });
	hbox.add_child(this._connectionLabel);
        this.actor.add_actor(hbox);
	_batteryEntry = new HuaweiMenuItem({icon : "battery", label : _("NO DATA")});
	this.menu.addMenuItem(_batteryEntry);
	_usersEntry = new HuaweiMenuItem({icon : "network-wireless", label : _("NO DATA")});
	this.menu.addMenuItem(_usersEntry);
	_messageEntry = new HuaweiMenuItem({icon : "mail-unread", label : _("NO DATA")});
	this.menu.addMenuItem(_messageEntry);
    },

    changeIcon: function(newIcon) {
        this._icon.set_icon_name(newIcon);
    },

    changeNetworkLabel: function(newNetworkLabel) {
        this._connectionLabel.set_text(_(newNetworkLabel));
    },

    destroy: function() {
        this.parent();
    },

});


const HuaweiMenuItem = new Lang.Class({
    Name: 'PlaceMenuItem',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function(info) {
	this.parent();
	this._info = info;
        this._icon = new St.Icon({ icon_name: info.icon,
                                   style_class: "system-status-icon huawei-popup-menu-item",
                                   icon_size: 16 });
	this.actor.add_child(this._icon);

        this._label = new St.Label({ text: info.label });
        this.actor.add_child(this._label);
    },

    setIcon: function(newIconName) {
	this._icon.set_icon_name(newIconName);
    },

    setLabel: function(newLabelText) {
	this._label.set_text(_(newLabelText));
    },

    activate: function(event) {
	this.parent(event);
    },

    destroy: function() {
        this.parent();
    },
});


