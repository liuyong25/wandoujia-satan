define([
    'underscore'
], function(
    _
) {
'use strict';

return ['$q', '$http', function($q, $http) {

function Message(rawData) {
    rawData = rawData || {};

    _.extend(this, rawData);

    var instance = Object.create(this, {
        rawData: { value: this }
    });

    instance._collection = null;
    instance.isSeparator = false;

    return instance;
}

Object.defineProperties(Message.prototype, {
    cid:        {get: function() { return this.thread_id; }},
    isNew:      {get: function() { return typeof this.id !== 'number'; }},
    isRead:     {get: function() { return !!this.read; }},
    isPending:  {get: function() { return this.status === 32; }},
    isError:    {get: function() { return this.status === 64; }},
    isSMS:      {get: function() { return this.category === 0; }},
    isMMS:      {get: function() { return this.category === 1; }}
});

_.extend(Message.prototype, {
    /**
     * Update data from server
     * @return {Promise} Resolve by updated Message instance
     */
    fetch: function() {
        if (this.isNew) {
            return $q.when(this);
        }
        return this._collection.fetch(this.id);
    },

    /**
     * Send or resend message decided by this.isNew
     * @return {Promise} Resolve by updated Message instance
     */
    send: function() {
        var self = this;
        var config;
        this.rawData.status = 32;
        if (this.isNew) {
            config = {
                method: 'POST',
                url: '/resource/messages/send',
                data: {
                    addresses: [this.address],
                    body: this.body
                }
            };
        }
        else {
            config = {
                method: 'GET',
                url: '/resource/messages/' + this.id + '/resend'
            };
        }
        return $http(config).then(function success(response) {
            if (response.data && response.data.length) {
                self.extend(response.data[0]);
                if (self._collection) {
                    self._collection.sort();
                }
            }
            return self;
        }, function error() {
            self.rawData.status = 64;
            return $q.reject();
        });
    },

    /**
     * Merge data from rawData or another Message
     * @param  {Object|Message} newData
     */
    extend: function(newData) {
        if (typeof newData.extend === 'function') {
            newData = newData.rawData;
        }
        _.extend(this.rawData, newData);
    }
});

return {
    Message: Message,
    createMessage: function(rawData) {
        return new Message(rawData);
    }
};

}];
});
