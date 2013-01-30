define([
        'text!templates/photos/slides.html',
        'underscore'
    ], function(
        template,
        _
    ) {
'use strict';
return ['WDP_PLAYING_INTERVAL', '$rootScope', 'wdViewport', 'wdKey',
    function(WDP_PLAYING_INTERVAL, $rootScope, wdViewport, wdKey) {
    return {
        template: template,
        replace: true,
        controller: ['$scope', function($scope) {
                var self = this;

                // Return the current previewing photo's index of all photos in real time.
                self.getCurIndex = function() {
                    return _.indexOf($scope.photos, $scope.current);
                };

                // Switch photos.
                self.next = function() {
                    $scope.current = $scope.photos[self.getCurIndex() + 1];
                };
                self.previous = function() {
                    $scope.current = $scope.photos[self.getCurIndex() - 1];
                };

                // Start autoplay.
                var autoplayTimer = null;
                self.play = function() {
                    // Do nothing if it has been autoplaying.
                    if (autoplayTimer !== null) {
                        return;
                    }
                    autoplayTimer = setInterval(function() {
                        // Keep playing straight forward, no loop.
                        if (self.getCurIndex() < $scope.photos.length - 1) {
                            $scope.$apply(function() {
                                self.next();
                            });
                        }
                        else {
                            self.pause();
                        }
                    }, WDP_PLAYING_INTERVAL);
                    $scope.playing = true;
                };
                self.pause = function() {
                    // Pause can be called without detecting autoplay state.
                    clearInterval(autoplayTimer);
                    autoplayTimer = null;
                    $scope.playing = false;
                };

                // Indicates whether there is something on loading state.
                // If true, turn on loading animation.
                $scope.loading = false;
                $scope.playing = false;
                $scope.play = function() {
                    self.play();
                };
                $scope.pause = function() {
                    self.pause();
                };
                $scope.togglePlay = function() {
                    if ($scope.playing) {
                        $scope.pause();
                    }
                    else {
                        $scope.play();
                    }
                };
                $scope.next = function() {
                    self.pause();
                    self.next();
                };
                $scope.previous = function() {
                    self.pause();
                    self.previous();
                };
                $scope.hasNext = function() {
                    return self.getCurIndex() < $scope.photos.length - 1;
                };
                $scope.hasPrevious = function() {
                    return self.getCurIndex() > 0;
                };
                $scope.close = function() {
                    self.pause();
                    $scope.current = null;
                };
                $scope.remove = function() {
                    self.pause();
                    var index = self.getCurIndex();
                    $scope['delete']({photo: $scope.current}).then(function() {
                        if (index < $scope.photos.length) {
                            $scope.current = $scope.photos[index];
                        }
                        else if ($scope.hasPrevious()) {
                            $scope.current = $scope.photos[index - 1];
                        }
                        else {
                            $scope.close();
                        }
                    });
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
            // Update dimensions when:
            // 1. viewport dimensions changed.
            var updateDimensions = function(newValue, oldValue) {
                if (newValue !== oldValue && $scope.current !== null) {
                    $scope.$broadcast('resize');
                }
            };
            wdViewport.on('resize', updateDimensions);

            var open = function() {
                element.addClass('slides-active');
                $scope.$broadcast('open');
                wdKey.setScope('photos:preview');
            };
            var close = function() {
                wdKey.setScope('photos');
                $scope.$broadcast('close');
                $scope.close();
                element.removeClass('slides-active');
            };

            // Watch 'current' to toggle open/close.
            $scope.$watch('current', function(newPhoto) {
                if (newPhoto !== null) {
                    open();
                }
                else {
                    close();
                }
            });

            // close slides when user click directly on the container
            element
                .on('click', function(e) {
                    if (e.target === this) {
                        $scope.$apply(close);
                    }
                })
                .on('click', '.frame', function(e) {
                    if (e.target === this) {
                        $scope.$apply(close);
                    }
                });

            // Shortcuts
            wdKey.$apply('left, up, j, h', 'photos:preview', function() {
                if ($scope.hasPrevious()) {
                    $scope.previous();
                }
                return false;
            });
            wdKey.$apply('right, down, k, l', 'photos:preview', function() {
                if ($scope.hasNext()) {
                    $scope.next();
                }
                return false;
            });
            wdKey.$apply('esc', 'photos:preview', function() {
                close();
                return false;
            });
            $scope.$on('$destroy', function() {
                wdKey.setScope('photos');
                wdKey.deleteScope('photos:preview');
            });
        }
    };
}];
});
