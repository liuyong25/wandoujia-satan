define([
    'messages/services/collection',
    'underscore'
], function(
    Collection,
    _
) {
'use strict';
return ['wdmConversation', '$q', '$http',
function(wdmConversation,   $q,   $http) {

var _super = Collection.prototype;

function ConversationsCollection() {
    _super.constructor.call(this);
}

ConversationsCollection.prototype = Object.create(_super);

_.extend(ConversationsCollection.prototype, {

    constructor: ConversationsCollection,

    create: function(data) {
        return wdmConversation.createConversation(data);
    },

    sort: function() {
        this.collection.sort(function(a, b) {
            return b.date - a.date;
        });
    },

    remove: function(conversations) {

        conversations = this.drop(conversations);

        var removed = conversations.filter(function(c) {
            return !c.isNew;
        });

        var self = this;
        return $q.all(removed.map(function(c) {
            return c.destroy();
        }));
    },

    removeSelected: function() {
        this.remove(this.collection.filter(function(c) {
            return c.selected;
        }));
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
