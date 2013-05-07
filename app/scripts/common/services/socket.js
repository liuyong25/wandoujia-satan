define([
    'io'
], function(
    io
) {
'use strict';

return ['wdEventEmitterProvider', 'wdDevProvider', function(wdEventEmitterProvider, wdDevProvider) {

this.$get = ['wdDev', '$log', function(wdDev, $log) {
    return Object.create(socket)._init($log);
}];

/*
 * Socket prototype
 */
var socket = {

    /**
     * Prepare instance.
     * Can just called once.
     * @protected
     */
    _init: function(log) {

        // Prevent 'init' to be called other than once.
        this.init = function() {};

        // Mixin event emitter behavior.
        wdEventEmitterProvider.EventEmitter(this);

        this._transport = null;
        this._log = log;

        return this;
    },

    /**
     * Destroy everything.
     */
    destroy: function() {
        this.close();
        this.off();
        return this;
    },

    connect: function() {
        if (this._transport) { return; }

        this._transport = io.connect(wdDevProvider.getSocketServer(), {
            transports: [
                'websocket',
                'htmlfile',
                'xhr-multipart',
                'xhr-polling',
                'jsonp-polling'
            ]
        });

        this._delegateEventListeners();

        return this;
    },

    _delegateEventListeners: function() {
        if (!this._transport) { return; }

        var self = this;

        this._transport.on('message', function onMessage(message) {
            try {
                message = JSON.parse(message);
            }
            catch (err) {
                self._log.warn('Invalid message data: ', message);
                return;
            }
            self._log.log('socket: ', message);
            self.trigger(message.type.replace('.', '_'), [message]);
        });

        this._transport.on('disconnect', function disconnect() {
            self._log.error('Socket disconnected!');
        });

        this._transport.on('reconnecting', function reconnecting(reconnectionDelay, reconnectionAttempts) {
            self._log.log('Socket will try reconnect after ' + reconnectionDelay + ' ms, for ' + reconnectionAttempts + ' times.');
        });

        this._transport.on('reconnect', function reconnect() {
            self._log.log('Socket reconnected!');
        });

        this._transport.on('reconnect_failed', function failed() {
            self._log.warn('Socket server seems cold dead...');
        });

        this._transport.on('connect_failed', function() {
            self._log.warn('Socket fails to establish.');
        });
    },

    close: function() {
        if (this._transport) {
            this._transport.disconnect();
            this._transport.removeAllListeners();
            this._transport = null;
        }
        return this;
    }
};

}];
});
