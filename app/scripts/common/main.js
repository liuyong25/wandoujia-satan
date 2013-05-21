define([
    'angular',
    'common/directives/loading',
    'common/directives/strip',
    'common/services/sharing',
    'common/services/dev',
    'common/services/viewport',
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
    'common/services/title-notification',
    'common/directives/navbar',
    'common/services/emitter',
    'common/services/socket',
    'common/directives/auto-stretch-textarea'
], function(
    angular,
    loading,
    strip,
    sharing,
    dev,
    viewport,
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
    titleNotification,
    navbar,
    emitter,
    socket,
    autoStretchTextarea
) {
// jshint unused:false
'use strict';
// Common Module is the collection of most used or global functions.
angular.module('wdCommon', ['wdBootstrap', 'ui', 'monospaced.elastic'])
    // Directives
    .directive('wdAutoFocus', autofocus)
    .directive('wdAutoStretchTextarea', autoStretchTextarea)
    .directive('wdNavbar', navbar)
    .directive('wdStrip', strip)
    .directive('wdLoading', loading)
    .directive('wdAlert', alertDirecitve)
    .directive('wdNotification', notificationDirective)
    .directive('wdBlank', blankDirective)
    .directive('wdUpgradeWarning', upgradeWarningDirective)
    // Services
    .provider('wdDev', dev)
    .provider('wdEventEmitter', emitter)
    .factory('wdSocket', socket)
    .factory('wdBrowser', browser)
    .factory('wdViewport', viewport)
    .factory('wdSharing', sharing)
    .factory('wdKey', key)
    .factory('wdAlert', alert)
    .factory('wdKeeper', keeper)
    .factory('GA', ga)
    .factory('wdNotification', notification)
    .factory('wdTitleNotification', titleNotification);
});
