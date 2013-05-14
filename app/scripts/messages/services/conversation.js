define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmConversationMessagesCollection', 'wdmBasicConversation',
        '$q', '$http',
function(wdmConversationMessagesCollection,   wdmBasicConversation,
         $q,   $http) {

var _super = wdmBasicConversation.BasicConversation.prototype;

function Conversation(data) {

    var instance = _super.constructor.call(this, data);

    Object.defineProperties(instance, {
        date: {
            get: function() {
                var conversationDate = this.rawData.date;
                var messageDate = this.messages.latestDate;
                return Math.max(messageDate, conversationDate);
            },
            set: function(value) {
                this.rawData.date = value;
            }
        }
    });

    instance.messages = wdmConversationMessagesCollection.createConversationMessagesCollection(instance),

    instance.draft = '';

    return instance;
}

Conversation.prototype = Object.create(_super, {
    hasPending: {get: function() { return this.messages.hasPending; }},

    /**
     * @override
     */
    hasError: {
        get: function() {
            return this.has_error || this.messages.hasError;
        }
    }
});

_.extend(Conversation.prototype, {

    constructor: Conversation

});




return {
    Conversation: Conversation,
    createConversation: function(data) {
        return new Conversation(data);
    }
};

}];
});
