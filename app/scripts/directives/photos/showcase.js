define([
        'text!templates/photos/showcase.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            index: '=',
            date: '@'
        },
        template: template,
        link: function(scope, element, attrs) {
            console.log(scope, element, attrs);
        }
    };
}];
});
