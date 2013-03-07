define([], function() {
'use strict';
// Message Pusher Service
return ['wdDev', '$log',
function(wdDev,   $log) {

var url = wdDev.wrapURL('/service/notification');

var websocket;
var channels = {};

return {
    start: function() {
        if (websocket) { return; }
        websocket = new WebSocket('ws:' + url);
        websocket.onmessage = function(e) {
            $log.log('socket', e.data);
            var message = JSON.parse(e.data);
            var channel = channels[message.type];
console.log(channels, channel, message);
            if (channel) {
                channel.forEach(function(callback) {
                    callback(message);
                });
            }
        };
        return this;
    },
    stop: function() {
        websocket.close();
        websocket = websocket.onmessage = null;
        return this;
    },
    channel: function(id, callback) {
        if (!channels[id]) {
            channels[id] = [];
        }
        channels[id].push(callback);
        return this;
    },
    clear: function() {
        channels = {};
        return this;
    }
};

}];
});
