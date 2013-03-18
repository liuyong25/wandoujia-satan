define([
    'angular',
    'common/directives/bootstrap/navbar',
    'common/directives/bootstrap/tooltip',
    'common/directives/bootstrap/modal',
    'common/directives/bootstrap/alert'
], function(
    angular,
    navbar,
    tooltip,
    modal,
    alert
) {
'use strict';
angular.module('wdBootstrap', [])
    .directive('bsNavbar', navbar)
    .directive('bsTooltip', tooltip)
    .directive('bsAlert', alert)
    .directive('bsModal', modal);
});
