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

let _indicator, _backgroundUpdateTag;

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    let pollIntervalInSeconds = 2;
    _indicator = new HuaweiStatusMenu();
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
        _indicator.actor.show();
    }, function(error) {
        global.log("ERROR");
        for (func in _indicator) {
            global.log(func);
        }
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
        this._icon = new St.Icon({ icon_name: 'signal-0',
                             style_class: 'system-status-icon huawei-status-icon' });
	this.actor.add_child(this._icon);
    },

    destroy: function() {
        this.parent();
    },

    changeIcon: function(newIcon) {
        this._icon.set_icon_name(newIcon);
    },
});

