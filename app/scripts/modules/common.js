define([
        'angular',
        'directives/common/window-event-watcher',
        'directives/common/loading',
        'directives/common/strip'
    ], function(
        angular,
        windowEventWatcher,
        loading,
        strip
    ) {
'use strict';
angular.module('wdCommon', [])
    .directive('wdStrip', strip)
    .directive('wdWindowEventWatcher', windowEventWatcher)
    .directive('wdLoading', loading);
});
