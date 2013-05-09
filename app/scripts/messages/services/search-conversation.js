define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmBasicConversation', 'wdmSearchMessagesCollection',
function(wdmBasicConversation,   wdmSearchMessagesCollection) {

var _super = wdmBasicConversation.BasicConversation.prototype;

function SearchConversation(results) {
    var addresses = [];
    var contactNames = [];

    results.forEach(function(m) {
        if (addresses.indexOf(m.address) === -1) {
            addresses.push(m.address);
            contactNames.push(m.contact_name);
        }
    });

    var instance = _super.constructor.call(this, {
        id: results[0].cid,
        snippet: results[0].body,
        addresses: addresses,
        contact_names: contactNames,
        date: _.max(results, function(r) { return r.date; }).date
    });

    instance.results = results.map(function(m) {
        var messages = wdmSearchMessagesCollection.createSearchMessagesCollection(instance);
        messages.setCursor(m);
        return messages;
    });

    instance.isSearchResult = true;
    instance._index = 0;

    return instance;
}

SearchConversation.prototype = Object.create(_super, {
    length: {get: function() { return this.results.length; }},
    messages: {get: function() { return this.results[this._index]; }},
    index: {get: function() { return this._index; }}
});

_.extend(SearchConversation.prototype, {

    constructor: SearchConversation,

    next: function() {
        this._index = (this._index + 1) % this.length;
    },

    previous: function() {
        this._index = (this._index + this.length - 1) % this.length;
    },

    hasNext: function() { return this._index < this.length; },
    hasPrevious: function() { return this._index > 0; }

});

return {
    SearchConversation: SearchConversation,
    createSearchConversation: function(results) {
        return new SearchConversation(results);
    }
};

}];
});
