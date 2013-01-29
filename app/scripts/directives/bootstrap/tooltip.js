define([], function() {
'use strict';
return [function() {
    return {
        restrict: 'EAC',
        link: function($scope, element, attrs) {
            element.tooltip($scope.$eval(attrs.options));
            $scope.$on('$destroy', function() {
                element.tooltip('destroy');
            });
        }
    };
}];
});
