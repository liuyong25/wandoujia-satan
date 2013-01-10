define([
        'text!templates/photos/slides.html',
        'underscore'
    ], function(
        template,
        _
    ) {
'use strict';
return ['WDP_PLAYING_INTERVAL', '$rootScope', function(WDP_PLAYING_INTERVAL, $rootScope) {
    return {
        template: template,
        replace: true,
        controller: ['$scope', function($scope) {
                var self = this;
                self.calImageDimensions = function() {};
                $scope.playing = null;
                $scope.play = function() {
                    if ($scope.playing !== null) {
                        $scope.pause();
                        return;
                    }
                    $scope.playing = setInterval(function() {
                        if ($scope.index < $scope.photos.length - 1) {
                            $scope.next();
                        }
                        else {
                            $scope.pause();
                        }
                    }, WDP_PLAYING_INTERVAL);
                };
                $scope.pause = function() {
                    clearInterval($scope.playing);
                    $scope.playing = null;
                };
                $scope.next = function() {
                    $scope.current = $scope.photos[_.indexOf($scope.photos, $scope.current) + 1];
                };
                $scope.previous = function() {
                    $scope.current = $scope.photos[_.indexOf($scope.photos, $scope.current) - 1];
                };
                $scope.hasNext = function() {
                    return _.indexOf($scope.photos, $scope.current) < $scope.photos.length - 1;
                };
                $scope.hasPrevious = function() {
                    return _.indexOf($scope.photos, $scope.current) > 0;
                };
                $scope.close = function() {
                    $scope.current = null;
                };
                $scope.remove = function() {
                    $scope['delete']({photo: $scope.current});
                    $scope.close();
                };
            }],
        scope: {
            current: '=',
            photos: '=',
            'delete': '&onDelete',
            download: '&onDownload',
            share: '&onShare'
        },
        link: function($scope, element, attr, controller) {
            var frame = element.find('.frame');
            $scope.$watch('current', function(newValue) {
                if (newValue !== null) {
                    open();
                }
                else {
                    close();
                }
            });

            function layoutFrame() {
                var frameWidth = frame.width();
                var frameHeight = frame.height();
                var imageWidth = $scope.current.width;
                var imageHeight = $scope.current.height;
                var widthScale = imageWidth / frameWidth;
                var heightScale = imageHeight / frameHeight;
                var scale = Math.max(widthScale, heightScale);
                var ratio = imageWidth / imageHeight;
                if (scale > 1) {
                    imageWidth = imageWidth / scale;
                    imageHeight = imageHeight / scale;
                }
                var offsetX = (frameWidth - imageWidth) / 2;
                var offsetY = (frameHeight - imageHeight) / 2;
                var image = frame.find('img');
                image.css({
                    position: 'absolute',
                    width: imageWidth,
                    height: imageHeight,
                    left: offsetX,
                    top: offsetY
                });
            }

            function updateDimensions(newValue, oldValue) {
                if (newValue !== oldValue) {
                    layoutFrame();
                }
            }
            $rootScope.$watch('viewport.width', updateDimensions);
            $rootScope.$watch('viewport.height', updateDimensions);

            function open() {
                element.addClass('slides-active');
                layoutFrame();
            }
            function close() {
                element.removeClass('slides-active');
            }
        }
    };
}];
});
