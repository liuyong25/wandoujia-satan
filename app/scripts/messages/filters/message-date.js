define([
    'moment'
], function(
    moment
) {
'use strict';
return ['$filter', function($filter) {
    return function(input, format) {
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
