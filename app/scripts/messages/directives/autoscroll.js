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
        element.stop().scrollTop(childElement.outerHeight());
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
