define([
        'angular',
        'directives/bootstrap/navbar'
    ], function(
        angular,
        navbar
    ) {
'use strict';
angular.module('bootstrap', []).
    directive('bsNavbar', navbar);
});
