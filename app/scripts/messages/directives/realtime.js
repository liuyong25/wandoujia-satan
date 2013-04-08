define([
    'moment'
], function(
    moment
) {
'use strict';
return ['$timeout', '$filter', function($timeout, $filter) {
return {

link: function(scope, element, attributes) {

    var date;
    var timer;

    function update() {
        var startOfToday = moment().startOf('day');
        var now = moment();
        var anHourAgo = now.subtract('minutes', 60);
        var text;

        if (date.isAfter(startOfToday)) {
            text = date.fromNow();
        }
        else {
            text = date.format(attributes.format);
        }

        element.text(text);

        if (date.isAfter(anHourAgo)) {
            timer = setTimeout(update, 60000 - date.valueOf() % 60000);
        }
    }

    scope.$watch(attributes.wdmRealtime, function(newDate) {
        clearTimeout(timer);
        date = moment(newDate);
        update();
    });

    scope.$on('$destroy', function() {
        clearTimeout(timer);
    });

}

};
}];
});
