define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return ['$window', function($window) {
    // var queries = $window.location.search.slice(1).split('&');
    // var params = {};
    // _.each(queries, function(query) {
    //     query = query.split('=');
    //     params[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
    // });

    var ip = '';
    var port = '';

    var parseAuthCode = function (input) {
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
    return {
        getServer: function() {
            return ip ? ('//' + ip + ':' + (port || 80)) : '';
        },
        setServer: function(newIP, newPort) {
            ip = newIP;
            port = newPort;
        },
        getAPIPrefix: function() {
            return '/api/v1';
        },
        parseAuthCode: parseAuthCode
    };
}];
});
