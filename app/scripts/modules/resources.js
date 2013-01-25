define([
        'angular',
        'modules/common'
    ], function(
        angular,
        common
    ) {
'use strict';



angular.module('wdResources', ['ngResource', 'wdCommon'])
    .factory('Photos', ['$resource', function($resource) {
        return $resource('/resource/photos/:id', {id: '@id'});
    }]);
});
