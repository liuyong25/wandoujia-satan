define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmMessagesCollection', 'wdmMessage', '$http', function(wdmMessagesCollection, wdmMessage, $http) {

var MessagesCollection = wdmMessagesCollection.MessagesCollection;

function ConversationMessagesCollection(conversation) {
    MessagesCollection.call(this, conversation);
}

ConversationMessagesCollection.prototype = Object.create(MessagesCollection.prototype);

_.extend(ConversationMessagesCollection.prototype, {

    constructor: ConversationMessagesCollection,

    /**
     * Create a message on client
     * @param  {Object} data Data to override defaults.
     * @return {Message}
     */
    create: function(data, orphan) {
        orphan = !!orphan;
        data = _.extend({
            id: guid(),
            thread_id: this._conversation.id,
            date: Date.now(),
            read: 1,
            status: 32,
            type: 2,
            category: 0
        }, data);

        var m = wdmMessage.createMessage(data);
        return orphan ? m : this.add(m)[0];
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

        return $http({
            method: 'POST',
            url: '/resource/messages/send',
            data: {
                addresses: self._conversation.addresses,
                body: content
            }
        }).then(function success(response) {
            var data = response.data;
            messages.forEach(function(m, index) {
                m.extend(data[index]);
            });
            self.sort();

            function always() { return messages; }
            return self._conversation.fetch().then(always, always);
        });
    },

    remove: function(messages) {
        messages = this.drop(messages);
        messages.filter(function(m) {
            return !m.isNew;
        });

        return $q.all(messages.map(function(m) {
            return $http({
                method: 'DELETE',
                url: '/resource/messages/' + m.id
            }).then(function success() {
                function always() { return messages; }
                return self._conversation.fetch().then(always, always);
            }, function error() {
                self.add(m);
                return $q.reject();
            });
        }));
    },

    fetch: function(id) {
        var self = this;
        if (this._conversation.isNew) {
            this.loaded = true;
            return $q.when([]);
        }
        else if (arguments.length === 1) {
            return $http({
                method: 'GET',
                url: '/resource/messages/' + id
            }).then(function success(response) {
                var m = self.add(wdmMessage.createMessage(response.data))[0];
                function always() { return m; }
                return self._conversation.fetch().then(always, always);
            });
        }
        else {
            var dirty = this.dirty;
            var params = {
                offset: 0,
                length: 30
            };
            if (this.collection.length && !dirty) {
                params.cursor = this.collection[0].id;
                params.offset = 1;
                this.dirty = false;
            }
            return $http({
                method: 'GET',
                url: '/resource/conversations/' + this._conversation.id + '/messages',
                params: params
            }).then(function success(response) {
                var rawData = [].concat(response.data);
                var messages = self.add(rawData.map(wdmMessage.createMessage));
                function always() { return messages; }

                if (!dirty) {
                    self.loaded = response.headers('WD-Need-More') === 'false';
                }
                if (dirty) {
                    return self._conversation.fetch().then(always, always);
                }
                else {
                    return messages;
                }
            });
        }
    }
});

function guid() {
    return _.uniqueId('wdmMessage_');
}



return {
    ConversationMessagesCollection: ConversationMessagesCollection,
    createConversationMessagesCollection: function(conversation) {
        return new ConversationMessagesCollection(conversation);
    }
};
}];
});
