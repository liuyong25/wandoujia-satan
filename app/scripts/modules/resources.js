define([
        'angular',
        'modules/common'
    ], function(
        angular,
        common
    ) {
'use strict';

var deviceAPIPrefix = '/api/v1';

function encodeServer(server) {
    return server.replace(':', '\\:');
}

angular.module('wdResources', ['ngResource', 'wdCommon'])
    .config(['$httpProvider', function($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
    }])
    .factory('Photos', ['$resource', 'wdDev', function($resource, wdDev) {
        console.log(encodeServer(wdDev.getServer()));
        return $resource(encodeServer(wdDev.getServer()) + deviceAPIPrefix + '/resource/photos/:id', {id: '@id'});
    }]);
});
