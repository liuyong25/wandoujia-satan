define([
        'angular',
        'directives/common/window-event-watcher',
        'directives/common/loading',
        'directives/common/strip',
        'services/common/sharing',
        'services/common/dev',
        'services/common/viewport',
        'services/common/http',
        'directives/common/autofocus',
        'services/common/key',
        'services/common/alert'
    ], function(
        angular,
        windowEventWatcher,
        loading,
        strip,
        sharing,
        dev,
        viewport,
        http,
        autofocus,
        key,
        alert
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
    .factory('wdSharing', sharing)
    .factory('wdKey', key)
    .factory('wdAlert', alert)
    .controller('alertController', ['wdAlert', '$scope', '$q', '$rootScope', function(wdAlert, $scope, $q, $rootScope) {
        $scope.toggle = false;
        wdAlert.registerModal({
            open: function(content) {
                var deferred = $q.defer();
                $scope.content = content;
                $scope.toggle = true;
                $scope.ok = function() {
                    $scope.toggle = false;
                    deferred.resolve();
                };
                $scope.cancel = function() {
                    $scope.toggle = false;
                    deferred.reject();
                };
                return deferred.promise;
            }
        });
    }]);
});
