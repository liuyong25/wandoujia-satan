define([], function() {
'use strict';
return function() {
    // var queries = $window.location.search.slice(1).split('&');
    // var params = {};
    // _.each(queries, function(query) {
    //     query = query.split('=');
    //     params[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
    // });

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
    self.parseAuthCode = function (input) {
        var type = parseInt(input.slice(0, 1), 10);
        var encryptedIp = parseInt(input.slice(3, input.length), 10);
        var ip;
        switch (type) {
        case 2:
            ip = '192.168.' + [
                Math.floor(encryptedIp / 256),
                encryptedIp % 256
            ].join('.');
            break;
        case 3:
            ip = '172.' + [
                Math.floor(encryptedIp / Math.pow(256, 2)),
                Math.floor((encryptedIp % Math.pow(256, 2)) / 256),
                encryptedIp % 256
            ].join('.');
            break;
        case 4:
            ip = [
                Math.floor(encryptedIp / Math.pow(256, 3)),
                Math.floor((encryptedIp % Math.pow(256, 3)) / Math.pow(256, 2)),
                Math.floor((encryptedIp % Math.pow(256, 2)) / 256),
                encryptedIp % 256
            ].join('.');
            break;
        }

        return ip;
    };
    self.wrapURL = function(url, forResource) {
        var server = self.getServer();
        if (forResource) {
            server = encodeServer(server);
        }
        var prefix = self.getAPIPrefix();
        return server + prefix + url;
    };

    self.$get = [function() {
        return {
            wrapURL: self.wrapURL
        };
    }];
};
});
