define([
        'underscore',
        'angular'
    ], function(
        _,
        angular
    ) {
'use strict';
return ['$rootScope', function($rootScope) {
    var win = angular.element(window);
    $rootScope.viewport = {
        width: win.width(),
        height: win.height(),
        scrollTop: win.scrollTop(),
        scrollLeft: win.scrollLeft()
    };
    return function(scope, element) {
        var onresize = _.debounce(function() {
            $rootScope.$apply(function() {
                $rootScope.viewport.width = win.width();
                $rootScope.viewport.height = win.height();
            });
        }, 1000);
        var onscroll = _.throttle(function() {
            $rootScope.$apply(function() {
                $rootScope.viewport.scrollTop = win.scrollTop();
                $rootScope.viewport.scrollLeft = win.scrollLeft();
            });
        }, 300);
        // win.scroll(onscroll);
        win.resize(onresize);
        element.on('$destroy', function() {
            win.off('scroll', onscroll);
            win.off('resize', onresize);
        });
    };
}];
});
