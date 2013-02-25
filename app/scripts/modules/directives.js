define([
        'angular'
    ], function(
        angular
    ) {
'use strict';
angular.module('wdDirectives', [])
    .config(['$httpProvider', function($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
    }]);
});
