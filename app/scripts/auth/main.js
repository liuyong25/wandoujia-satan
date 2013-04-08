/*global Modernizr*/
define([
    'angular',
    'auth/services/token'
], function(
    angular,
    authToken
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthToken', authToken)
    .controller('portalController', ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdAuthToken', 'wdKeeper', 'GA', 'wdAlert', 'wdBrowser',
        function($scope, $location, $http, wdDev, $route, $timeout, wdAuthToken, wdKeeper, GA, wdAlert, wdBrowser) {

        $scope.isSupport = Modernizr.cors && Modernizr.websockets;
        $scope.isSafari = wdBrowser.safari;
        $scope.authCode = wdDev.query('ac') || wdAuthToken.getToken() || '';
        $scope.autoAuth = !!$scope.authCode;
        $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
        $scope.error = '';
        $scope.state = 'standby';
        $scope.showHelp = false;

        var acFromQuery = !!wdDev.query('ac');
        var acFromInput = false;
        var acFromCache = !!wdAuthToken.getToken();

        if (!$scope.isSupport) {
            GA('login:not_support');
        }

        $scope.openHelp = function() {
            $scope.showHelp = true;
        };
        $scope.safariHelp = function() {
            wdAlert.alert($scope.$root.DICT.portal.SAFARI_TITLE, $scope.$root.DICT.portal.SAFARI_CONTENT);
        };
        $scope.userInput = function() {
            if ($scope.state !== 'standby') {
                return;
            }
            $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
        };
        $scope.submit = function(authCode) {
            if (!authCode) {
                GA('login:enter_authcode:empty');
                return;
            }
            if ($scope.autoAuth) {
                GA('login:auto');
            }
            else {
                acFromInput = true;
            }
            // Parse data source.
            var ip = wdAuthToken.parse(authCode);
            var port = 10208;

            var keeper = null;

            // Valid auth code.
            if (ip) {
                if ($scope.autoAuth) {
                    GA('login:auto_authcode:valid');
                }
                else {
                    GA('login:enter_authcode:valid');
                }
                // Send auth request.
                $scope.state = 'loading';
                wdDev.setServer(ip, port);
                keeper = wdKeeper.push($scope.$root.DICT.portal.KEEPER);
                var timeStart = (new Date()).getTime();
                $http({
                    method: 'get',
                    url: '/directive/auth',
                    timeout: 5000,
                    params: {
                        authcode: authCode,
                        'client_time': (new Date()).getTime(),
                        'client_name': 'Browser',
                        'client_type': 3
                    },
                    disableErrorControl: !$scope.autoAuth
                })
                .success(function(response) {
                    keeper.done();
                    $scope.state = 'standby';
                    $scope.buttonText = $scope.$root.DICT.portal.AUTH_SUCCESS;
                    // TODO: Maybe expiration?
                    wdAuthToken.setToken(authCode);
                    wdAuthToken.startSignoutDetection();
                    wdDev.setMetaData(response);
                    $location.url($route.current.params.ref || '/');
                    if (acFromInput) {
                        GA('login:success:user_input');
                    }
                    if (acFromQuery) {
                        GA('login:success:query');
                    }
                    else if (acFromCache) {
                        GA('login:success:cache');
                    }
                    GA('perf:auth_duration:success:' + ((new Date()).getTime() - timeStart));
                })
                .error(function() {
                    keeper.done();
                    $scope.state = 'standby';
                    $scope.buttonText = $scope.$root.DICT.portal.AUTH_FAILED;
                    $scope.error = true;
                    $timeout(function() {
                        $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
                        $scope.error = false;
                    }, 5000);
                    wdAuthToken.clearToken();
                    if ($scope.autoAuth) {
                        $route.reload();
                    }
                    if (acFromInput) {
                        GA('login:fail:user_input');
                    }
                    else if (acFromQuery) {
                        GA('login:fail:query');
                    }
                    if (acFromCache) {
                        GA('login:fail:cache');
                    }
                    GA('perf:auth_duration:fail:' + ((new Date()).getTime() - timeStart));
                });
            }
            // Invalid auth code.
            else {
                if ($scope.autoAuth) {
                    GA('login:auto_authcode:invalid');
                }
                else {
                    GA('login:enter_authcode:invalid');
                }
                $scope.error = true;
                $timeout(function() {
                    $scope.error = false;
                }, 5000);
            }
        };

        if ($location.search().help === 'getstarted') {
            $scope.autoAuth = false;
            $timeout(function() {
                $scope.showHelp = true;
            }, 0);
        }
        else if ($scope.authCode) {
            $timeout(function() {
                $scope.submit($scope.authCode);
            }, 0);
        }
    }]);

});
