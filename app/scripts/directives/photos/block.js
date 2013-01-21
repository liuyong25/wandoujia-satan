define([
        'vendor/scroll-monitor'
    ], function(
        scrollMonitor
    ) {
'use strict';
return ['WDP_LOAD_IMAGE_DELAY', 'WDP_PRELOAD_IMAGE_OFFSET',
    function(WDP_LOAD_IMAGE_DELAY, WDP_PRELOAD_IMAGE_OFFSET) {
    return {
        require: '^wdpShowcase',
        link: function($scope, element, attrs, showcaseController) {
            $scope.selected = $scope.$eval(attrs.selected);
            $scope.$watch(attrs.selected, function(newValue) {
                $scope.selected = newValue;
            });
            var index = function() {
                return $scope.$eval(attrs.index);
            };
            $scope.blockPosition = function() {
                return showcaseController.createBlockPosition(index());
            };
            $scope.photoPosition = function() {
                return showcaseController.createImagePosition(index());
            };
            $scope.photoDimensions = function() {
                return showcaseController.createPhotoDimensions(index());
            };

            setTimeout(function() {
                var scrollWatcher = scrollMonitor.create(element, WDP_PRELOAD_IMAGE_OFFSET);
                var parent = element.parent();
                var timer = null;
                scrollWatcher.enterViewport(function() {
                    element.appendTo(parent);
                    var $image = element.find('img');
                    if (!$image.attr('src') && timer === null) {
                        timer = setTimeout(function() {
                            $image.attr('src', $image.attr('data-src'));
                        }, WDP_LOAD_IMAGE_DELAY);
                    }
                });
                scrollWatcher.exitViewport(function() {
                    element.detach();
                    clearTimeout(timer);
                    timer = null;
                });
                $scope.$on('$destroy', function() {
                    scrollWatcher.destroy();
                    scrollWatcher = null;
                });
            }, 0);
        }
    };
}];
});
