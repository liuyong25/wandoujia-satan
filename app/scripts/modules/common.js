define([
        'angular',
        'directives/common/window-event-watcher',
        'directives/common/loading',
        'directives/common/strip',
        'services/common/sharing',
        'services/common/dev',
        'services/common/viewport',
        'services/common/http',
        'directives/common/autofocus'
    ], function(
        angular,
        windowEventWatcher,
        loading,
        strip,
        sharing,
        dev,
        viewport,
        http,
        autofocus
    ) {
'use strict';
angular.module('wdCommon', [])
    .directive('wdStrip', strip)
    .directive('wdWindowEventWatcher', windowEventWatcher)
    .directive('wdLoading', loading)
    .directive('wdAutoFocus', autofocus)
    .provider('wdHttp', http)
    .provider('wdDev', dev)
    .factory('wdViewport', viewport)
    .factory('wdSharing', sharing);
});
