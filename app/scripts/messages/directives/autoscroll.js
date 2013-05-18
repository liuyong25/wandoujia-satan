define([], function() {
'use strict';
return [function() {
return {

link: function(scope, element, attributes) {
    var childElement = element.children();
    var lastHeight = 0;
    var height = 0;

    scope.$on('wdm:autoscroll:prekeep', function() {
        lastHeight = childElement.height();
    });
    scope.$on('wdm:autoscroll:keep', function() {
        setTimeout(function() {
            var height = childElement.height();
            element.stop().scrollTop(height - lastHeight);
            lastHeight = height;
        }, 0);
    });
    scope.$on('wdm:autoscroll:flip', function() {
        var cursor = childElement.find('.wdme-row-highlight');
        var to = childElement.outerHeight();
        if (cursor.length) {
            var cursorTop = cursor.offset().top;
            var cursorHeight = cursor.height();
            var cursorBottom = cursorTop + cursorHeight;
            var containerTop = element.offset().top;
            var containerHeight = element.height();
            var containerBottom = containerTop + containerHeight;
            var scrollTop = element.scrollTop();

            to = Math.min(to, scrollTop + (cursorTop - containerTop) - (containerHeight / 2 - cursorHeight / 2));
        }

        element.stop().scrollTop(to);
    });

    scope.$on('wdm:autoscroll:bottom', function() {
        element.animate({
            scrollTop: childElement.outerHeight()
        }, 1000);
    });
}

};
}];
});
