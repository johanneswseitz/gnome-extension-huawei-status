const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const getData = Me.imports.huawei._getHuaweiStatus;
const Mainloop = imports.mainloop;
const Lang = imports.lang;

let text, button;

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showString(string){
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: string });
        Main.uiGroup.add_actor(text);
    }
       
    text.opacity = 255;
    let monitor = Main.layoutManager.primaryMonitor;
    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                         Math.floor(monitor.height / 2 - text.height / 2));
    Tweener.addTween(text,
                    { opacity: 0,
                      time: 2,
                      transition: 'easeOutQuad',
                      onComplete: _hideHello });
}

function init(extensionMeta) {
    button = new St.Bin({ style_class: 'mifi-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: false,
                          y_fill: false,
                          track_hover: true });
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

    let icon = new St.Icon({ icon_name: 'signal-1',
                         style_class: 'system-status-icon' });
    button.set_child(icon);
    button.connect('button-press-event', _showData);
}

function _showData() {
    getData().then(function(response) {
        let battery = response["batteryPercentage"];
        _showString(battery);
    }, function(error) {
        _showString("ERROR");
    });
}

function _updateMenubar() {
    getData().then(function(response) {
        let signalStrength = response["signalIcon"];
        let icon = new St.Icon({ icon_name: 'signal-' + signalStrength,
                         style_class: 'system-status-icon' });
        button.show();
        button.set_child(icon);
    }, function(error) {
        button.hide();
    });
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
    let _eventLoop = Mainloop.timeout_add_seconds(1, Lang.bind(this, function (){
         _updateMenubar();
         return true;
    }));
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
