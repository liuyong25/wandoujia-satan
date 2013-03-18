define([
    'angular'
], function(
    angular
) {
'use strict';

angular.module('wdResources', ['ngResource'])
    .factory('Photos', ['$resource', function($resource) {
        return $resource('/resource/photos/:id', {id: '@id'});
    }]);
});
