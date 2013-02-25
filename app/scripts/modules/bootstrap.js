define([
        'angular',
        'directives/bootstrap/navbar',
        'directives/bootstrap/tooltip',
        'directives/bootstrap/modal'
    ], function(
        angular,
        navbar,
        tooltip,
        modal
    ) {
'use strict';
angular.module('bootstrap', [])
    .directive('bsNavbar', navbar)
    .directive('bsTooltip', tooltip)
    .directive('bsModal', modal);
});
