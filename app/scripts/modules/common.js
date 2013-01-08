define([
        'angular',
        'directives/common/window-event-watcher',
        'directives/common/loading',
        'directives/common/strip',
        'services/common/sharing'
    ], function(
        angular,
        windowEventWatcher,
        loading,
        strip,
        sharing
    ) {
'use strict';
angular.module('wdCommon', [])
    .directive('wdStrip', strip)
    .directive('wdWindowEventWatcher', windowEventWatcher)
    .directive('wdLoading', loading)
    .factory('wdSharing', sharing);
});
