define([
        'angular'
    ], function(
        angular
    ) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthFilter', function() {
        var self = this;
        self.needAuth = ['$q', 'wdAuthToken', function($q, wdAuthToken) {
            var deferred = $q.defer();
            if (wdAuthToken.valid()) {
                deferred.resolve('ok');
            }
            else {
                deferred.reject('wd_auth_failed');
            }
            return deferred.promise;
        }];
        self.$get = [function() {
            return {
            };
        }];
    })
    .factory('wdAuthToken', ['$window', '$location', 'wdDev', function($window, $location, wdDev) {
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
                    $location.path('/portal');
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
    }])
    .controller('portalController', ['$scope', '$location', 'wdHttp', 'wdDev', '$route', '$timeout', 'wdAuthToken',
        function($scope, $location, wdHttp, wdDev, $route, $timeout, wdAuthToken) {

        $scope.authCode = wdDev.query('ac') || wdAuthToken.getToken() || '';
        $scope.buttonText = '连接手机';
        $scope.errorText = '';
        $scope.state = 'standby';
        $scope.submit = function() {
            if (!$scope.authCode) {
                return;
            }
            var ip = wdAuthToken.parse($scope.authCode);
            var port = 10208;

            if (ip) {
                $scope.state = 'loading';
                wdDev.setServer(ip, port);
                wdHttp({
                    method: 'get',
                    url: '/directive/auth',
                    params: {
                        authcode: $scope.authCode,
                        'client_name': 'Chrome',
                        'client_type': 3
                    }
                })
                .success(function() {
                    $scope.state = 'standby';
                    $scope.buttonText = '验证成功';
                    // TODO: Maybe expiration?
                    wdAuthToken.setToken($scope.authCode);
                    $location.url($route.current.params.ref || '/');
                })
                .error(function() {
                    $scope.state = 'standby';
                    $scope.buttonText = '验证失败';
                    $scope.errorText = '请检查验证码或确保电脑和手机在同一 Wi-Fi 网络中';
                    $timeout(function() {
                        $scope.errorText = '';
                    }, 5000);
                    wdAuthToken.clearToken();
                });
            }
            else {
                $scope.errorText = '请检查验证码或确保电脑和手机在同一 Wi-Fi 网络中';
                $timeout(function() {
                    $scope.errorText = '';
                }, 5000);
            }
        };

        if ($scope.authCode) {
            $timeout($scope.submit, 0);
        }
    }])
    .run(['$rootScope', '$location', function($rootScope, $location) {
        $rootScope.$on('$routeChangeStart', function() {
            console.log('start', arguments);
        });
        $rootScope.$on('$routeChangeSuccess', function() {
            console.log('success', arguments);
        });
        $rootScope.$on('$routeChangeError', function() {
            console.log('error', arguments, $location.url());
            $location.url('/portal?ref=' + encodeURIComponent($location.url()));
        });
    }]);

});
