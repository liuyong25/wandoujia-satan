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
    var instance = _super.constructor.call(this, {
        id: results[0].cid,
        snippet: results[0].snippet,
        date: _.max(results, function(r) { return r.date; }).date
    });

    instance.results = results.map(function(m) {
        var messages = wdmSearchMessagesCollection.createSearchMessagesCollection(instance);
        messages.setCursor(m);
        return messages;
    });

    instance.isSearchResult = true;

    return instance;
}

SearchConversation.prototype = Object.create(_super, {
    length: {get: function() { return this.results.length; }}
});

_.extend(SearchConversation.prototype, {

    constructor: SearchConversation

});

return {
    SearchConversation: SearchConversation,
    createSearchConversation: function(results) {
        return new SearchConversation(results);
    }
};

}];
});
