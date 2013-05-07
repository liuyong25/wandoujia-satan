define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmMessage', '$q', '$http', function(wdmMessage, $q, $http) {

function MessagesCollection(conversation) {
    this._conversation = conversation;
    this.collection = [];
    this.dirty = false;
    this.loaded = false;
}

Object.defineProperties(MessagesCollection.prototype, {
    length:     {get: function() { return this.collection.length; }},
    empty:      {get: function() { return !this.length && this.loaded; }},
    latestDate: {get: function() {
        return this.collection.length ? this.collection[this.collection.length - 1].date : 0;
    }},
    hasError: {get: function() {
        return this.collection.some(function(m) { return m.isError; });
    }},
    hasPending: {get: function() {
        return this.collection.some(function(m) { return m.isPending; });
    }},
    hasUnread: {get: function() {
        return this.collection.some(function(m) { return !m.isRead; });
    }}
});

_.extend(MessagesCollection.prototype, {
    /**
     * Get a Message in collection by id
     * @param  {Number} id
     * @return {Message}
     */
    getById: function(id) {
        return _(this.collection).find(function(m) { return m.id === id; });
    },

    /**
     * Whether a reference of Message in collection
     * @param  {Message} m
     * @return {Boolean}
     */
    contains: function(m) {
        return this.collection.indexOf(m) !== -1;
    },

    /**
     * Add messages into collection
     * @param {Message|Array} messages
     * @return {Array} Messages that updated
     */
    add: function(messages) {
        messages = [].concat(messages);

        var updated = messages.map(function(m) {
            var existed = this.getById(m.id);
            if (existed) {
                existed.extend(m);
                return existed;
            }
            else {
                if (m._collection) {
                    m = wdmMessage.createMessage(m.rawData);
                }
                m._collection = this;
                this.collection.push(m);
                return m;
            }
        }, this);

        this.sort();

        return updated;
    },

    /**
     * Drop messages from collection
     * @param  {Message|Array} messages
     * @return {Array} Messages that dropped
     */
    drop: function(messages) {
        messages = [].concat(messages);
        messages.forEach(function(m) {
            var index = this.collection.indexOf(m);
            if (index !== -1) {
                this.collection.splice(index, 1);
                m._collection = null;
            }
        }, this);
        this.sort();
        return messages;
    },


    sort: function() {
        this.collection.sort(function(a, b) {
            return a.date - b.date;
        });
        this.collection.reduce(function(sep, m) {
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
    }
});


return {
    MessagesCollection: MessagesCollection,
    createMessagesCollection: function(conversation) {
        return new MessagesCollection(conversation);
    }
};

}];
});
