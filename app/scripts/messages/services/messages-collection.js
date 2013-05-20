define([
    'underscore',
    'messages/services/collection'
], function(
    _,
    Collection
) {
'use strict';
return ['wdmMessage',
function(wdmMessage) {

var _super = Collection.prototype;

function MessagesCollection() {
    _super.constructor.call(this);
}

MessagesCollection.prototype = Object.create(_super, {
    latestDate: {get: function() {
        return this.length ? this.collection[this.length - 1].date : 0;
    }},
    hasError: {get: function() {
        return this.collection.some(function(m) { return m.isError; });
    }},
    hasPending: {get: function() {
        return this.collection.some(function(m) { return m.isPending; });
    }},
    hasUnread: {get: function() {
        return this.collection.some(function(m) { return !m.isRead; });
    }},
    hasRecieved: {get: function() {
        return this.collection.some(function(m) { return m.type !== 2; });
    }}
});

_.extend(MessagesCollection.prototype, {

    constructor: MessagesCollection,

    /**
     * Create a message on client
     * @param  {Object} data Data to override defaults.
     * @return {Message}
     */
    create: function(data) {
        return wdmMessage.createMessage(data);
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
    createMessagesCollection: function() {
        return new MessagesCollection();
    }
};

}];
});
