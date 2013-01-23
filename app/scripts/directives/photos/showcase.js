define([
        'text!templates/photos/showcase.html',
        'underscore'
    ], function(
        template,
        _
    ) {
'use strict';

return ['$rootScope', 'PhotosLayoutAlgorithm',
    function($rootScope, PhotosLayoutAlgorithm) {
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
                    containerWidth: $rootScope.viewport.width - 120 - 40,
                    containerHeight: -1,
                    photos: _.map($scope.photos, function(photo) {
                        return {
                            id: photo.id,
                            width: photo.thumbnail_width,
                            height: photo.thumbnail_height
                        };
                    })
                });
                $scope.layout = meta.metas;
                $scope.offsetTop = element.offset().top;

                element
                    .height(meta.height)
                    .children('.date')
                        .css({
                            top: meta.metas[0].height / 2 - 20 / 2
                        });
            }

            // In common situation, photos addition/removal may trigger relayout
            $scope.$watch('photos.length', function() {
                if ($scope.photos.length) {
                    layout();
                }
            });
            $rootScope.$watch('viewport.width', function(newWidth, oldWidth) {
                if (newWidth !== oldWidth) {
                    layout();
                }
            });

            $(window).on('scroll', _.throttle(function() {
                $scope.$broadcast('scroll', $(window).scrollTop());
            }, 300));
        }
    };
}];


});
