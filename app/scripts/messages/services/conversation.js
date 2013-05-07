define([
    'underscore',
    'messages/services/model'
], function(
    _,
    Model
) {
'use strict';
return ['wdmConversationMessagesCollection', '$q', '$http',
function(wdmConversationMessagesCollection,   $q,   $http) {

function Conversation(data) {

    var instance = Model.call(this, _.extend({
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

    instance.messages = wdmConversationMessagesCollection.createConversationMessagesCollection(instance),
    instance.selected = false;
    instance.draft = '';

    return instance;
}

Object.defineProperties(Conversation.prototype, {
    messageCount: {get: function() { return this.message_count; }},
    unreadMessageCount: {get: function() { return this.unread_message_count; }},

    brief: {get: function() { return this.snippet; }},
    displayNames: {get: function() {
        var contactNames = this.contact_names;
        return this.addresses.map(function(a, index) {
            var n = contactNames[index];
            return n || a;
        });
    }},
    date: {
        get: function() {
            var conversationDate = this.rawData.date;
            var messageDate = this.messages.latestDate;
            return Math.max(messageDate, conversationDate);
        },
        set: function(value) {
            this.rawData.date = value;
            return value;
        }
    },

    hasPending: {get: function() { return this.messages.hasPending; }},
    hasError: {
        get: function() {
            return this.has_error || this.messages.hasError;
        }
    },
    hasMMS: {get: function() { return this.has_attachment; }},
    hasUnread: {get: function() { return !!this.unread_message_count; }},
    multiple: {get: function() { return this.addresses.length > 1; }}
});

_.extend(Conversation.prototype, {

    constructor: Conversation,

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

    allRead: function() {
        if (!this.hasUnread) { return; }
        var self = this;
        var cachedUnreadCount = this.unread_message_count;
        this.rawData.unread_message_count = 0;

        return $http.post(
            '/resource/conversations/' + this.id + '/messages/update',
            { read: 1 }
        ).then(function success() {
            return self.fetch();
        }, function error() {
            self.rawData.unread_message_count = cachedUnreadCount;
            return $q.reject();
        });
    },

    sendMessages: function() {
        var content = this.draft.trim();
        this.draft = '';

        if (content && this.addresses.length) {
            return this.messages.send(content);
        }
        else {
            return $q.reject();
        }
    },

    resendMessage: function(m) {
        return m.send();
    }
});


function guid() {
    return _.uniqueId('wdmConversation_');
}

return {
    Conversation: Conversation,
    createConversation: function(data) {
        return new Conversation(data);
    }
};

}];
});
