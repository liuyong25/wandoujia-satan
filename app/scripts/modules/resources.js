define([
        'angular',
        'modules/common'
    ], function(
        angular,
        common
    ) {
'use strict';

var deviceAPIPrefix = '/api/v1';

angular.module('wdResources', ['ngResource', 'wdCommon']).
    factory('Photos', ['$resource', 'wdDev', function($resource, wdDev) {
        return $resource(wdDev.getServer() + deviceAPIPrefix + '/resource/photos/:id', {id: '@id'});
    }]);
});
