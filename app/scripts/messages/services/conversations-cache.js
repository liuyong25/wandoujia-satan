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
    messages: []
});


}];
});
