define([
        'angular'
    ], function(
        angular
    ) {
'use strict';
return ['$rootScope', '$window', 'WDP_LOAD_IMAGE_DELAY', 'WDP_PRELOAD_IMAGE_OFFSET', 'wdViewport',
    function($rootScope, $window, WDP_LOAD_IMAGE_DELAY, WDP_PRELOAD_IMAGE_OFFSET, wdViewport) {
    return {
        link: function($scope, element, attrs) {
            $scope.selected = $scope.$eval(attrs.selected);
            $scope.$watch(attrs.selected, function(newValue) {
                $scope.selected = newValue;
            });

            function shouldShow() {
                var top = $scope.layout[$scope.$index].y + $scope.offsetTop;
                var bottom = top + 180;
                return (top < wdViewport.top() + wdViewport.height() - 85 + WDP_PRELOAD_IMAGE_OFFSET) && (bottom > wdViewport.top() + 15 - WDP_PRELOAD_IMAGE_OFFSET);
            }
            function renderImage() {
                var $img = element.find('.photo img');
                var path = $scope.photo.thumbnail_path;
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
setTimeout(function() {
                    element.show();
                    renderImage();
}, 0);
                }
                else {
setTimeout(function() {
                    element.hide();
}, 0);
                }
            }

            function relayout() {
                var layout = $scope.layout[$scope.$index];
                element
                    .css({
                        left: layout.x,
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
            }

            $scope.$watch('photo.thumbnail_path', function() {
                toggleBlock();
            });

            $scope.$on('layout', function() {
                relayout();
                toggleBlock();
            });

            // TODO: This way is better than wdViewport.on('scroll'), weird...
            $scope.$on('scroll', function() {
                toggleBlock();
            });

            if ($scope.photo.deferred) {
                var progressBar = angular.element('<div style="position:absolute;bottom:0;left:0;background:rgba(255,255,255,0.7);width:100%;height:100%;"></div>');
                progressBar.appendTo(element.find('.photo'));
                $scope.photo.deferred.progress(function(percent) {
                    progressBar.css('height', (100 - percent) + '%');
                });
                $scope.photo.deferred.done(function() {
                    var tip = angular.element('<div style="z-index:101;position:absolute;left:0;right:0;bottom:0;text-align:center;padding: 3px 0;font-size:12px;color:#fff;background:rgba(109, 184, 0, 0.7);"><span style="display:inline-block;"><i class="icon-ok icon-white" style="vertical-align:top;margin:3px 0;"></i> 上传成功</span></div>');
                    tip
                        .appendTo(element.find('.photo'))
                        .fadeIn().delay(2000).fadeOut();
                    tip.promise().then(function() {
                        tip.remove();
                    });
                }).fail(function() {
                    var tip = angular.element('<div style="z-index:101;position:absolute;left:0;right:0;bottom:0;text-align:center;padding: 3px 0;font-size:12px;color:#fff;background:rgba(181, 61, 1, 0.7);"><span style="display:inline-block;"><i class="icon-remove icon-white" style="vertical-align:top;margin:3px 0;"></i> 上传失败</span></div>');
                    tip
                        .appendTo(element.find('.photo'))
                        .fadeIn().delay(2000);
                    tip.promise().then(function() {
                        tip.remove();
                        $scope.$apply('removeFailed(photo)');
                    });
                });
            }
        }
    };
}];
});
