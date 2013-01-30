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
        // scope: {
        //     header: '@',
        //     toggle: '=',
        //     ok: '&',
        //     cancel: '&'
        // },
        scope: true,
        link: function($scope, element, attrs) {
            var uid = _.uniqueId('modal_');
            var options = $scope.$eval(attrs.options);
            element.modal(_.defaults(options || {}, {
                show: false,
                keyboard: false,
                backdrop: 'static'
            }));

            var parentScope = 'all';
            function open() {
                parentScope = wdKey.getScope();
                wdKey.setScope(uid);
                element.modal('show');
            }
            function close() {
                wdKey.setScope(parentScope);
                element.modal('hide');
            }

            attrs.$observe('header', function(header) {
                $scope.header = header;
            });
            $scope.$watch(attrs.toggle, function(value) {
                if (value) {
                    open();
                }
                else {
                    close();
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
