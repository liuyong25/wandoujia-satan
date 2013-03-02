define([
        'angular',
        'i18n!nls/photos'
    ], function(
        angular,
        photosDict
    ) {
'use strict';
angular.module('wdLanguage', [])
    .factory('wdWordTable', [function() {
        return {
            photos: photosDict
        };
    }]);
});
