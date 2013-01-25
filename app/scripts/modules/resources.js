define([
        'angular',
        'modules/common'
    ], function(
        angular,
        common
    ) {
'use strict';



angular.module('wdResources', ['ngResource', 'wdCommon'])
    .factory('Photos', ['$resource', 'wdDev', function($resource, wdDev) {
        return $resource(wdDev.wrapURL('/resource/photos/:id', true), {id: '@id'});
    }]);
});
