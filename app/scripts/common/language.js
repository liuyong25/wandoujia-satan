define([
    'angular',
    'i18n!nls/photos',
    'i18n!nls/app',
    'i18n!nls/portal',
    'i18n!nls/contacts',
    'i18n!nls/messages',
    'i18n!nls/applications'
], function(
    angular,
    photosDict,
    appDict,
    portalDict,
    contactsDict,
    messagesDict,
    applicationsDict
) {
'use strict';
angular.module('wdLanguage', [])
    .factory('wdWordTable', [function() {
        return {
            app: appDict,
            portal: portalDict,
            photos: photosDict,
            messages: messagesDict,
            contacts: contactsDict,
            applications: applicationsDict
        };
    }]);
});
