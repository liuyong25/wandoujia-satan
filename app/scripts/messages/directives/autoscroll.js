define([], function() {
'use strict';
return [function() {
return {

link: function(scope, element, attributes) {
    var childElement = element.children();
    var lastHeight = 0;
    var height = 0;

    scope.$watch(attributes.wdmAutoScroll, function() {
        scope.$evalAsync(function() {
            lastHeight = height;
            height = childElement.height();
        });
    });

    scope.$on('wdm:autoscroll:keep', function() {
        element.scrollTop(height - lastHeight);
    });
    scope.$on('wdm:autoscroll:bottom', function() {
        element.stop().animate({
            scrollTop: childElement.outerHeight()
        });
    });
}

};
}];
});
