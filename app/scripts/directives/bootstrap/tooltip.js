define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return [function() {
    return {
        restrict: 'EAC',
        link: function($scope, element, attributes) {
            attributes.$observe('bsTooltip', function(value) {
                var options = _.extend({
                    // container: 'body',
                    title: value,
                    delay: { show: 200, hide: 0 }
                }, $scope.$eval(attributes.options));
                element
                    .tooltip('destroy')
                    .tooltip(options);
            });
            $scope.$on('$destroy', function() {
                element.tooltip('destroy');
            });
        }
    };
}];
});
