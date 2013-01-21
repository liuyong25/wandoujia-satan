define([
        'jquery',
        'angular'
    ], function(
        jQuery,
        angular
    ) {
'use strict';
/*
    When `photo` changed to a new photo, old image fade out, while new image fade in.
    When to null, all fade out.

    photo: photo to show
*/
return [function() {
    return {
        link: function($scope, element, attrs) {
            var $current = null;
            var create = function(newPhoto) {
                // Create an img tag, then set its dimensions according to frame's.
                // At last, fade it in after the image resource being fully loaded.
                var $image = angular.element('<img>');
                $image
                    .data('photo', newPhoto)
                    .data('rotation', 0)
                    .hide()
                    .one('load', function() {
                        $image.fadeIn();
                    })
                    .attr('src', newPhoto.path);
                layout($image);
                return $image;
            };
            var destroy = function($image) {
                jQuery.when($image.fadeOut()).done(function() {
                    $image.remove();
                });
            };
            var layout = function($image) {
                var horizontal = $image.data('rotation') % 180 === 0;
                var photo = $image.data('photo');
                var frameWidth = element.width();
                var frameHeight = element.height();
                var imageWidth = horizontal ? photo.width : photo.height;
                var imageHeight = horizontal ? photo.height : photo.width;
                var widthScale = imageWidth / frameWidth;
                var heightScale = imageHeight / frameHeight;
                var scale = Math.max(widthScale, heightScale);
                if (scale > 1) {
                    imageWidth = imageWidth / scale;
                    imageHeight = imageHeight / scale;
                }
                var offsetX = (frameWidth - (horizontal ? imageWidth : imageHeight)) / 2;
                var offsetY = (frameHeight - (horizontal ? imageHeight : imageWidth)) / 2;
                $image.css({
                    position: 'absolute',
                    width: horizontal ? imageWidth : imageHeight,
                    height: horizontal ? imageHeight : imageWidth,
                    left: offsetX,
                    top: offsetY
                });
            };
            var relayoutAll = function() {
                element.children('img').each(function() {
                    layout(angular.element(this));
                });
            };

            // Watching $scope via 'photo' attribute to update images
            $scope.$watch(attrs.photo, function(newPhoto) {
                // Destroy current image tag first.
                // The tag may not be removed immediately, for sake of fading out may take some
                // time.
                if ($current) {
                    destroy($current);
                }
                // Create a new img tag, then append it to DOM.
                if (newPhoto) {
                    $scope.loading = true;
                    $current = create(newPhoto);
                    $current.one('load', function() {
                        $scope.$apply(function() {
                            $scope.loading = false;
                        });
                    });
                    element.append($current);
                }
            });

            // Relayout triggering timming.
            // 1. When parent container resized.
            // 2. When parent container shown.
            $scope.$on('resize', relayoutAll);
            $scope.$on('open',   relayoutAll);

            $scope.$on('rotate', function() {
                // Error-tolerate
                if (!$current) {
                    return;
                }
                // Counter Clock-Wise, same as the icon.
                var rotation = $current.data('rotation') - 90;
                $current
                    .data('rotation', rotation)
                    .css({
                        transform: 'rotate(' + rotation + 'deg)',
                        transition: '-webkit-transform 0.2s'
                    });
                // After rotation, need relayout to guarantee the image still fix to the viewport.
                layout($current);
            });
        }
    };
}];
});
