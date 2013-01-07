define([], function() {
'use strict';
return [function() {
    return {
        compile: function(element) {
            console.log(element);
        }
    };
}];
});
