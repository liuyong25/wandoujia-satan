define([
    'angular',
    'common/main',
    'applications/controllers/ApplicationsCtrl',
    'applications/services/applicationsSer'
], function(
    angular,
    common,
    applicationsCtrl,
    applicationsSer
) {

'use strict';

//注册angular的模块和control
angular.module('wdApplications', ['wdCommon'])
        .controller('ApplicationsCtrl', applicationsCtrl)
        .factory('wdcApplications',applicationsSer);
});
