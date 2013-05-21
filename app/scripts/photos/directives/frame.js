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
return ['wdpImageHelper', function(wdpImageHelper) {
    return {
        link: function($scope, element, attrs) {
            var $current = null;
            var create = function(newPhoto) {
                // Create an img tag, then set its dimensions according to frame's.
                // At last, fade it in after the image resource being fully loaded.
                var $image = angular.element('<img>');
                $image
                    .data('photo', newPhoto)
                    .data('width', newPhoto.orientation % 180 === 0 ? newPhoto.width : newPhoto.height)
                    .data('height', newPhoto.orientation % 180 === 0 ? newPhoto.height : newPhoto.width)
                    .data('rotation', 0)
                    .attr('src', newPhoto.thumbnail_path);
                layout($image);
                wdpImageHelper.preload(newPhoto.path).then(function() {
                    $image
                        .attr('src', newPhoto.path)
                        .data('rotation', $image.data('rotation') + newPhoto.orientation)
                        .data('width', newPhoto.width)
                        .data('height', newPhoto.height)
                        .css({
                            transition: 'none',
                            transform: 'rotate(' + $image.data('rotation') + 'deg)'
                        });
                        layout($image);
                });

                return $image;
            };
            var destroy = function($image) {
                return $image.stop().fadeOut(200).promise().done(function() {
                    $image.remove();
                });
            };
            var layout = function($image) {
                var horizontal = $image.data('rotation') % 180 === 0;
                var photo = $image.data('photo');
                // var frameWidth = element.width();
                // var frameHeight = element.height();
                var frameWidth = angular.element(window).width() - 90 * 2;
                var frameHeight = angular.element(window).height() - 30 - 80;
                var imageWidth = horizontal ? $image.data('width') : $image.data('height');
                var imageHeight = horizontal ? $image.data('height') : $image.data('width');
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
                var promise = null;
                if ($current) {
                    promise = destroy($current);
                }
                // Create a new img tag, then append it to DOM.
                if (newPhoto) {
                    $current = create(newPhoto);
                    $current.hide().appendTo(element);
                    if (promise) {
                        promise.done(function() {
                            $current.fadeIn(200);
                        });
                    }
                    else {
                        $current.show();
                    }
                }
            });

            // Relayout triggering timming.
            // 1. When parent container resized.
            // 2. When parent container shown.
            $scope.$on('resize', relayoutAll);
            $scope.$on('open',   relayoutAll);
            $scope.$on('show', function() {
                element.css('visibility', 'visible');
            })
            $scope.$on('hide', function() {
                element.css('visibility', 'hidden');
            });

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
