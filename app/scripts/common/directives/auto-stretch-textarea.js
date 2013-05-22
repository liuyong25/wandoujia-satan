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

    $element.css('overflow-x', 'hidden');

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
        var cache = $element[0].value;
        $element[0].value = '';
        var clearWidth = $element[0].scrollWidth;
console.log(111, '   ', clearWidth);
        $element[0].value = cache;

console.log(222, '   ', $element[0].scrollWidth)
        // while ($element[0].scrollWidth < clearWidth) {
        //     rowCount += 1;
        //     if (rowCount > 4) { break; }
        //     $element.attr('rows', rowCount);
        // }
    }
}


};
}];
});
