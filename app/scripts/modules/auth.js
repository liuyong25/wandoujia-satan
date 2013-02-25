define([
        'angular',
        'jquery',
        'services/auth/token'
    ], function(
        angular,
        jQuery,
        authToken
    ) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthToken', authToken)
    .controller('portalController', ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdAuthToken', 'wdKeeper', 'GA', 'wdAlert',
        function($scope, $location, $http, wdDev, $route, $timeout, wdAuthToken, wdKeeper, GA, wdAlert) {

        $scope.isSafari = jQuery.browser.safari;
        $scope.authCode = wdDev.query('ac') || wdAuthToken.getToken() || '';
        $scope.autoAuth = !!$scope.authCode;
        $scope.buttonText = '连接手机';
        $scope.errorText = '';
        $scope.state = 'standby';
        $scope.showHelp = false;
        $scope.safariHelp = function() {
            wdAlert.alert('更改您的 Safari 设置', '连接手机失败，请前往设置/隐私中，将「阻止 cookie」一项设为「永不」。');
        };
        $scope.userInput = function() {
            if ($scope.state !== 'standby') {
                return;
            }
            $scope.buttonText = '连接手机';
        };
        $scope.submit = function() {
            if (!$scope.authCode) {
                GA('login:enter_authcode:empty');
                return;
            }
            if ($scope.autoAuth) {
                GA('login:auto');
            }
            // Parse data source.
            var ip = wdAuthToken.parse($scope.authCode);
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
                keeper = wdKeeper.push('仍在发送验证码');
                var timeStart = (new Date()).getTime();
                $http({
                    method: 'get',
                    url: '/directive/auth',
                    timeout: 5000,
                    params: {
                        authcode: $scope.authCode,
                        'client_time': (new Date()).getTime(),
                        'client_name': 'Browser',
                        'client_type': 3
                    },
                    disableErrorControl: !$scope.autoAuth
                })
                .success(function() {
                    keeper.done();
                    $scope.state = 'standby';
                    $scope.buttonText = '验证成功';
                    // TODO: Maybe expiration?
                    wdAuthToken.setToken($scope.authCode);
                    $location.url($route.current.params.ref || '/');
                    GA('login:success');
                    GA('perf:auth_duration:success:' + ((new Date()).getTime() - timeStart));
                })
                .error(function() {
                    keeper.done();
                    $scope.state = 'standby';
                    $scope.buttonText = '验证失败';
                    $scope.errorText = '请检查验证码或确保电脑和手机在同一 Wi-Fi 网络中';
                    $timeout(function() {
                        $scope.buttonText = '连接手机';
                        $scope.errorText = '';
                    }, 5000);
                    wdAuthToken.clearToken();
                    if ($scope.autoAuth) {
                        $route.reload();
                    }
                    GA('login:fail');
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
                $scope.errorText = '请检查验证码或确保电脑和手机在同一 Wi-Fi 网络中';
                $timeout(function() {
                    $scope.errorText = '';
                }, 5000);
            }
        };

        if ($scope.authCode) {
            $timeout($scope.submit, 0);
        }
    }]);

});
