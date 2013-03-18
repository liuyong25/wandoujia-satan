define([
    'jquery'
], function(
    jQuery
) {
'use strict';
return ['$compile', '$rootScope', function($compile, $rootScope) {
    var template = '<div bs-alert class="wd-notification chrome-ext"></div>';
    return {
        notify: function(scope, transcludeTemplate) {
            var defer = jQuery.Deferred();
            var transcludeScope = scope.$new();

            $compile(template)($rootScope, function(clonedElement, scope) {
                clonedElement.on('dismiss', function() {
                    defer.reject();
                })
                .on('action', function() {
                    defer.resolve();
                });

                clonedElement.on('closed', function() {
                    transcludeScope.$destroy();
                });

                $compile(transcludeTemplate)(transcludeScope, function(clonedTranscludeElement) {
                    clonedElement
                        .append(clonedTranscludeElement)
                        .appendTo(document.body);
                    setTimeout(function() {
                        clonedElement.addClass('in');
                    }, 0);
                });
            });
            $rootScope.$apply();
            return defer.promise();
        }
    };
}];
});
