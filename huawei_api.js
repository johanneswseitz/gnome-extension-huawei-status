const XML = Me.imports.rexml;


// TODO: timeout?
const _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.CookieJar());

function _getData() {
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


function _firstRequestToSetSessionCookie(done) {
  let get_cookie = Soup.Message.new('GET', 'http://www.huaweimobilewifi.com');
  _httpSession.queue_message(get_cookie, done);
}
