define([
    'underscore'
], function(
    _
) {
'use strict';
return ['$http', '$q', function($http, $q) {

function MessagesCollection(conversation) {
    this._conversation = conversation;
    this._collection = [];
}

MessagesCollection.getInstance = function(conversation) {
    return new MessagesCollection(conversation);
};

Object.defineProperties(MessagesCollection.prototype, {

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
        value: false,
        writable: true
    },

    empty: {
        get: function() {
            return !this.length && this.loaded;
        }
    },

    latestDate: {
        get: function() {
            return this._collection.length ? this._collection[this._collection.length - 1].date : 0;
        }
    },

    create: {
        value: function(content) {
            var self = this;
            var newMessages = this._conversation.addresses.map(function(addr, index) {
                return wrapMessage({
                    id: guid(),
                    thread_id: self._conversation.id,
                    address: addr,
                    contact_name: self._conversation.contact_names[index],
                    date: Date.now(),
                    read: 1,
                    status: 32,
                    type: 2,
                    body: content,
                    category: 0
                });
            });
            this.add(newMessages);
            return newMessages;
        }
    },

    add: {
        value: function(messages) {
            var collection = this._collection;
            messages = [].concat(messages);
            var updated = messages.map(function(m) {
                var existed = _(collection).find(function(e) {
                    return e.id === m.id;
                });
                if (existed) {
                    existed.extend(m);
                    return existed;
                }
                else {
                    collection.push(m);
                    return m;
                }
            });
            collection.sort(function(a, b) {
                return a.date - b.date;
            });
            return updated;
        }
    },

    remove: {
        value: function(messages) {
            var self = this;
            messages = [].concat(messages);
            var removed = messages.reduce(function(trash, m) {
                var index = self._collection.indexOf(m);
                if (index !== -1) {
                    self._collection.splice(index, 1);
                    if (!m.isNew) {
                        trash.push(m);
                    }
                }
                return trash;
            }, []);
            return $q.all(removed.map(function(m) {
                return $http({
                    method: 'DELETE',
                    url: '/resource/messages/' + m.id
                }).error(function error() {
                    self.add(m);
                    return $q.reject();
                });
            }));
        }
    },

    contains: {
        value: function(message) {
            return this._collection.indexOf(message) !== -1;
        }
    },

    hasError: {
        get: function() {
            return this._collection.some(function(m) {
                return m.isError;
            });
        }
    },

    hasPending: {
        get: function() {
            return this._collection.some(function(m) {
                return m.isPending;
            });
        }
    },

    hasUnread: {
        get: function() {
            return this._collection.some(function(m) {
                return !m.isRead;
            });
        }
    },

    getById: {
        value: function(id) {
            return _(this._collection).find(function(m) {
                return m.id === id;
            });
        }
    },

    fetch: {
        value: function(id) {
            var self = this;
            if (arguments.length === 1) {
                var m = this.getById(id);
                if (m) {
                    return m.fetch();
                }
                else {
                    return $http({
                        method: 'GET',
                        url: '/resource/messages/' + id
                    }).then(function success(response) {
                        var m = wrapMessage(response.data);
                        self.add(m);
                        return m;
                    });
                }
            }
            else if (this._conversation.isNew) {
                this.loaded = true;
                return $q.when([]);
            }
            else {
                var params = {
                    offset: 0,
                    length: 30
                };
                if (this._collection.length) {
                    params.cursor = this._collection[0].id;
                    params.offset = 1;
                }
                return $http({
                    method: 'GET',
                    url: '/resource/conversations/' + this._conversation.id + '/messages',
                    params: params
                }).then(function success(response) {
                    var rawData = [].concat(response.data);
                    var messages = rawData.map(wrapMessage);
                    self.loaded = response.headers('WD-Need-More') === 'false';
                    return self.add(messages);
                });
            }
        }
    },

    send: {
        value: function(content) {
            var self = this;
            var messages = this.create(content);
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
                return messages[0].cid;
            });
        }
    }
});

function wrapMessage(origin) {
    return Object.create(origin, {
        cid: {
            get: function() {
                return this.thread_id;
            }
        },
        isPending: {
            get: function() {
                return this.status === 32;
            }
        },
        isError: {
            get: function() {
                return this.status === 64;
            }
        },
        isRead: {
            get: function() {
                return !!this.read;
            }
        },
        isSMS: {
            get: function() {
                return this.category === 0;
            }
        },
        isMMS: {
            get: function() {
                return this.category === 1;
            }
        },
        isNew: {
            get: function() {
                return typeof this.id !== 'number';
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
                    url: '/resource/messages/' + this.id
                }).then(function(response) {
                    self.extend(response.data);
                    return self;
                });
            }
        },

        send: function() {
            var self = this;
            var config;
            if (this.isNew) {
                config = {
                    method: 'POST',
                    url: '/resource/messages/send',
                    data: {
                        addresses: [this.address],
                        body: this.body
                    }
                };
            }
            else {
                config = {
                    method: 'GET',
                    url: '/resource/messages/' + this.id + '/resend'
                };
            }
            return $http(config).then(function success(response) {
                if (!response.data.length) {
                    return self.cid;
                }
                var data = response.data[0];
                self.extend(data);
                return self.cid;
            }, function error() {
                self.rawData.status = 64;
                return $q.reject();
            });
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
                _.extend(origin, newData);
            }
        }
    });
}

function guid() {
    return _.uniqueId('wdmMessage_');
}

return MessagesCollection;
}];
});
