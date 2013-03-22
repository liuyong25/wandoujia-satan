define([], function() {
'use strict';
return [function() {

return function(input) {
    if (!input) { return ''; }
    var result = [];
    for (var i = 0; i < input.addresses.length; i += 1) {
        result.push(input.contact_names[i] || input.addresses[i]);
    }
    return result.join(', ');
};

}];
});
