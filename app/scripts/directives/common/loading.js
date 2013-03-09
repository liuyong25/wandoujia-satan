define([], function() {
'use strict';
return [function() {
    return {
        restrict: 'C',
        template:
            '<div>' +
                '<div></div>' +
                '<div></div>' +
                '<div></div>' +
                '<div></div>' +
                '<div></div>' +
                '<div></div>' +
                '<div></div>' +
                '<div></div>' +
            '</div>',
        replace: true,
        link: function(scope, element, attributes) {
            var firstLoopTimeout = null;
            scope.$watch(attributes.visible, function(visible) {
                if (!visible) {
                    if (firstLoopTimeout != null) {
                        element.addClass('wd-loading-hide wd-loading-animation-pause');
                    }
                    else {
                        element.addClass('wd-loading-hide');
                        firstLoopTimeout = setTimeout(function() {
                            element.addClass('wd-loading-animation-pause');
                        }, 2000);
                    }
                }
                else {
                    clearTimeout(firstLoopTimeout);
                    element.removeClass('wd-loading-hide wd-loading-animation-pause');
                }
            });
        }
    };
}];
});
