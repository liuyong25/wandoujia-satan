define([
    'jquery'
], function(
    jQuery
) {
'use strict';
// Message Pusher Service
return ['wdDev', '$log',
function(wdDev,   $log) {

var websocket;
var channels = jQuery({});

return {
    start: function() {
        if (websocket) { return; }
        websocket = new WebSocket('ws:' + wdDev.wrapURL('/service/notification'));
        websocket.onmessage = function(e) {
            $log.log('socket', e.data);
            var message = JSON.parse(e.data);
            channels.triggerHandler(message.type.replace('.', '_'), [message]);
        };
        // websocket.onerror = function(e) {
        //     console.log(arguments);
        // };
        return this;
    },
    stop: function() {
        websocket.close();
        websocket = websocket.onmessage = null;
        return this;
    },
    channel: function() {
        channels.on.apply(channels, arguments);
        return this;
    },
    unchannel: function() {
        channels.off.apply(channels, arguments);
        return this;
    },
    clear: function() {
        channels = jQuery({});
        return this;
    }
};

}];
});
