define([
    'jquery'
], function(
    jQuery
) {
'use strict';
return ['$compile', '$rootScope', function($compile, $rootScope) {
    var template = '<div bs-alert class="wd-notification chrome-ext"></div>';
    return {
        notify: function() {
            var defer = jQuery.Deferred();
            var scope = $rootScope.$new();
            $compile(template)(scope, function(clonedElement) {
                clonedElement.on('close.wd-notification', function() {
                    defer.resolve();
                })
                .on('closed.wd-notification', function() {
                    scope.$destroy();
                    clonedElement.remove();
                });

                clonedElement.appendTo(document.body);
                setTimeout(function() {
                    clonedElement.addClass('in');
                }, 0);
            });
            return defer.promise();
        }
    };
}];
});
