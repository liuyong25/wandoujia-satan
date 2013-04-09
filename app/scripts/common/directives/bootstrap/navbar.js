define([
        'text!templates/bootstrap/navbar.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        restrict: 'EAC',
        replace: true,
        transclude: true,
        template: template,
        controller: ['$scope', 'wdAuthToken', '$route', 'wdpMessagePusher', function($scope, wdAuthToken, $route, wdpMessagePusher) {
            $scope.messageNotification = false;

            $scope.signout = function() {
                wdAuthToken.signout();
            };

            $scope.$on('$routeChangeSuccess', function(e, current) {
                if (current.locals.nav == null) { return; }

                $scope.currentModule = current.locals.nav;
                localStorage.setItem('lastModule', $scope.currentModule);

                if ($scope.currentModule === 'messages') {
                    $scope.messageNotification = false;
                }
            });

            wdpMessagePusher.channel('messages_add.wdNavbar', function(e) {
                if ($scope.currentModule !== 'messages') {
                    $scope.messageNotification = true;
                    $scope.$apply();
                }
            });
        }]
    };
}];
});
