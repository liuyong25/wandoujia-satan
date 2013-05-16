define([
    'messages/services/model',
    'underscore'
], function(
    Model,
    _
) {
'use strict';
return ['$q', '$http',
function($q,   $http) {

var _super = Model.prototype;

function BasicConversation(data) {
    var instance = _super.constructor.call(this,  _.extend({
        id: guid(),
        date: Date.now(),
        message_count: 0,
        snippet: '',
        addresses: [],
        contact_names: [],
        photo_path: '',
        unread_message_count: 0,
        has_attachment: false,
        has_error: false
    }, data));

    return instance;
}

BasicConversation.prototype = Object.create(_super, {
    messageCount: {get: function() { return this.message_count; }},
    unreadMessageCount: {get: function() { return this.unread_message_count; }},
    displayNames: {get: function() {
        var contactNames = this.contact_names;
        return this.addresses.map(function(a, index) {
            var n = contactNames[index];
            return n || a;
        });
    }},
    hasError: {get: function() { return this.has_error; }},
    hasMMS: {get: function() { return this.has_attachment; }},
    hasUnread: {get: function() { return !!this.unread_message_count; }},
    multiple: {get: function() { return this.addresses.length > 1; }}
});

_.extend(BasicConversation.prototype, {

    constructor: BasicConversation,

    fetch: function() {
        if (this.isNew) {
            return $q.when(this);
        }

        return $http.get(
            '/resource/conversations/' + this.id
        ).then(function done(response) {
            this.extend(response.data);
            return this;
        }.bind(this));
    },

    destroy: function() {
        return $http.delete(
            '/resource/conversations/' + this.id
        ).then(function done() {
            return this;
        }.bind(this), function fail(response) {
            return response.status === 404 ? this : $q.reject();
        }.bind(this));
    },

    allRead: function() {
        if (!this.hasUnread) { return; }

        var cachedUnreadCount = this.unread_message_count;
        this.rawData.unread_message_count = 0;

        return $http.post(
            '/resource/conversations/' + this.id + '/messages/update',
            { read: 1 }
        ).then(function success() {
            return this.fetch();
        }.bind(this), function error() {
            this.rawData.unread_message_count = cachedUnreadCount;
            return $q.reject();
        }.bind(this));
    }
});

function guid() {
    return _.uniqueId('wdmConversation_');
}

return {
    BasicConversation: BasicConversation,
    createBasicConversation: function(data) {
        return new BasicConversation(data);
    }
};

}];
});
