define([], function() {
'use strict';

return [function() {
    return {
        restrict: 'CA',
        link: function($scope, element) {
            $scope.$on('wdp:showcase:layout', function(e, layout) {
                element.height(layout.height);
            });
        }
    };
}];


});
