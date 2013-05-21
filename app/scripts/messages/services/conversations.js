define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmExtendedConversationsCollection', 'wdmConversationsCollection',
        '$http', '$q', '$rootScope', 'wdSocket', 'wdEventEmitter',
        'wdmSearchConversation', 'wdmMessage',
function(wdmExtendedConversationsCollection,   wdmConversationsCollection,
         $http,   $q,   $rootScope,   wdSocket,   wdEventEmitter,
         wdmSearchConversation,   wdmMessage) {

var conversations = wdmExtendedConversationsCollection.createExtendedConversationsCollection();


// Mixin event emitter.
wdEventEmitter(conversations);

$rootScope.$on('signout', function() {
    conversations.clear();
});

wdSocket.on('messages_add.wdm messages_update.wdm', function(e, msg) {
    var cid = msg.data.threadId;
    var mid = msg.data.messageId;
    var c = conversations.getById(cid);
    if (c) {
        c.messages.fetch(mid).then(function() {
            conversations.trigger('update', [c]);
        });
    }
    else {
        conversations.fetch(cid);
    }
});

return {
    conversations: conversations,
    searchConversationsFromCache: function(keyword) {
        var regexp = new RegExp(keyword, 'i');
        return conversations.collection.filter(function(c) {
            return c.addresses.concat(c.contact_names).some(function(field) {
                return regexp.test(field);
            });
        }).map(function(c) {
            return c.id;
        });
    },
    searchConversationsFromServer: function(keyword) {
        return $http.post(
            '/resource/conversations/search',
            [{
                field: 'keyword',
                keyword: keyword
            }],
            {
                params: {
                    offset: 0,
                    length: 30
                }
            }
        ).then(function done(response) {
            return conversations.add(response.data.map(conversations.create)).map(function(c) {
                return c.id;
            });
        }, function fail() {
            return [];
        });
    },
    searchMessagesFromServer: function(keyword) {
        return $http.post(
            '/resource/messages/search',
            [{
                field: 'keyword',
                keyword: keyword
            }],
            {
                params: {
                    offset: 0,
                    length: 20000
                }
            }
        ).then(function done(response) {
            var messages = response.data.map(wdmMessage.createMessage);
            var cvs = _.chain(messages).groupBy(function(m) {
                return m.cid;
            }).values().map(function(results) {
                return wdmSearchConversation.createSearchConversation(results);
            }).value();
            // conversations.add(cvs);
            // return cvs.map(function(c) { return c.id; });
            return cvs;
        }, function fail() {
            return [];
        });
    }
};

}];
});
