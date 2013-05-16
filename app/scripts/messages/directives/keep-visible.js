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
            var top = activeElement.position().top - element.find('.wdmc-row').first().top;
            var scrollTop = element.scrollTop();
            var height = activeElement.outerHeight();
            var containerHeight = element.height();

            if (top < scrollTop) {
                element.scrollTop(top);
            }
            else if ((top + height) > (scrollTop + containerHeight)) {
                element.scrollTop(top + height - containerHeight);
            }
        });
    });
}

};
}];
});
