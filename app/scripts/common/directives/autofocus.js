define([], function() {
'use strict';
return [function() {
    return {
        link: function($scope, element) {
            setTimeout(function() {
                element.focus();
            }, 0);
        }
    };
}];
});
