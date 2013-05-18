define([
    'underscore'
], function(
    _
) {
'use strict';
return [function() {
return {

link: function(scope, element) {

    scope.$on('wdm:conversations:intoView', function() {
        _.defer(function() {
            var activeElement = element.find('.wdmc-row.highlight');
            if (!activeElement.size()) { return; }

            var containerHeight = element.height();
            var containerTop = element.offset().top;
            var containerBottom = containerTop + containerHeight;

            var top = activeElement.offset().top - containerTop;
            var height = activeElement.outerHeight();
            var bottom = top + height;

            var scrollTop = element.scrollTop();

            if (top < 0) {
                element.stop().animate({
                    scrollTop: scrollTop + top - containerHeight
                });
            }

            if (bottom > containerHeight) {
                element.stop().animate({
                    scrollTop: scrollTop + top
                });
            }

            // if (top < scroll.Top) {
            //     element.scrollTop(top);
            // }
            // else if ((top + height) > (scrollTop + containerHeight)) {
            //     element.scrollTop(top + height - containerHeight);
            // }
        });
    });
}

};
}];
});
