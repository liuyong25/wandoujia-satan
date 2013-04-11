define([
    'angular',
    'common/directives/loading',
    'common/directives/strip',
    'common/services/sharing',
    'common/services/dev',
    'common/services/viewport',
    'common/services/http',
    'common/directives/autofocus',
    'common/services/key',
    'common/services/alert',
    'common/directives/alert',
    'common/services/keeper',
    'common/services/ga',
    'common/services/notification',
    'common/directives/notification',
    'common/services/browser',
    'common/bootstrap',
    'common/directives/blank',
    'common/directives/upgrade-warning',
    'common/services/title-notification'
], function(
    angular,
    loading,
    strip,
    sharing,
    dev,
    viewport,
    http,
    autofocus,
    key,
    alert,
    alertDirecitve,
    keeper,
    ga,
    notification,
    notificationDirective,
    browser,
    bootstrap,
    blankDirective,
    upgradeWarningDirective,
    titleNotification
) {
// jshint unused:false
'use strict';
// Common Module is the collection of most used or global functions.
angular.module('wdCommon', ['wdBootstrap', 'ui'])
    // Directives
    .directive('wdStrip', strip)
    .directive('wdLoading', loading)
    .directive('wdAutoFocus', autofocus)
    .directive('wdAlert', alertDirecitve)
    .directive('wdNotification', notificationDirective)
    .directive('wdBlank', blankDirective)
    .directive('wdUpgradeWarning', upgradeWarningDirective)
    // Services
    .provider('wdHttp', http)
    .provider('wdDev', dev)
    .factory('wdBrowser', browser)
    .factory('wdViewport', viewport)
    .factory('wdSharing', sharing)
    .factory('wdKey', key)
    .factory('wdAlert', alert)
    .factory('wdKeeper', keeper)
    .factory('GA', ga)
    .factory('wdNotification', notification)
    .factory('wdTitleNotification', titleNotification)
    // Configuration
    .config(['$provide', 'wdHttpProvider', function($provide, wdHttpProvider) {
        $provide.decorator('$http', wdHttpProvider.httpDecorator);
    }]);
});
