define([
        'text!templates/photos/actionbar.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        replace: true,
        template: template,
        restrict: 'CA'
    };
}];
});
