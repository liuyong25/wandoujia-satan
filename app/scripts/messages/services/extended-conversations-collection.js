define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmConversationsCollection', '$q', '$http',
function(wdmConversationsCollection,   $q,   $http) {

var _super = wdmConversationsCollection.ConversationsCollection.prototype;

function ExtendedConversationsCollection() {
    _super.constructor.call(this);
    this._cursor = null;
    this.loaded = true;
}

ExtendedConversationsCollection.prototype = Object.create(_super);

_.extend(ExtendedConversationsCollection.prototype, {

    constructor: ExtendedConversationsCollection,

    clear: function() {
        _super.clear.call(this);
        this._cursor = null;
        this.loaded = true;
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

    _findCursor: function() {
        if (!this._cursor) { return null; }
        var cursorDate = this._cursor;
        var i, l, c;

        for (i = 0, l = this.collection.length; i < l; i += 1) {
            c = this.collection[i];
            if (c.date <= cursorDate) {
                break;
            }
        }

        var cursor = this.collection[Math.min(i, l - 1)];

        return cursor ? cursor.id : null;
    },

    _fetchById: function(id) {
        var c = this.getById(id) || this.create({ id: id });
        return $http.get(
            '/resource/conversations/' + id
        ).then(function success(response) {
            c.extend(response.data);
            this.add(c);
            return c;
        }.bind(this));
    },

    fetch: function(id) {
        if (arguments.length === 1) {
            return this._fetchById(id);
        }
        else {
            var params = {
                offset: 0,
                length: 30
            };
            var cursor = this._findCursor();
            if (cursor) {
                params.cursor = cursor;
                params.offset = 1;
            }
            return $http.get(
                '/resource/conversations',
                { params: params }
            ).then(function success(response) {
                var rawData = [].concat(response.data);
                if (response.data.length) {
                    this._cursor = response.data[response.data.length - 1].date;
                }
                this.loaded = response.headers('WD-Need-More') === 'false';
                return this.add(rawData.map(this.create.bind(this)));
            }.bind(this));
        }
    },

    removeMessages: function(c, messages) {
        var promise = c.messages.remove(messages);
        if (c.messages.empty) {
            this.drop(c);
        }
        return promise.then(function done(messages) {
            if (!c.messages.empty) {
                this.add(c);
            }
            return messages;
        }.bind(this));
    },

    sendMessages: function(c, m) {
        var url;
        var method;
        var content;
        var addresses;
        var config;
        var messages;

        if (m) {
            if (m.isNew) {
                method = 'POST';
                url = '/resource/messages/send';
            }
            else {
                method = 'GET';
                url = m.url + '/resend';
            }
            content = m.body;
            addresses = [m.address];
            messages = [m];
        }
        else {
            method = 'POST';
            url = '/resource/messages/send';
            addresses = c.addresses;
            content = c.draft.trim();
            c.draft = '';

            if (!content || !addresses.length) {
                return $q.reject();
            }

            messages = addresses.map(function(addr, i) {
                return c.messages.create({
                    address: addr,
                    contact_name: c.contact_names[i],
                    body: content
                });
            });
            messages = c.messages.add(messages);
        }

        config = {
            method: method,
            url: url
        };
        if (method === 'POST') {
            config.data = {
                addresses: addresses,
                body: content
            };
        }

        messages.forEach(function(m) {
            m.rawData.status = 32;
        });

        return $http(config).then(function done(response) {
            var data = [].concat(response.data);
            c.messages.drop(messages);
            messages.forEach(function(m, i) {
                m.extend(data[i]);
            });
            return this._placeMessages(c, messages);
        }.bind(this), function fail() {
            messages.forEach(function(m) {
                m.rawData.status = 64;
            });
            return c;
        });
    },

    _placeMessages: function(c, messages) {
        messages = [].concat(messages);
        var cid = messages[0].cid;

        var existed = this.getById(cid);
        if (existed) {
            existed.messages.add(messages);
            if (c.isNew) {
                this.drop(c);
            }
            return existed.fetch();
        }
        else if (c.isNew) {
            c.messages.add(messages);
            this.drop(c);
            c.rawData.id = cid;
            this.add(c);
            return c.fetch();
        }
    }

});

return {
    ExtendedConversationsCollection: ExtendedConversationsCollection,
    createExtendedConversationsCollection: function() {
        return new ExtendedConversationsCollection();
    }
};

}];
});
