define([], function() {
'use strict';
return [function() {
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
        }
    };
}];
});
