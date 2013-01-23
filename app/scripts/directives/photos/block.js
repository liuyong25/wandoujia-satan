define([
        'angular'
    ], function(
        angular
    ) {
'use strict';
return ['$rootScope', '$window', 'WDP_LOAD_IMAGE_DELAY', 'WDP_PRELOAD_IMAGE_OFFSET',
    function($rootScope, $window, WDP_LOAD_IMAGE_DELAY, WDP_PRELOAD_IMAGE_OFFSET) {
    return {
        link: function($scope, element, attrs) {
            var scrollTop = $rootScope.viewport.scrollTop;
            $scope.selected = $scope.$eval(attrs.selected);
            $scope.$watch(attrs.selected, function(newValue) {
                $scope.selected = newValue;
            });

            function shouldShow() {
                var top = $scope.layout[$scope.$index].y + $scope.offsetTop;
                var bottom = top + 180;
                return (top < scrollTop + $rootScope.viewport.height - 85 + WDP_PRELOAD_IMAGE_OFFSET) && (bottom > scrollTop + 15 - WDP_PRELOAD_IMAGE_OFFSET);
            }
            function renderImage() {
                var $img = element.find('.photo img');
                var path =$scope.photo.thumbnail_path;
                if ($img.data('src') !== path) {
                    $img.data('src', path);
                    var image = new Image();
                    image.onload = function() {
                        image.onload = null;
                        var hasSrc = !!$img.attr('src');
                        $img.attr('src', path);
                        if (!hasSrc) {
                            $img.fadeIn();
                        }
                    };
                    image.src = path;
                }
            }
            function toggleBlock() {
                if (shouldShow()) {
                    // element.show();
                    renderImage();
                }
                else {
                    // element.hide();
                }
            }

            var positionChanged = false;
            function detectVisibility() {
                positionChanged = true;
                $scope.$evalAsync(function() {
                    if (!positionChanged) {
                        return;
                    }
                    positionChanged = false;
                    toggleBlock();
                });
            }

            $scope.$watch('layout[$index]', function(layout) {
                element
                    .css({
                        left: layout.x + 40,
                        top:  layout.y
                    })
                    .children('.photo')
                        .css({
                            width: layout.width,
                            height: layout.height
                        })
                        .children('img')
                            .css({
                                left: layout.innerX,
                                top: layout.innerY
                            });
                detectVisibility();
            }, true);

            $rootScope.$watch('viewport.height + " " + viewport.scrollTop', function() {
                detectVisibility();
            }, true);

            $scope.$watch('photo.thumbnail_path', function() {
                if (shouldShow()) {
                    renderImage();
                }
            });

            $scope.$on('scroll', function(e, top) {
                scrollTop = top;
                toggleBlock();
            });

            if ($scope.photo.deferred) {
                var progressBar = angular.element('<div style="position:absolute;bottom:0;left:0;background:rgba(255,255,255,0.7);width:100%;height:100%;"></div>');
                progressBar.appendTo(element.find('.photo'));
                $scope.photo.deferred.progress(function(percent) {
                    progressBar.css('height', (100 - percent) + '%');
                });
            }
        }
    };
}];
});
