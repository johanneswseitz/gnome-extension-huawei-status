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

let _indicator;

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    _indicator = new HuaweiStatusMenuItem({"name": "Huawei Status"});

    let pollIntervalInSeconds = 2;
    Main.panel.addToStatusArea('huawei-status-menu', _indicator, pollIntervalInSeconds, 'right');
    let _eventLoop = Mainloop.timeout_add_seconds(1, Lang.bind(this, function (){
         _updateMenubar();
         return true;
    }));
}

function _updateMenubar() {
    getData().then(function(response) {
        let signalStrength = response["signalIcon"];
        _indicator.iconChanged('signal-' + signalStrength);
        _indicator.show();
    }, function(error) {
        _indicator.hide();
    });
}

function disable() {
    _indicator.destroy();
}

const HuaweiStatusMenuItem = new Lang.Class({
    Name: 'HuaweiStatusMenuItem',
    Extends: PanelMenu.Button,

    _init: function(info) {
	this.parent();
	this._info = info;
        this._icon = new St.Icon({ icon_name: 'signal-1',
                             style_class: 'system-status-icon' });
	this.actor.add_child(this._icon);
    },

    activate: function(event) {
	this._info.launch(event.get_time());
	this.parent(event);
    },


    destroy: function() {
        this.parent();
    },

    iconChanged: function(newIcon) {
        this._icon.set_icon_name(newIcon);
    },
});

