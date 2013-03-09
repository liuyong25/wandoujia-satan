define([
        'text!templates/photos/showcase.html',
        'underscore'
    ], function(
        template,
        _
    ) {
'use strict';

return ['$rootScope', 'PhotosLayoutAlgorithm', 'wdViewport',
    function($rootScope, PhotosLayoutAlgorithm, wdViewport) {
    return {
        template: template,
        replace: true,
        transclude: true,
        restrict: 'CA',
        link: function($scope, element) {
            $scope.$on('wdp:showcase:layout', function(e, layout) {
                element.height(layout.height);
            });
        }
    };
}];


});
