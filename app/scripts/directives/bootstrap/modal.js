define([
        'underscore',
        'text!templates/bootstrap/modal.html'
    ], function(
        _,
        template
    ) {
'use strict';
return ['wdKey', function(wdKey) {
    return {
        restrict: 'EAC',
        replace: true,
        transclude: true,
        template: template,
        link: function($scope, element, attrs) {
            // Unique ID for keyboard shortcuts 'Scope' indication.
            var uid = _.uniqueId('modal_');
            var keyboardScope = null;
            // @options, no watch
            var options = $scope.$eval(attrs.options);
            var $header = element.find('.modal-header > h3');

            // Initialize modal widget.
            element.modal(_.defaults(options || {}, {
                show: false,
                // Manage shortcuts by wdKey
                keyboard: false,
                backdrop: 'static'
            }));

            function open() {
                keyboardScope = wdKey.push(uid);
                element.modal('show');
            }

            function close() {
                element.modal('hide');
                keyboardScope.done();
                keyboardScope = null;
            }

            attrs.$observe('header', function(header) {
                $header.text(header);
            });

            $scope.$watch(attrs.toggle, function(value, oldValue) {
                if (value === oldValue) {
                    return;
                }
                if (value) {
                    open();
                }
                else {
                    close();
                }
            });

            element.on('click', '[bs-modal-ok]', function() {
                if (attrs.ok) {
                    $scope.$apply(attrs.ok);
                }
            });
            element.on('click', '[bs-modal-cancel]', function() {
                if (attrs.cancel) {
                    $scope.$apply(attrs.cancel);
                }
            });

            wdKey.$apply('enter', uid, function() {
                $scope.$eval(attrs.ok);
                return false;
            });
            wdKey.$apply('esc',   uid, function() {
                $scope.$eval(attrs.cancel);
                return false;
            });

            // Destruction
            $scope.$on('$destroy', function() {
                if (keyboardScope) {
                    keyboardScope.resolve();
                }
                wdKey.deleteScope(uid);
            });
        }
    };
}];
});
