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
        link: function($scope, element) {
            function layout() {
                var meta = PhotosLayoutAlgorithm['default']({
                    fixedHeight: 170,
                    minWidth: 120,
                    gapWidth: 12,
                    gapHeight: 35,
                    borderWidth: 5,
                    containerWidth: wdViewport.width() - 120 - 40,
                    containerHeight: -1,
                    photos: _.map($scope.photos, function(photo) {
                        return {
                            id: photo.id,
                            width: photo.thumbnail_width,
                            height: photo.thumbnail_height
                        };
                    })
                });

                element
                    .height(meta.height)
                    .children('.date')
                        .css({
                            top: meta.metas[0].height / 2 - 20 / 2
                        });

                $scope.layout = meta.metas;
                $scope.offsetTop = element.offset().top;
            }

            // In common situation, photos addition/removal may trigger relayout
            $scope.$watch('photos.length', function() {
                if ($scope.photos.length) {
                    layout();
                    // When showcase layout, block may not fully initialized,
                    // We need to wait until next digest cycle to broadcast layout event,
                    // By then, all blocks already have been linked.
                    $scope.$evalAsync(function() {
                        $scope.$broadcast('layout');
                    });
                }
            });

            wdViewport
                .on('resize', function() {
                    layout();
                    $scope.$broadcast('layout');
                })
                .on('scroll', function() {
                    $scope.$broadcast('scroll', wdViewport.top());
                });
        }
    };
}];


});
