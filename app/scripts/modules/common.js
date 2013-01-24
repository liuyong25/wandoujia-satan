define([
        'angular',
        'directives/common/window-event-watcher',
        'directives/common/loading',
        'directives/common/strip',
        'services/common/sharing',
        'services/common/dev',
        'services/common/viewport'
    ], function(
        angular,
        windowEventWatcher,
        loading,
        strip,
        sharing,
        dev,
        viewport
    ) {
'use strict';
angular.module('wdCommon', [])
    .directive('wdStrip', strip)
    .directive('wdWindowEventWatcher', windowEventWatcher)
    .directive('wdLoading', loading)
    .factory('wdDev', dev)
    .factory('wdViewport', viewport)
    .factory('wdSharing', sharing);
});
