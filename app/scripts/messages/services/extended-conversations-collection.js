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
            if (this._cursor) {
                params.cursor = this._cursor;
                params.offset = 1;
            }
            return $http.get(
                '/resource/conversations',
                { params: params }
            ).then(function success(response) {
                var rawData = [].concat(response.data);
                var conversations = rawData.map(this.create.bind(this));
                this.loaded = response.headers('WD-Need-More') === 'false';
                return this.add(conversations);
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
            messages.forEach(function(m, i) {
                m.extend(data[i]);
            });
            c.messages.sort();
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
