define([], function() {
'use strict';
return [function() {
return {

link: function(scope, element, attributes) {
    var childElement = element.children();
    var lastHeight = childElement.height();
    scope.$watch(attributes.wdmAutoScroll, function() {
        scope.$evalAsync(function() {
            var height = childElement.height();
            element.scrollTop(height - lastHeight);
            lastHeight = height;
        });
    });

    scope.$on('wdm:editor:focus', function() {
        element.scrollTop(100000000);
    });
}

};
}];
});
