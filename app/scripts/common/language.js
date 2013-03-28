define([
    'angular',
    'i18n!nls/photos',
    'i18n!nls/app',
    'i18n!nls/portal',
    'i18n!nls/messages'
], function(
    angular,
    photosDict,
    appDict,
    portalDict,
    messagesDict
) {
'use strict';
angular.module('wdLanguage', [])
    .factory('wdWordTable', [function() {
        return {
            app: appDict,
            portal: portalDict,
            photos: photosDict,
            messages: messagesDict
        };
    }]);
});
