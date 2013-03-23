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
            console.log('new height', lastHeight, height);
        });
    });

    scope.$on('wdm:autoscroll:keep', function() {
        // var height = childElement.height();
        element.scrollTop(height - lastHeight);
        // lastHeight = height;
        console.log('keep', element.scrollTop());
    });
    scope.$on('wdm:autoscroll:bottom', function() {
        element.scrollTop(10000000000);
    });
}

};
}];
});
