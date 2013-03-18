define([
        'text!templates/photos/progress.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        template: template,
        replace: true,
        restrict: 'CA',
        link: function(scope, element) {
            // Element caches.
            var bar = element.children('[data-bar]');
            var done = bar.children('[data-done]');
            var failed = bar.children('[data-failed]');
            var btnCancel = element.children('.cancel');

            var promise = scope.photo.deferred;

            if (!promise) { return; }

            scope.cancel = function() {
                scope.cancelUpload();
            };
            scope.retry = function() {
                failed.hide();
                bar.css({
                    transform: 'scaleX(0)',
                    height: 9,
                    background: '#6eb800'
                });
                scope.retryUpload();
            };

            promise
                .progress(function(report) {
                    if (report.status === 'uploading') {
                        bar.css('transform', 'scaleX(' + (report.percent / 100) + ')');
                    }
                    if (report.status === 'failed') {
                        bar.css({
                            transform: 'none',
                            height: 20,
                            background: '#a00'
                        });
                        failed.fadeIn();
                    }
                })
                .done(function() {
                    bar.css({
                        transform: 'none',
                        height: 20
                    });
                    btnCancel.fadeOut('fast');
                    done.fadeIn();
                });
            // Initialize
            done.hide();
            failed.hide();
        }
    };
}];
});
