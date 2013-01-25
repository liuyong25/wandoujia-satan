define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return function() {
    var ip = '';
    var port = '';

    function encodeServer(server) {
        return server.replace(':', '\\:');
    }

    var self = this;
    self.getServer = function() {
        return ip ? ('//' + ip + ':' + (port || 80)) : '';
    };
    self.setServer = function(newIP, newPort) {
        ip = newIP;
        port = newPort;
    };
    self.getAPIPrefix = function() {
        return '/api/v1';
    };
    self.wrapURL = function(url, forResource) {
        var server = self.getServer();
        if (forResource) {
            server = encodeServer(server);
        }
        var prefix = self.getAPIPrefix();
        return server + prefix + url;
    };

    self.$get = ['$window', function($window) {
        return {
            wrapURL: self.wrapURL,
            setServer: self.setServer,
            query: function(key) {
                var queries = $window.location.search.slice(1).split('&');
                var params = {};
                _.each(queries, function(query) {
                    query = query.split('=');
                    params[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
                });
                return key ? params[key] : params;
            }
        };
    }];
};
});
