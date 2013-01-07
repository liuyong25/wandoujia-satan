define([
        'text!templates/bootstrap/navbar.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        restrict: 'EAC',
        replace: true,
        transclude: true,
        template: template
    };
}];
});
