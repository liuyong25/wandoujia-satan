define([
    'underscore',
    'angular'
], function(
    _,
    angular
) {
'use strict';
return [function() {
return {

link: function($scope, $element, $attributes) {

    var watchExp = $attributes.wdAutoStretchTextarea || $attributes.ngModel;
    var debouncedStretchHeight = _.debounce(stretchHeight, 300);

    if (watchExp) {
        $scope.$watch(watchExp, function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            if (!newValue) {
                $element.attr('rows', 1);
            }
            debouncedStretchHeight();
        });
    }

    $element.on('keyup keydown keypress change', debouncedStretchHeight);

    function stretchHeight() {
        if ($element.is(':hidden')) { return; }
        var el = $element[0];
        var rowCount = 1;
        $element.attr('rows', 1);

        while ($element[0].scrollWidth < $element.innerWidth()) {
            rowCount += 1;
            if (rowCount > 4) { break; }
            $element.attr('rows', rowCount);
        }
    }
}


};
}];
});
