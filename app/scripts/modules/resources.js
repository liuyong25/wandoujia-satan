define([
        'angular'
    ], function(
        angular
    ) {
'use strict';

var deviceAPIPrefix = '/api/v1';

angular.module('wdResources', ['ngResource']).
    factory('Photos', ['$resource', function($resource) {
        return $resource(deviceAPIPrefix + '/resource/photos/:id');
    }]);
});
