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
            element.tooltip(_.extend({
                container: 'body',
                title: function() {
                    return attributes.bsTooltip;
                },
                delay: { show: 200, hide: 0 }
            }, $scope.$eval(attributes.options)));

            attributes.$observe('disabled', function(value) {
                if (value) {
                    element.tooltip('hide');
                }
            });

            element.on('$destroy', function() {
                var tooltip = element.data('tooltip');
                if (tooltip && tooltip.$tip) {
                    tooltip.hide();
                }
                element.off('.' + tooltip.type).removeData(tooltip.type);
            });
        }
    };
}];
});
