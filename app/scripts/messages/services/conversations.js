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
var searchResults = wdmConversationsCollection.createConversationsCollection();

_.extend(searchResults, {

    _keyword: '',

    loading: false,

    search: function(keyword) {
        this.clear();
        this.loading = true;
        this._keyword = keyword;
        this.add(this._searchFromCache(keyword));
        this._searchFromServer(keyword);
    },

    _searchFromCache: function(keyword) {
        var regexp = new RegExp(keyword, 'i');
        return conversations.collection.filter(function(c) {
            return c.addresses.concat(c.contact_names).some(function(field) {
                return regexp.test(field);
            });
        });
    },

    _searchFromServer: function(keyword) {
        return $http.get(
            '/resource/conversations/search',
            {
                params: {
                    offset: 0,
                    length: 20,
                    queries: [{
                        field: 'keyword',
                        keyword: keyword
                    }]
                },
                keyword: keyword
            }
        ).then(function done(response) {
            if (response.config.keyword === this._keyword) {
                this.add(response.data.map(this.create));
                this.loading = false;
            }
        }.bind(this), function fail() {
            this.loading = false;
        }.bind(this));
    },
    searchContent: function() {
        return $http.post(
            '/resource/messages/search',
            [{
                field: 'keyword',
                keyword: this._keyword
            }],
            {
                params: {
                    offset: 0,
                    length: 20
                },
                keyword: this._keyword
            }
        ).then(function done(response) {
            if (response.config.keyword !== this._keyword) {
                return $q.reject();
            }

            var messages = response.data.map(wdmMessage.createMessage);
            return _.chain(messages).groupBy(function(m) {
                return m.cid;
            }).values().map(function(results) {
                return wdmSearchConversation.createSearchConversation(results);
            }).value();
        }.bind(this)).then(function done(conversations) {
            this.add(conversations);
            return this;
        }.bind(this), function fail() {
            return this;
        }.bind(this));
    }
});

searchResults._searchFromServer = _.debounce(searchResults._searchFromServer, 500);

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
    searchResults: searchResults
};

}];
});
