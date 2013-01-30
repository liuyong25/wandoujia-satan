define([], function() {
'use strict';
return [function() {
    var noop = function() {};
    return {
        scope: {},
        controller: ['wdAlert', '$scope', '$q', function(wdAlert, $scope, $q) {
            $scope.toggle = false;
            $scope.ok = noop;
            $scope.cancel = noop;
            $scope.content = '';

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
        }],
        compile: function(element, attrs) {
            // Inject attrs into bsModul for using isolate scope.
            attrs.$set('toggle', 'toggle');
            attrs.$set('ok', 'ok()');
            attrs.$set('cancel', 'cancel()');
            // Inject text content.
            element.find('[ng-transclude]').text('{{content}}');
            // No need for linking, just depends on bsModal.
            return function() {};
        }
    };
}];
});
