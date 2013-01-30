define([
        'underscore',
        'text!templates/bootstrap/modal.html'
    ], function(
        _,
        template
    ) {
'use strict';
return ['$q', 'wdKey', function($q, wdKey) {
    return {
        restrict: 'EAC',
        replace: true,
        transclude: true,
        template: template,
        link: function($scope, element, attrs) {
            // Unique ID for keyboard shortcuts 'Scope' indication.
            var uid = _.uniqueId('modal_');
            // @options, no watch
            var options = $scope.$eval(attrs.options);
            element.modal(_.defaults(options || {}, {
                show: false,
                // Manage shortcuts by wdKey
                keyboard: false,
                backdrop: 'static'
            }));

            function open() {
                element.modal('show');
            }
            function close() {
                element.modal('hide');
            }

            // @header
            attrs.$observe('header', function(header) {
                $scope.header = header;
            });

            var keyboardScope = null;
            $scope.$watch(attrs.toggle, function(value, oldValue) {
                if (value === oldValue) {
                    return;
                }
                if (value) {
                    keyboardScope = $q.defer();
                    wdKey.push(uid, keyboardScope.promise);
                    open();
                }
                else {
                    close();
                    keyboardScope.resolve();
                }
            });

            // var noop = function() {};
            // function wrapPromise(promise) {
            //     if (promise === false) {
            //         return $q.reject();
            //     }
            //     else {
            //         return $q.when(promise);
            //     }
            // }
            // function ok() {
            //     wrapPromise($scope.ok()).then(close);
            // }
            // function cancel() {
            //     wrapPromise($scope.cancel()).then(close);
            // }

            element.on('click', '[bs-modal-ok]', function() {
                $scope.$apply(attrs.ok);
            });
            element.on('click', '[bs-modal-cancel]', function() {
                $scope.$apply(attrs.cancel);
            });

            wdKey.$apply('enter', uid, function() {
                $scope.$eval(attrs.ok);
                return false;
            });
            wdKey.$apply('esc',   uid, function() {
                $scope.$eval(attrs.cancel);
                return false;
            });
        }
    };
}];
});
