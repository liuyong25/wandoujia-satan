define([
    'underscore'
], function(
    _
) {
'use strict';
return [function() {

return function(input) {
    var output = _(input).groupBy(function(item) {
        return Math.floor(item.date / (3600 * 24)) * 3600 * 24;
    });
    console.log('group');
    return output;
};

}];
});
