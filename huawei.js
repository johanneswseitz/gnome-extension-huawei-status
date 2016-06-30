const Me = imports.misc.extensionUtils.getCurrentExtension();
const XML = Me.imports.rexml;
const Soup = imports.gi.Soup;
const Promise = Me.imports.promise.Promise;

// TODO: timeout?
const _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.CookieJar());

function _getHuaweiStatus() {
    return _firstRequestToSetSessionCookie().then(function() {
        return _secondRequestToGetMonitoringStatus();
    });
}

function _firstRequestToSetSessionCookie(done) {
    return new Promise(function(resolve, reject) {
        let get_cookie = Soup.Message.new('GET', 'http://www.huaweimobilewifi.com');
        _httpSession.queue_message(get_cookie, function(session, message){
            resolve(message);
        });
    });
}

function _secondRequestToGetMonitoringStatus(){
    return new Promise(function(resolve, reject) {
        let message = Soup.Message.new('GET', 'http://www.huaweimobilewifi.com/api/monitoring/status');
        _httpSession.queue_message(message, function(session, message) {
            if (message.status_code === 200) {
                let content = message.response_body.data;
                resolve(_extractDataFromStatusXML(content));
            } else {
                reject(Error("Huawei not reachable"));
            }
        });
    });
}

function _extractDataFromStatusXML(theStatusXML) {
    let oxml=new XML.REXML(theStatusXML.replace('<?xml version="1.0" encoding="utf-8" ?>',''));
    let batteryPercentage = oxml.rootElement.childElement("BatteryPercent").text;
    let signalIcon = oxml.rootElement.childElement("SignalIcon").text;
    return {
        "batteryPercentage" : batteryPercentage,
        "signalIcon" : signalIcon
    };
}
