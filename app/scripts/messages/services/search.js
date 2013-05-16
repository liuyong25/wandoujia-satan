define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmConversationsCollection',
function(wdmConversationsCollection) {

var _self = wdmConversationsCollection.ConversationsCollection.prototype;

function Search() {
    _self.constructor.call(this);
}

Search.prototype = Object.create(_self);

return {
    search: function(keyword) {

    }
};

}];
});
