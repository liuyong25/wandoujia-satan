define([
        'angular',
        'modules/common'
    ], function(
        angular,
        common
    ) {
'use strict';

function encodeServer(server) {
    return server.replace(':', '\\:');
}

angular.module('wdResources', ['ngResource', 'wdCommon'])
    .config(['$httpProvider', function($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
    }])
    .factory('Photos', ['$resource', 'wdDev', function($resource, wdDev) {
        return $resource(encodeServer(wdDev.getServer()) + wdDev.getAPIPrefix() + '/resource/photos/:id', {id: '@id'});
    }]);
});
