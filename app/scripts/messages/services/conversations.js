define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmMessages', '$http', '$q', function(wdmMessages, $http, $q) {

function ConversationCollection() {
    this._collection = [];
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
    loaded: {
        value: true,
        writable: true
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
    },
    create: {
        value: function() {
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
            this.add(conversation);
        }
    },
    add: {
        value: function(conversations) {
            var collection = this._collection;
            conversations = [].concat(conversations);
            var updated = conversations.map(function(c) {
                var existed = _(collection).find(function(e) {
                    return e.id === c.id;
                });
                if (existed) {
                    existed.extend(c);
                    return existed;
                }
                else {
                    collection.push(c);
                    return c;
                }
            });
            collection.sort(function(a, b) {
                return b.date - a.date;
            });
            return updated;
        }
    },
    remove: {
        value: function(conversations) {
            var self = this;
            var collection = this._collection;
            conversations = [].concat(conversations);
            var removed = conversations.reduce(function(trash, c) {
                var index = collection.indexOf(c);
                if (index !== -1) {
                    collection.splice(index, 1);
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
        }
    },
    removeSelected: {
        value: function() {
            var toBeRemoved = this._collection.filter(function(c) {
                return c.selected;
            });
            this.remove(toBeRemoved);
        }
    },
    clear: {
        value: function() {
            this._collection = [];
        }
    },

    toggleSelectAll: {
        value: function() {
            var toBe = this.allSelected ? false : true;
            this._collection.forEach(function(c) {
                c.selected = toBe;
            });
        }
    },
    getById: {
        value: function(id) {
            return _(this._collection).find(function(c) {
                return c.id === id;
            });
        }
    },
    contains: {
        value: function(conversation) {
            return this._collection.indexOf(conversation) !== -1;
        }
    },
    fetch: {
        value: function(id) {
            var self = this;
            if (arguments.length === 1) {
                var c = this.getById(id).fetch();
                if (c) {
                    return c.fetch();
                }
                else {
                    return $http({
                        method: 'GET',
                        url: '/resource/conversations/' + id
                    }).then(function success(response) {
                        var c = wrapConversation(response.data);
                        self.add(c);
                        return c;
                    });
                }
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
        }
    },
    removeMessages: {
        value: function(c, messages) {
            c._messages.remove(messages);
            if (c._messages.empty) {
                var index = this._collection.indexOf(c);
                if (index !== -1) {
                    this._collection.splice(index, 1);
                }
            }
            else {
                c.fetch();
            }
        }
    },
    sendMessages: {
        value: function(c) {
            var self = this;
            return c._messages.send(c.draft).then(function success(cid) {
                if (c.id === cid) {
                    return c.fetch();
                }
                var another = self.getById(cid);
                if (another) {
                    return another.fetch();
                }
                if (c.isNew) {
                    c.rawData.id = cid;
                    return c.fetch();
                }
                return self.load(cid);
            });
        }
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
        },
        extend: {
            value: function(newData) {
                if (typeof newData.extend === 'function') {
                    newData = newData.rawData;
                }
                _.extend(this.rawData, newData);
            }
        },
        fetch: {
            value: function() {
                if (this.isNew) {
                    return $q.when(this);
                }
                var self = this;
                return $http({
                    method: 'GET',
                    url: '/resource/conversations/' + this.id,
                }).then(function success(response) {
                    self.extend(response.data);
                    return self;
                });
            }
        },
        allRead: {
            value: function() {
                if (!this.hasUnread) { return; }
                var self = this;
                var cachedUnreadCount = this.unread_message_count;
                this.unread_message_count = 0;
                return $http({
                    url: '/resource/conversations/' + this.id + '/messages/update',
                    method: 'POST',
                    data: {
                        read: 1
                    }
                }).then(function success(response) {
                    return self.fetch();
                }, function error() {
                    self.unread_message_count = cachedUnreadCount;
                    return $q.reject();
                });
            }
        },

        sendMessage: {
            value: function() {
                if (!this.draft.trim()) { return; }
                var self = this;
                this.messages.send(this.draft);
                this.draft = '';
            }
        }
    });

    _.extend(conversation, {
        _messages: wdmMessages.getInstance(conversation),
        selected: false,
        draft: ''
    });

    return conversation;
}

function guid() {
    return _.uniqueId('wdmConversation_');
}

return new ConversationCollection();

}];
});
