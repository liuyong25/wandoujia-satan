define([
        'text!templates/photos/slides.html',
        'underscore'
    ], function(
        template,
        _
    ) {
'use strict';
return ['WDP_PLAYING_INTERVAL', '$rootScope', 'wdViewport', 'wdKey', '$q', 'GA',
    function(WDP_PLAYING_INTERVAL, $rootScope, wdViewport, wdKey, $q, GA) {
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
                        GA('photos:slide:pause');
                    }
                    else {
                        $scope.play();
                        GA('photos:slide:play');
                    }
                };
                $scope.togglePlayKeyboard = function() {
                    if ($scope.playing) {
                        $scope.pause();
                        GA('photos:slide:pause_key');
                    }
                    else {
                        $scope.play();
                        GA('photos:slide:play_key');
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

            var timeStart = null;
            var open = function() {
                element.addClass('slides-active');
                $scope.$broadcast('open');
                timeStart = (new Date()).getTime();
            };
            var close = function() {
                // wdKey.setScope('photos');
                $scope.$broadcast('close');
                $scope.close();
                element.removeClass('slides-active');
                GA('photos:slide:stay:' + ((new Date()).getTime() - timeStart));
            };

            // Watch 'current' to toggle open/close.
            var keyboardScope = null;
            $scope.$watch('current', function(newPhoto, oldPhoto) {
                if (newPhoto === oldPhoto) {
                    return;
                }
                if (newPhoto !== null) {
                    if (keyboardScope === null) {
                        keyboardScope = $q.defer();
                        wdKey.push('photos:preview', keyboardScope.promise);
                    }
                    open();
                }
                else {
                    close();
                    keyboardScope.resolve();
                    keyboardScope = null;
                }
            });

            // close slides when user click directly on the container
            element
                .on('click', function(e) {
                    if (e.target === this) {
                        $scope.$apply(close);
                        GA('photos:slide:empty');
                    }
                })
                .on('click', '.frame', function(e) {
                    if (e.target === this) {
                        $scope.$apply(close);
                        GA('photos:slide:empty');
                    }
                });

            // Shortcuts
            wdKey.$apply('left, up, k, h', 'photos:preview', function() {
                if ($scope.hasPrevious()) {
                    $scope.previous();
                    GA('photos:slide:previous_key');
                }
                return false;
            });
            wdKey.$apply('right, down, j, l', 'photos:preview', function() {
                if ($scope.hasNext()) {
                    $scope.next();
                    GA('photos:slide:next_key');
                }
                return false;
            });
            wdKey.$apply('space', 'photos:preview', function() {
                $scope.togglePlayKeyboard();
            });
            wdKey.$apply('r', 'photos:preview', function() {
                $scope.rotate();
                GA('photos:slide:rotate_key');
            });
            wdKey.$apply('d', 'photos:preview', function() {
                $scope.remove();
                GA('photos:slide:delete_key');
            });
            wdKey.$apply('s', 'photos:preview', function() {
                $scope.download({photo: $scope.current});
                GA('photos:slide:download_key');
            });
            wdKey.$apply('esc', 'photos:preview', function() {
                close();
                GA('photos:slide:close_key');
                return false;
            });
            // $scope.$on('$destroy', function() {
            //     wdKey.setScope('photos');
            //     wdKey.deleteScope('photos:preview');
            // });
        }
    };
}];
});
