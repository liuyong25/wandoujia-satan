define([
    'angular',
    'directives/bootstrap/navbar',
    'directives/bootstrap/tooltip',
    'directives/bootstrap/modal',
    'directives/bootstrap/alert'
], function(
    angular,
    navbar,
    tooltip,
    modal,
    alert
) {
'use strict';
angular.module('bootstrap', [])
    .directive('bsNavbar', navbar)
    .directive('bsTooltip', tooltip)
    .directive('bsAlert', alert)
    .directive('bsModal', modal);
});
