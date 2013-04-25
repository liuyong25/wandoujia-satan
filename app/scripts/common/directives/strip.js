define([
        'angular'
    ], function(
        angular
    ) {
'use strict';
return [function() {
    return {
        priority: 10000,
        compile: function(element) {
            element.contents().each(function(i, node) {
                if (node.nodeType == 3 /* text node */ && !node.nodeValue.match(/\S+/) /* non-empty */) {
                    angular.element(node).remove();
                }
            });
            return function() {};
        }
    };
}];
});
