define([
        'text!templates/photos/showcase.html',
        'underscore'
    ], function(
        template,
        _
    ) {
'use strict';

var layoutController = ['$scope', function($scope) {
    var self = this;
    self.createBlockPosition = function(index) {
        var meta = self.layout[index];
        return {
            left: meta.x + 40,
            top: meta.y
        };
    };
    self.createPhotoDimensions = function(index) {
        var meta = self.layout[index];
        return {
            width: meta.width,
            height: meta.height
        };
    };
    self.createImagePosition = function(index) {
        var meta = self.layout[index];
        return {
            left: meta.innerX,
            top: meta.innerY
        };
    };
}];

return ['$rootScope', 'PhotosLayoutAlgorithm', function($rootScope, PhotosLayoutAlgorithm) {
    return {
        template: template,
        replace: true,
        transclude: true,
        controller: layoutController,
        scope: {
            photos: '='
            // date: '='
        },
        compile: function($scope, element) {
            return function($scope, element, attrs, controller) {
                function layout() {
                    if ($scope.photos.length) {
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
                        controller.layout = meta.metas;

                        element.height(meta.height);
                        element.children('.date').css({
                            top: meta.metas[0].height / 2 - 20 / 2
                        });
                    }
                    else {
                        // element.remove();
                        // $scope.$destroy();
                    }
                }

                $scope.$watch('photos', layout, true);
                $rootScope.$watch('viewport.width', function(newWidth, oldWidth) {
                    if (newWidth !== oldWidth) {
                        layout();
                    }
                });
            };
        }
    };
}];


});
