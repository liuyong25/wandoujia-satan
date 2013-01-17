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
                var $image = angular.element('<img>');
                $image.data('photo', newPhoto)
                    .attr('src', newPhoto.path);
                layout($image);
                return $image.fadeIn();
            };
            var destroy = function($image) {
                jQuery.when($image.fadeOut()).done(function() {
                    $image.remove();
                });
            };
            var layout = function($image) {
                var photo = $image.data('photo');
                var frameWidth = element.width();
                var frameHeight = element.height();
                var imageWidth = photo.width;
                var imageHeight = photo.height;
                var widthScale = imageWidth / frameWidth;
                var heightScale = imageHeight / frameHeight;
                var scale = Math.max(widthScale, heightScale);
                if (scale > 1) {
                    imageWidth = imageWidth / scale;
                    imageHeight = imageHeight / scale;
                }
                var offsetX = (frameWidth - imageWidth) / 2;
                var offsetY = (frameHeight - imageHeight) / 2;
                $image.css({
                    position: 'absolute',
                    width: imageWidth,
                    height: imageHeight,
                    left: offsetX,
                    top: offsetY
                });
            };
            var relayoutAll = function() {
                element.children('img').each(function() {
                    layout(angular.element(this));
                });
            };

            // watch $scope to update images
            $scope.$watch(attrs.photo, function(newPhoto) {
                if ($current) {
                    destroy($current);
                }
                if (newPhoto) {
                    $current = create(newPhoto);
                    element.append($current);
                }
            });

            $scope.$on('resize', relayoutAll);
            $scope.$on('open',   relayoutAll);
        }
    };
}];
});
