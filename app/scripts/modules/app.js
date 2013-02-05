define([
        'angular',
        'modules/auth',
        'modules/photos',
        'text!templates/auth/portal.html',
        'text!templates/photos/gallery.html',
        'modules/common'
    ], function(
        angular,
        auth,
        photos,
        PortalTemplate,
        PhotosTemplate,
        common
    ) {
'use strict';

var activeRequest = 0;
function pushActiveRequest($scope) {
    activeRequest += 1;
    if (activeRequest === 1) {
        $scope.$broadcast('ajaxStart');
    }
}
function popActiveRequest($scope) {
    activeRequest -= 1;
    if (activeRequest === 0) {
        $scope.$broadcast('ajaxStop');
    }
}

angular.module('wdApp', ['wdCommon', 'wdAuth', 'wdPhotos'])
    .config(['$routeProvider', '$httpProvider', 'wdHttpProvider', 'wdDevProvider', 'wdAuthFilterProvider',
        function($routeProvider, $httpProvider, wdHttpProvider, wdDevProvider, wdAuthFilterProvider) {

        // Routers configurations.
        $routeProvider.when('/portal', {
            template: PortalTemplate,
            controller: 'portalController'
        });
        $routeProvider.when('/', {
            redirectTo: '/photos'
        });
        $routeProvider.when('/photos', {
            template: PhotosTemplate,
            controller: 'galleryController',
            resolve: {
                // delay: wdAuthFilterProvider.needAuth
            }
        });
        $routeProvider.otherwise({
            redirectTo: '/portal'
        });

        // Prevent CORS error for accept-headers...
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Count active requests amount, then fire 'ajaxStart' or 'ajaxStop' events like jQuery.ajax
        wdHttpProvider.requestInterceptors.push(['$rootScope', function($rootScope) {
            pushActiveRequest($rootScope);
        }]);
        $httpProvider.responseInterceptors.push(['$q', '$rootScope', function($q, $rootScope) {
            return function(promise) {
                return promise.then(function(response) {
                    popActiveRequest($rootScope);
                    return response;
                }, function(response) {
                    popActiveRequest($rootScope);
                    return $q.reject(response);
                });
            };
        }]);

        // Log and global exception handling.
        $httpProvider.responseInterceptors.push(['$rootScope', '$q', '$log', '$location', function($rootScope, $q, $log, $location) {
            function success(response) {
                $log.log(response.config.url, response.status);
                return response;
            }
            function error(response) {
                $log.warn(response.config.url, response.status);
                // If auth error, always redirect to '/portal'.
                if (response.status === 401) {
                    $location.url('/portal');
                }
                return $q.reject(response);
            }

            return function(promise) {
                return promise.then(success, error);
            };
        }]);

        wdHttpProvider.requestInterceptors.push(['config', function(config) {
            // Using realtime data source url.
            if (config.url) {
                config.url = wdDevProvider.wrapURL(config.url);
            }
            // By default, all request using withCredentials to support cookies in CORS.
            if (angular.isUndefined(config.withCredentials)) {
                config.withCredentials = true;
            }
        }]);
    }])
    .run(['$window', '$rootScope', 'wdKeeper', function($window, $rootScope, wdKeeper) {
        // Tip users when leaving.
        $window.onbeforeunload = function (e) {
          e = e || window.event;
          // var ret = activeRequest === 0 ? null : leavingTip;
          var ret = wdKeeper.getTip();

          // For IE<8 and Firefox prior to version 4
          if (e) {
            e.returnValue = ret;
          }

          // For Chrome, Safari, IE8+ and Opera 12+
          return ret;
        };

        $rootScope.$on('ajaxStart', function() {});
        $rootScope.$on('ajaxStop',  function() {});
    }]);
});
