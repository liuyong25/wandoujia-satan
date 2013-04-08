define([
    'moment'
], function(
    moment
) {
'use strict';
return [function() {
    return function(input, format) {
        input = parseInt(input, 10);
        var startOfYesterday = moment().startOf('day').subtract('days', 1);
        var date = moment(input);
        if (date.isAfter(startOfYesterday)) {
            return date.fromNow();
        }
        else {
            return date.format(format);
        }
    };
}];
});
