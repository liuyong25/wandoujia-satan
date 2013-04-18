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
    this.dirty = false;
    this.loaded = false;
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
    }
});

_.extend(MessagesCollection.prototype, {
    getById: function(id) {
        return _(this._collection).find(function(m) {
            return m.id === id;
        });
    },
    contains: function(message) {
        return this._collection.indexOf(message) !== -1;
    },
    create: function(data) {
        var self = this;
        data = _.extend({
            id: guid(),
            thread_id: self._conversation.id,
            date: Date.now(),
            read: 1,
            status: 32,
            type: 2,
            category: 0
        }, data);
        return this.add(wrapMessage(data))[0];
    },
    add: function(messages) {
        var self = this;
        var collection = this._collection;
        messages = [].concat(messages);

        var updated = messages.map(function(m) {
            var existed = self.getById(m.id);
            if (existed) {
                existed.extend(m);
                return existed;
            }
            else {
                m._collection = self;
                collection.push(m);
                return m;
            }
        });

        this.sort();

        return updated;
    },
    remove: function(messages) {
        var self = this;
        messages = [].concat(messages);

        var removed = messages.reduce(function(trash, m) {
            var index = self._collection.indexOf(m);
            if (index !== -1) {
                self._collection.splice(index, 1);
                m._collection = null;
                if (!m.isNew) {
                    trash.push(m);
                }
            }
            return trash;
        }, []);

        this.sort();

        return $q.all(removed.map(function(m) {
            return $http({
                method: 'DELETE',
                url: '/resource/messages/' + m.id
            }).then(function success() {
                function always() { return removed; }
                return self._conversation.fetch().then(always, always);
            }, function error() {
                self.add(m);
                return $q.reject();
            });
        }));
    },
    sort: function() {
        this._collection.sort(function(a, b) {
            return a.date - b.date;
        });
        this._collection.reduce(function(sep, m) {
            var dayCount = Math.floor(m.date / 1000 / 3600 / 24);
            if (dayCount !== sep) {
                sep = dayCount;
                m.isSeparator = true;
            }
            else {
                m.isSeparator = false;
            }
            return sep;
        }, 0);
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
                var m = self.add(wrapMessage(response.data))[0];
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
            if (this._collection.length && !dirty) {
                params.cursor = this._collection[0].id;
                params.offset = 1;
                this.dirty = false;
            }
            return $http({
                method: 'GET',
                url: '/resource/conversations/' + this._conversation.id + '/messages',
                params: params
            }).then(function success(response) {
                var rawData = [].concat(response.data);
                var messages = self.add(rawData.map(wrapMessage));
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
    }
});

function wrapMessage(origin) {
    var message = Object.create(origin, {
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

        rawData: {
            get: function() {
                return Object.getPrototypeOf(this);
            }
        }
    });

    _.extend(message, {
        fetch: function() {
            if (this.isNew) {
                return $q.when(this);
            }
            return this._collection.fetch(this.id);
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
                self.sort();
                return self.cid;
            }, function error() {
                self.rawData.status = 64;
                return $q.reject();
            });
        },

        extend: function(newData) {
            if (typeof newData.extend === 'function') {
                newData = newData.rawData;
            }
            _.extend(origin, newData);
        }
    });

    return message;
}

function guid() {
    return _.uniqueId('wdmMessage_');
}

return MessagesCollection;
}];
});
