define([
    'angular',
    'common/directives/bootstrap/tooltip',
    'common/directives/bootstrap/modal',
    'common/directives/bootstrap/alert'
], function(
    angular,
    tooltip,
    modal,
    alert
) {
'use strict';
angular.module('wdBootstrap', [])
    .directive('bsTooltip', tooltip)
    .directive('bsAlert', alert)
    .directive('bsModal', modal);
});
