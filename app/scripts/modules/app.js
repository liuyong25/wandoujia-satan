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

angular.module('wdApp', ['wdCommon', 'wdAuth', 'wdPhotos'])
    .config([   '$routeProvider', '$httpProvider', 'wdHttpProvider',
        function($routeProvider,   $httpProvider,   wdHttpProvider) {
        // Prevent CORS error for accept-headers...
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        // Used for filter route changing which need auth.
        var validateToken = ['$q', 'wdAuthToken', '$rootScope', '$location',
            function($q, wdAuthToken, $rootScope, $location) {
            if (wdAuthToken.valid()) {
                return true;
            }
            else {
                // Auth invalid, jump to portal
                $location.url('/portal?ref=' + encodeURIComponent($location.url()));
                return $q.reject('Authentication failed.');
            }
        }];

        // Routers configurations.
        $routeProvider.when('/portal', {
            template: PortalTemplate,
            controller: 'portalController'
        });
        $routeProvider.when('/signout', {
            resolve: {
                signout: ['wdAuthToken', '$q', function(wdAuthToken, $q) {
                    wdAuthToken.signout();
                    return $q.reject('signout');
                }]
            }
        });
        $routeProvider.when('/', {
            redirectTo: '/photos'
        });
        $routeProvider.when('/photos', {
            template: PhotosTemplate,
            controller: 'galleryController',
            resolve: {
                auth: validateToken
            }
        });
        $routeProvider.otherwise({
            redirectTo: '/portal'
        });

        // Count active requests amount, then fire 'ajaxStart' or 'ajaxStop' events like jQuery.ajax
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
        wdHttpProvider.requestInterceptors.push([
                    '$rootScope',
            function($rootScope) {
            return function() {
                pushActiveRequest($rootScope);
            };
        }]);
        $httpProvider.responseInterceptors.push([
                    '$q', '$rootScope', '$log',
            function($q,   $rootScope,   $log) {
            return function(promise) {
                return promise.then(function success(response) {
                    $log.log(response.config.url, response.status);
                    popActiveRequest($rootScope);
                    return response;
                }, function error(response) {
                    $log.warn(response.config.url, response.status);
                    popActiveRequest($rootScope);
                    return $q.reject(response);
                });
            };
        }]);

        // Global exception handling.
        $httpProvider.responseInterceptors.push([
                     '$rootScope', '$q', '$location', 'wdAuthToken',
            function( $rootScope,   $q,   $location,   wdAuthToken) {
            return function(promise) {
                return promise.then(null, function error(response) {
                    // If auth error, always signout.
                    // 401 for auth invalid, 0 for server no response.
                    if (!response.config.disableErrorControl &&
                        (response.status === 401 || response.status === 0)) {
                        wdAuthToken.signout();
                    }
                    return $q.reject(response);
                });
            };
        }]);

        wdHttpProvider.requestInterceptors.push(['wdDev', function(wdDev) {
            return function(config) {
                // Using realtime data source url.
                if (config.url) {
                    config.url = wdDev.wrapURL(config.url);
                }
                // Global timeout
                if (angular.isUndefined(config.timeout)) {
                    config.timeout = 60 * 1000;
                }
                // By default, all request using withCredentials to support cookies in CORS.
                if (angular.isUndefined(config.withCredentials)) {
                    config.withCredentials = true;
                }
            };
        }]);
    }])
    .run([      '$window', '$rootScope', 'wdKeeper', 'GA',
        function($window,   $rootScope,   wdKeeper,   GA) {

        // $rootScope.$on('$routeChangeStart', function(next) {
        //     console.log('start', next, $location.url());
        // });
        // $rootScope.$on('$routeChangeSuccess', function(next) {
        //     console.log('success', next, $location.url());
        // });
        // $rootScope.$on('$routeChangeError', function(next) {
        //     console.log('error', next, $location.url());
        // });

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

        // $rootScope.$on('ajaxStart', function() {});
        // $rootScope.$on('ajaxStop',  function() {});

        // GA support
        $rootScope.GA = GA;
    }]);
});
