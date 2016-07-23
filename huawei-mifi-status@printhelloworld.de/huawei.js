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
    let wifiUsers = oxml.rootElement.childElement("CurrentWifiUser").text;
    let networkType = oxml.rootElement.childElement("CurrentNetworkType").text;
    let signalIcon = oxml.rootElement.childElement("SignalIcon").text;
    let batteryStatus = oxml.rootElement.childElement("BatteryStatus").text;
    return {
	"networkType": _getNetworkType(networkType),
        "wifiUsers": wifiUsers,
        "batteryPercentage" : batteryPercentage,
        "batteryStatus" : batteryStatus,
        "signalIcon" : signalIcon,
    };
}

function _getNetworkType(networkType) {
    var NO_SERVICE = '0';
    var GSM = '1';
    var GPRS = '2';
    var EDGE = '3';
    var WCDMA = '4';
    var HSDPA = '5';
    var HSUPA = '6';
    var HSPA = '7';
    var TDSCDMA = '8';
    var HSPA_PLUS = '9';
    var EVDO_REV_0 = '10';
    var EVDO_REV_A = '11';
    var EVDO_REV_B = '12';
    var RTT = '13';
    var UMB = '14';
    var EVDV = '15';
    var RTT = '16';
    var HSPA_PLUS_64QAM = '17';
    var HSPA_PLUS_MIMO = '18';
    var LTE = '19';
 
    switch (networkType){
	case NO_SERVICE:
	    return "No Service";
	case GSM:
	case GPRS:
	case EDGE:
	case RTT:
	case EVDV:
	    return "2G";
	case WCDMA:
	case TDSCDMA:
	case EVDO_REV_0:
	case EVDO_REV_A:
	case EVDO_REV_B:
	case HSDPA:
	case HSUPA:
	case HSPA:
	case HSPA_PLUS:
	case HSPA_PLUS_64QAM:
	case HSPA_PLUS_MIMO:
	    return "3G";
	case LTE:
	    return "4G";
	default:
	    return "??";
   }
}
