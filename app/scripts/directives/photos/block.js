define([
        'angular',
        'text!templates/photos/block.html',
        'jquery',
        'underscore'
    ], function(
        angular,
        template,
        jQuery,
        _
    ) {
'use strict';
return [function() {
    return {
        template: template,
        replace: true,
        restrict: 'CA',
        link: function($scope, element, attrs) {
            // Element cache
            var photo = element.children('.photo');
            var image = angular.element(new Image());
            image.css('opacity', 0).appendTo(photo);

            // Selection
            $scope.$watch(attrs.selected, function(newValue) {
                $scope.selected = newValue;
            });
            // Update thumbnail
            $scope.$watch('photo.thumbnail_path', function() {
                renderImage();
            });
            // Update layout
            $scope.$on('layout', function() {
                relayout();
            });

            var success = false;
            $scope.cancelUpload = function() {
                if (!success) {
                    $scope.photo.deferred.cancelUpload();
                }
                $scope.removeFailed($scope.photo);
            };
            $scope.retryUpload = function() {
                $scope.photo.deferred.retryUpload();
            };

            var isUpload = !!$scope.photo.deferred;
            element
                .children('.actions')
                    .toggle(!isUpload)
                    .end()
                .children('.wdp-progress')
                    .toggle(isUpload);
            if (isUpload) {
                $scope.photo.deferred.done(function() {
                    success = true;
                    setTimeout(function() {
                        element
                            .children('.actions')
                                .show()
                                .end()
                            .children('.wdp-progress')
                                .fadeOut();
                    }, 2000);
                });
            }

            function renderImage() {
                preloadImage($scope.photo.thumbnail_path, function(path) {
                    image
                        .attr('src', path)
                        .css('opacity', 1);
                });
            }
            function preloadImage(path, callback) {
                var temp = new Image();
                temp.onload = function() {
                    temp = temp.onload = null;
                    callback(path);
                };
                temp.src = path;
            }
            function relayout() {
                var layout = $scope.layout[$scope.$index];
                element.css({
                        left: layout.x,
                        top: layout.y,
                    });
                photo.css({
                        width: layout.width,
                        height: layout.height
                    });
                image.css({
                    left: layout.innerX,
                    top: layout.innerY
                });
                _.defer(function() {
                    element.add(photo).add(image).addClass('anim');
                });
            }
        }
    };
}];
});
