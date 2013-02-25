define([], function() {
'use strict';
return function() {
    var self = this;
    self.$get = ['$window', '$location', 'wdDev',
        function($window, $location, wdDev) {
        var valid = false;
        return {
            valid: function() {
                return valid;
            },
            getToken: function() {
                return $window.localStorage.getItem('token');
            },
            setToken: function(newToken) {
                $window.localStorage.setItem('token', newToken);
                valid = true;
            },
            clearToken: function() {
                $window.localStorage.removeItem('token');
                valid = false;
            },
            signout: function() {
                this.clearToken();
                if (wdDev.query('ac')) {
                    $window.location = $window.location.pathname + '#/portal';
                }
                else {
                    $location.url('/portal');
                }
            },
            parse: function (input) {
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
            }
        };
    }];
};
});
