define([
        'angular'
    ], function(
        angular
    ) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .controller('portalController', ['$scope', '$location', '$http', 'wdDev', function($scope, $location, $http, wdDev) {
        $scope.authCode = '';
        $scope.submit = function() {
            var ip = wdDev.parseAuthCode($scope.authCode);
            var port = 10208;
            wdDev.setServer(ip, port);
            $http({
                method: 'get',
                url: wdDev.getServer() + wdDev.getAPIPrefix() + '/directive/auth',
                params: {
                    authcode: $scope.authCode,
                    'client_name': 'Chrome',
                    'client_type': 3
                }
            }).then(function() {
                $location.path('/photos');
            }, function() {
                console.log('error');
            });
        };
    }]);

});
