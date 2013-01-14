define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return ['$window', function($window) {
    var queries = $window.location.search.slice(1).split('&');
    var params = {};
    _.each(queries, function(query) {
        query = query.split('=');
        params[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
    });
    return {
        getServer: function() {
            return '//' + params['server'] || '';
        }
    };
}];
});
