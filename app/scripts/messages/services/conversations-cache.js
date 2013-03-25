define([
    'messages/services/hashmap'
], function(
    HashMap
) {
'use strict';
return [function() {

return new HashMap({
    selected: false,
    active: false,
    loaded: true,
    messages: [],
    date: function() {
        var lastMessageDate = this.messages.length ? this.messages[this.messages.length - 1].date : 0;
        return Math.max(this.model.date, lastMessageDate);
    },
    displayName: function() {
        var result = [];
        for (var i = 0; i < this.model.addresses.length; i += 1) {
            result.push(this.model.contact_names[i] || this.model.addresses[i]);
        }
        return result.join(', ');
    }
});


}];
});
