cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
        "id": "cordova-plugin-geolocation.geolocation",
        "clobbers": [
            "navigator.geolocation"
        ]
    },
    {
        "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
        "id": "cordova-plugin-geolocation.PositionError",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
        "id": "cordova-plugin-inappbrowser.inappbrowser",
        "clobbers": [
            "cordova.InAppBrowser.open",
            "window.open"
        ]
    },
    {
        "file": "plugins/at.oneminutedistraction.phonenumber/www/phonenumber.js",
        "id": "at.oneminutedistraction.phonenumber.PhoneNumber",
        "clobbers": [
            "phonenumber"
        ]
    },
    {
        "file": "plugins/cordova-plugin-facebook/www/CordovaFacebook.js",
        "id": "cordova-plugin-facebook.CordovaFacebook",
        "clobbers": [
            "CordovaFacebook"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-compat": "1.0.0",
    "cordova-plugin-geolocation": "2.2.0",
    "cordova-plugin-inappbrowser": "1.4.0",
    "at.oneminutedistraction.phonenumber": "0.0.1",
    "cordova-plugin-facebook": "0.2.2"
};
// BOTTOM OF METADATA
});