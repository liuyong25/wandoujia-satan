define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmConversationMessagesCollection', '$http', '$q', '$rootScope', 'wdSocket', 'wdEventEmitter',
function(wdmConversationMessagesCollection,   $http,   $q,   $rootScope,   wdSocket,   wdEventEmitter) {

function ConversationCollection() {
    this._collection = [];
    this.loaded = true;
}

Object.defineProperties(ConversationCollection.prototype, {
    collection: {
        get: function() {
            return this._collection;
        }
    },
    length: {
        get: function() {
            return this._collection.length;
        }
    },
    hasSelected: {
        get: function() {
            return this._collection.some(function(c) {
                return c.selected;
            });
        }
    },
    allSelected: {
        get: function() {
            return this._collection.every(function(c) {
                return c.selected;
            });
        }
    }
});

_.extend(ConversationCollection.prototype, {
    clear: function() {
        this._collection = [];
    },
    getById: function(id) {
        return _(this._collection).find(function(c) {
            return c.id === id;
        });
    },
    contains: function(c) {
        return this._collection.indexOf(c) !== -1;
    },
    create: function() {
        var conversation = wrapConversation({
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
        });
        return this.add(conversation)[0];
    },
    add: function(conversations) {
        var self = this;
        var collection = this._collection;
        conversations = [].concat(conversations);

        var updated = conversations.map(function(c) {
            var existed = self.getById(c.id);
            if (existed) {
                existed.extend(c);
                return existed;
            }
            else {
                c._collection = self;
                collection.push(c);
                return c;
            }
        });

        collection.sort(function(a, b) {
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

        return updated;
    },
    remove: function(conversations) {
        var self = this;
        var collection = this._collection;
        conversations = [].concat(conversations);

        var removed = conversations.reduce(function(trash, c) {
            var index = collection.indexOf(c);
            if (index !== -1) {
                collection.splice(index, 1);
                c._collection = null;
                if (!c.isNew) {
                    trash.push(c);
                }
            }
            return trash;
        }, []);

        return $q.all(removed.map(function(c) {
            return $http({
                method: 'DELETE',
                url: '/resource/conversations/' + c.id
            }).error(function error() {
                self.add(c);
                return $q.reject();
            });
        }));
    },
    removeSelected: function() {
        this.remove(this._collection.filter(function(c) {
            return c.selected;
        }));
    },
    toggleSelectAll: function() {
        var toBe = !this.allSelected;
        this._collection.forEach(function(c) {
            c.selected = toBe;
        });
    },
    fetch: function(id) {
        var self = this;
        if (arguments.length === 1) {
            var existed = this.getById(id) ||
            return $http({
                method: 'GET',
                url: '/resource/conversations/' + id
            }).then(function success(response) {
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
            if (this._collection.length) {
                params.cursor = this._collection[this._collection.length - 1].id;
                params.offset = 1;
            }
            return $http({
                method: 'GET',
                url: '/resource/conversations',
                params: params
            }).then(function success(response) {
                var rawData = [].concat(response.data);
                var conversations = rawData.map(wrapConversation);
                self.loaded = response.headers('WD-Need-More') === 'false';
                return self.add(conversations);
            });
        }
    },
    removeMessages: function(c, messages) {
        var promise = c._messages.remove(messages);
        if (c._messages.empty) {
            var index = this._collection.indexOf(c);
            if (index !== -1) {
                this._collection.splice(index, 1);
                c._collection = null;
            }
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

function wrapConversation(origin) {
    var conversation = Object.create(origin);

    Object.defineProperties(conversation, {
        messages: {
            get: function() {
                return this._messages;
            },
        },
        messageCount: {
            get: function() {
                return this.message_count;
            }
        },
        unreadMessageCount: {
            get: function() {
                return this.unread_message_count;
            }
        },
        displayNames: {
            get: function() {
                var contactNames = this.contact_names;
                return this.addresses.map(function(a, index) {
                    var n = contactNames[index];
                    return n || a;
                });
            }
        },
        brief: {
            get: function() {
                return this.snippet;
            }
        },
        date: {
            get: function() {
                var conversationDate = this.rawData.date;
                var messageDate = this._messages.latestDate;
                return Math.max(messageDate, conversationDate);
            },
            set: function(value) {
                this.rawData.date = value;
                return value;
            }
        },
        hasPending: {
            get: function() {
                return this._messages.hasPending;
            }
        },
        hasError: {
            get: function() {
                return this.has_error || this._messages.hasError;
            }
        },
        hasMMS: {
            get: function() {
                return this.has_attachment;
            }
        },
        hasUnread: {
            get: function() {
                return !!this.unread_message_count;
            }
        },
        isNew: {
            get: function() {
                return typeof this.id !== 'number';
            }
        },
        multiple: {
            get: function() {
                return this.addresses.length > 1;
            }
        },

        rawData: {
            get: function() {
                return Object.getPrototypeOf(this);
            }
        }
    });

    _.extend(conversation, {
        _messages: wdmConversationMessagesCollection.createConversationMessagesCollection(conversation),
        selected: false,
        draft: '',

        extend: function(newData) {
            if (typeof newData.extend === 'function') {
                newData = newData.rawData;
            }
            _.extend(this.rawData, newData);
        },
        fetch: function() {
            if (this.isNew) {
                return $q.when(this);
            }
            return this._collection.fetch(this.id);
        },
        allRead: function() {
            if (!this.hasUnread) { return; }
            var self = this;
            var cachedUnreadCount = this.unread_message_count;
            this.rawData.unread_message_count = 0;

            return $http({
                url: '/resource/conversations/' + this.id + '/messages/update',
                method: 'POST',
                data: { read: 1 }
            }).then(function success(response) {
                return self.fetch();
            }, function error() {
                self.rawData.unread_message_count = cachedUnreadCount;
                return $q.reject();
            });
        },

        sendMessages: function() {
            var self = this;
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

    return conversation;
}

function guid() {
    return _.uniqueId('wdmConversation_');
}

var conversations = new ConversationCollection();

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

return conversations;

}];
});
