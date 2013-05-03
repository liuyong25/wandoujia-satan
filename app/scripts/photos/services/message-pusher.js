define([
    'jquery'
], function(
    jQuery
) {
'use strict';
// Message Pusher Service
return ['wdDev', '$log', '$timeout',
function(wdDev,   $log,   $timeout) {

var INIT_TIMEOUT = 30;

var websocket;
var channels = jQuery({});
var guid;
var timer;
var retryCount = 0;

function startHeartbeat() {
    (function beat() {
        // Form into message.
        var msg = {
            type: 'connection.ping',
            data: {}
        };
        if (guid) {
            msg.data.id = guid;
        }
        // Send ping message.
        websocket.send(JSON.stringify(msg));

        // Waiting for pong.
        channels.one('connection_pong', function(e, msg) {
            $timeout.cancel(timer);
            retryCount = 0;  // reset retry.
            timer = $timeout(beat, INIT_TIMEOUT. false);
            if (msg.data.id) {
                guid = msg.data.id;
            }
        });

        // Timeout.
        timer = $timeout(function() {
            channels.off('connection_pong');

            $log.log('WebSocket no response, already retried for ' + retryCount + ' times.');

            // Record retry times.
            retryCount += 1;

            // Try restore first then sentence to dead when touch 5.
            timer = $timeout(function() {
                if (retryCount > 5) {
                    $log.log('WebSocket is cold dead...');
                }
                else if (retryCount > 1) {
                    pusher.stop().start();
                }
                else {
                    beat();
                }
            }, INIT_TIMEOUT * retryCount, false);
        }, INIT_TIMEOUT, false);
    })();
}
function stopHeartbeat() {
    $timeout.cancel(timer);
    channels.off('connection_pong');
}

var pusher = {
    start: function() {
        if (websocket) { return; }
        // Attempt connecting.
        websocket = new WebSocket('ws:' + wdDev.wrapURL('/service/notification'));
        // Failed when attempting.
        websocket.onerror = function(e) {
            $log.warn('Cannot connect with server!', e);
        };
        // Receive message then delegate to channels.
        websocket.onmessage = function(e) {
            var message;
            try {
                message = JSON.parse(e.data);
            }
            catch (err) {
                $log.warn('Invalid message data: ', e.data);
                return;
            }
            $log.log('socket', e.data);
            // Delegate to event emitter.
            channels.triggerHandler(message.type.replace('.', '_'), [message]);
        };
        // Keep alive.
        websocket.onopen = function() {
            // startHeartbeat();
        };
        return this;
    },
    stop: function() {
        stopHeartbeat();
        if (websocket) {
            websocket.close();
            websocket = websocket.onmessage = websocket.onerror = websocket.onopen = null;
        }
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

return pusher;

}];
});
