define([
    'underscore',
    'messages/services/model'
], function(
    _,
    Model
) {
'use strict';

return ['$q', '$http', function($q, $http) {

var _super = Model.prototype;

function Message(rawData) {

    var instance = _super.constructor.call(this, _.extend({
        id: guid(),
        thread_id: null,
        date: Date.now(),
        read: 1,
        status: 32,
        type: 2,
        category: 0
    }, rawData));

    instance.isSeparator = false;

    return instance;
}

Message.prototype = Object.create(_super, {
    cid:        {get: function() { return this.thread_id; }},
    isRead:     {get: function() { return !!this.read; }},
    isPending:  {get: function() { return this.status === 32; }},
    isError:    {get: function() { return this.status === 64; }},
    isSMS:      {get: function() { return this.category === 0; }},
    isMMS:      {get: function() { return this.category === 1; }},
    url:        {get: function() { return '/resource/messages/' + this.id;}}
});

_.extend(Message.prototype, {

    constructor: Message,

    /**
     * Update data from server
     * @return {Promise} Resolve by updated Message instance
     */
    fetch: function() {
        if (this.isNew) {
            return $q.when(this);
        }

        var self = this;
        return $http.get(this.url).then(function done(response) {
            return self.extend(response.data);
        });
    },

    /**
     * Destroy Message on server
     * @return {Promise} Resolve by Message
     */
    destroy: function() {
        var self = this;
        return $http.delete(this.url).then(function done() {
            return self;
        }, function fail(response) {
            return response.status === 404 ? self : $q.reject();
        });
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
                url: this.url + '/resend'
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
});

function guid() {
    return _.uniqueId('wdmMessage_');
}

return {
    Message: Message,
    createMessage: function(rawData) {
        return new Message(rawData);
    }
};

}];
});
