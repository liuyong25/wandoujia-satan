define([], function() {
'use strict';
return ['$log', function($log) {
    return function(params) {
        params = params.split(':');
        if (params.length >= 4) {
            params[3] = parseInt(params[3], 10);
        }
        $log.log('GA:', ['_trackEvent'].concat(params));
        _gaq.push(['_trackEvent'].concat(params));
    };
}];
});
