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
        controller: ['$scope', '$timeout', function($scope, $timeout) {
                var self = this;
                self.calImageDimensions = function() {};
                self.getCurIndex = function() {
                    return _.indexOf($scope.photos, $scope.current);
                };

                $scope.loading = false;
                $scope.playing = null;
                $scope.play = function() {
                    if ($scope.playing !== null) {
                        $scope.pause();
                        return;
                    }
                    $scope.playing = setInterval(function() {
                        if (self.getCurIndex() < $scope.photos.length - 1) {
                            $scope.$apply(function() {
                                $scope.current = $scope.photos[self.getCurIndex() + 1];
                            });
                        }
                        else {
                            $scope.$apply(function() {
                                $scope.pause();
                            });
                        }
                    }, WDP_PLAYING_INTERVAL);
                };
                $scope.pause = function() {
                    clearInterval($scope.playing);
                    $scope.playing = null;
                };
                $scope.next = function() {
                    $scope.pause();
                    $scope.current = $scope.photos[self.getCurIndex() + 1];
                };
                $scope.previous = function() {
                    $scope.pause();
                    $scope.current = $scope.photos[self.getCurIndex() - 1];
                };
                $scope.hasNext = function() {
                    return self.getCurIndex() < $scope.photos.length - 1;
                };
                $scope.hasPrevious = function() {
                    return self.getCurIndex() > 0;
                };
                $scope.close = function() {
                    $scope.pause();
                    $scope.current = null;
                };
                $scope.remove = function() {
                    $scope['delete']({photo: $scope.current});
                    if ($scope.hasNext()) {
                        $scope.next();
                    }
                    else if ($scope.hasPrevious()) {
                        $scope.previous();
                    }
                    else {
                        $scope.close();
                    }
                };
                $scope.rotate = function() {
                    $scope.$broadcast('rotate');
                };
            }],
        scope: {
            current: '=',
            photos: '=',
            'delete': '&onDelete',
            download: '&onDownload',
            share: '&onShare'
        },
        link: function($scope, element/*, attr, controller*/) {
            var frame = element.find('.frame');

            function layoutFrame() {
                var frameWidth = frame.width();
                var frameHeight = frame.height();
                var imageWidth = $scope.current.width;
                var imageHeight = $scope.current.height;
                var widthScale = imageWidth / frameWidth;
                var heightScale = imageHeight / frameHeight;
                var scale = Math.max(widthScale, heightScale);
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
                if (newValue !== oldValue && $scope.current !== null) {
                    $scope.$broadcast('resize');
                }
            }
            $rootScope.$watch('viewport.width', updateDimensions);
            $rootScope.$watch('viewport.height', updateDimensions);

            function open() {
                element.addClass('slides-active');
                $scope.$broadcast('open');
            }
            function close() {
                $scope.close();
                $scope.$broadcast('close');
                element.removeClass('slides-active');
            }

            $scope.$watch('current', function(newValue) {
                if (newValue !== null) {
                    open();
                }
                else {
                    close();
                }
            });

            // close slides when user click directly on the container
            element.on('click', function(e) {
                if (e.target === this) {
                    $scope.$apply(close);
                }
            });
            element.on('click', '.frame', function(e) {
                if (e.target === this) {
                    $scope.$apply(close);
                }
            });
            element.find('img').on('load', function() {
                console.log(arguments);
            });
        }
    };
}];
});
