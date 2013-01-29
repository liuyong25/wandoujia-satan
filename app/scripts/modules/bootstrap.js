define([
        'angular',
        'directives/bootstrap/navbar',
        'directives/bootstrap/tooltip'
    ], function(
        angular,
        navbar,
        tooltip
    ) {
'use strict';
angular.module('bootstrap', [])
    .directive('bsNavbar', navbar)
    .directive('bsTooltip', tooltip);
});
