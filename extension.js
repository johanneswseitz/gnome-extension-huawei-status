const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup;
const Me = imports.misc.extensionUtils.getCurrentExtension();


let text, button;

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _getData() {
  let get_cookie = Soup.Message.new('GET', 'http://www.huaweimobilewifi.com');
  _httpSession.queue_message(get_cookie, function(session, message) {
      let message = Soup.Message.new('GET', 'http://www.huaweimobilewifi.com/api/monitoring/status');
      _httpSession.queue_message(message, function(session, message) {
          if (message.status_code === 200) {
              let content = message.response_body.data;
              let oxml=new XML.REXML(content.replace('<?xml version="1.0" encoding="utf-8" ?>',''));
              let batteryPercentage = oxml.rootElement.childElement("BatteryPercent").text;
              _showString(batteryPercentage);
          } else {
              _showString("No HUAWEI");
          }
    });
  });
}

function _showString(string){
       if (!text) {
           text = new St.Label({ style_class: 'helloworld-label', text: string });
           Main.uiGroup.add_actor(text);
       }
       
       text.opacity = 255;
       
       /*
         we have to choose the monitor we want to display the hello world label. Since in gnome-shell
         always has a primary monitor, we use it(the main monitor)
        */
       let monitor = Main.layoutManager.primaryMonitor;
   
       /*
        we change the position of the text to the center of the monitor.
        */
       text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                         Math.floor(monitor.height / 2 - text.height / 2));
   
       /*And using tweener for the animations, we indicate to tweener that we want
         to go to opacity 0%, in 2 seconds, with the type of transition easeOutQuad, and,
         when this animation has completed, we execute our function _hideHello.
         REFERENCE: http://hosted.zeh.com.br/tweener/docs/en-us/
        */
       Tweener.addTween(text,
                        { opacity: 0,
                          time: 2,
                          transition: 'easeOutQuad',
                          onComplete: _hideHello });
}

function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: true,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon' });
    button.set_child(icon);
    button.connect('button-press-event', _getData);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
        //this._eventLoop = Mainloop.timeout_add_seconds(settings.get_int('update-time'), Lang.bind(this, function (){
       //     this._querySensors();
            // readd to update queue
       //     return true;
        //}));
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
