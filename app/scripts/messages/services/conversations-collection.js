define([
    'underscore',
    'messages/services/collection'
], function(
    _,
    Collection
) {
'use strict';
return ['wdmConversation', '$q', '$http',
function(wdmConversation,   $q,   $http) {

function ConversationsCollection() {
    Collection.call(this);
    this.loaded = true;
}

ConversationsCollection.prototype = Object.create(Collection.prototype, {
    hasSelected: {
        get: function() {
            return this.collection.some(function(c) {
                return c.selected;
            });
        }
    },
    allSelected: {
        get: function() {
            return this.collection.every(function(c) {
                return c.selected;
            });
        }
    }
});

_.extend(ConversationsCollection.prototype, {

    constructor: ConversationsCollection,

    create: function(data) {
        return wdmConversation.createConversation(data);
    },

    sort: function() {
        this.collection.sort(function(a, b) {
            if (a.isNew && b.isNew) {
                return 0;
            }
            if (a.isNew) {
                return -1;
            }
            if (b.isNew) {
                return 1;
            }
            return b.date - a.date;
        });
    },

    remove: function(conversations) {
        conversations = this.drop(conversations);
        var removed = conversations.filter(function(c) {
            return !c.isNew;
        });

        return $q.all(removed.map(function(c) {
            return $http.delete(
                '/resource/conversations/' + c.id
            ).then(null, function error() {
                this.add(c);
                return $q.reject();
            }.bind(this));
        }));
    },
    removeSelected: function() {
        this.remove(this.collection.filter(function(c) {
            return c.selected;
        }));
    },
    toggleSelectAll: function() {
        var toBe = !this.allSelected;
        this.collection.forEach(function(c) {
            c.selected = toBe;
        });
    },
    fetch: function(id) {
        var self = this;
        if (arguments.length === 1) {
            var existed = this.getById(id) || this.create({ id: id });
            return $http.get(
                '/resource/conversations/' + id
            ).then(function success(response) {
                var c = self.create(response.data);
                self.add(c);
                return c;
            });
        }
        else {
            var params = {
                offset: 0,
                length: 30
            };
            if (this.collection.length) {
                params.cursor = this.collection[this.length - 1].id;
                params.offset = 1;
            }
            return $http.get(
                '/resource/conversations',
                { params: params }
            ).then(function success(response) {
                var rawData = [].concat(response.data);
                var conversations = rawData.map(self.create.bind(self));
                self.loaded = response.headers('WD-Need-More') === 'false';
                return self.add(conversations);
            });
        }
    },
    removeMessages: function(c, messages) {
        var promise = c._messages.remove(messages);
        if (c._messages.empty) {
            this.drop(c);
            return promise;
        }
        else {
            return promise.then(function success() {
                return c.fetch();
            });
        }
    },
    _placeMessages: function(c, messages) {
        messages = [].concat(messages);
        var self = this;
        var cid = messages[0].cid;
        if (c.id === cid) { return c; }
        var existed = self.getById(cid);
        if (existed) {
            existed.messages.add(messages);
            var promise = existed.fetch();
            promise.then(function success() {
                self.remove(c);
            });
            return promise;
        }
        else {
            if (c.isNew) {
                c.rawData.id = cid;
                return c.fetch();
            }
        }
    },
    sendMessages: function(c) {
        return c.sendMessages().then(this._placeMessages.bind(this, c));
    },
    resendMessage: function(c, m) {
        return c.resendMessage(m).then(this._placeMessages.bind(this, c));
    }

});

return {
    ConversationsCollection: ConversationsCollection,
    createConversationsCollection: function() {
        return new ConversationsCollection();
    }
};

}];
});
