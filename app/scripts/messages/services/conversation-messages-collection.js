define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmSyncMessagesCollection', '$http', '$q',
function(wdmSyncMessagesCollection,   $http,   $q) {

var _super = wdmSyncMessagesCollection.SyncMessagesCollection.prototype;

function ConversationMessagesCollection(conversation) {
    _super.constructor.call(this, conversation);
    // Whether need a refresh
    this.dirty = false;
}

ConversationMessagesCollection.prototype = Object.create(_super);

_.extend(ConversationMessagesCollection.prototype, {

    constructor: ConversationMessagesCollection,

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

    remove: function(messages) {
        return _super.remove.call(this, messages).then(function() {
            return messages.empty ? messages : this._updateConversation(messages);
        }.bind(this));
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
