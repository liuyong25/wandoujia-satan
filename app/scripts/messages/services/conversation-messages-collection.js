define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmSyncMessagesCollection', '$http', '$q',
function(wdmSyncMessagesCollection,   $http,   $q) {

var SyncMessagesCollection = wdmSyncMessagesCollection.SyncMessagesCollection;

function ConversationMessagesCollection(conversation) {
    SyncMessagesCollection.apply(this);
    // Whether need a refresh
    this.dirty = false;
}

ConversationMessagesCollection.prototype = Object.create(SyncMessagesCollection.prototype);

_.extend(ConversationMessagesCollection.prototype, {

    constructor: ConversationMessagesCollection,

    /**
     * Create a Message and add into collection
     * @param  {Object} data
     * @return {}      [description]
     */
    create: function(data) {
        if (data.thread_id == null) {
            data.thread_id = this._conversation.id;
        }
        return SyncMessagesCollection.prototype.create.call(this, data);
    },

    send: function(content) {
        var self = this;
        var messages = this._conversation.addresses.map(function(addr, index) {
            return self.create({
                address: addr,
                contact_name: self._conversation.contact_names[index],
                body: content
            });
        });
        this.add(messages);

        return $http.post('/resource/messages/send', {
            addresses: self._conversation.addresses,
            body: content
        }).then(function success(response) {
            messages.forEach(function(m, index) {
                if (response.data[index]) {
                    m.extend(response.data[index]);
                }
                else {
                    self.drop(m);
                }
            });

            self.sort();

            return self._updateConversation(messages);
        });
    },

    remove: function(messages) {
        var self = this;

        messages = this.drop(messages);

        messages.filter(function(m) {
            return !m.isNew;
        });

        return $q.all(messages.map(function(m) {
            return m.destroy().then(null, function fail() {
                // Add message back
                self.add(m);
            });
        })).then(function() {
            return self._updateConversation(messages);
        });
    },

    fetch: function(id) {
        var self = this;

        // Do nothing when conversation is new
        if (this._conversation.isNew) {

            this.loaded = true;
            return $q.when([]);

        }
        // Fetch by id
        else if (arguments.length === 1) {

            var m = this.getById(id) || this.create({ id: id });
            return m.fetch().then(function done(m) {
                self.add(m);
                return self._updateConversation(m);
            });

        }
        // Fetch list
        else {

            var dirty = this.dirty;
            var params = {
                offset: 0,
                length: 30
            };
            if (this.collection.length && !dirty) {
                params.cursor = this.collection[0].id;
                params.offset = 1;
            }
            this.dirty = false;

            return this.sync('read', {
                params: params
            }, dirty).then(function success(messages) {
                // Conversation has a snapshot for latest data.
                // We fetch earlier messages by default which needs no updating.
                // If dirty is true, may snapshot has changes that needs updating.
                if (dirty) {
                    return self._updateConversation(messages);
                }
                else {
                    return messages;
                }
            });

        }
    },

    _updateConversation: function(data) {
        function always() { return data; }
        return this._conversation.fetch().then(always, always);
    }
});





return {
    ConversationMessagesCollection: ConversationMessagesCollection,
    createConversationMessagesCollection: function(conversation) {
        return new ConversationMessagesCollection(conversation);
    }
};
}];
});
