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
    .config(['$routeProvider', '$httpProvider', 'wdHttpProvider', 'wdDevProvider', 'wdAuthFilterProvider',
        function($routeProvider, $httpProvider, wdHttpProvider, wdDevProvider, wdAuthFilterProvider) {
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
                delay: wdAuthFilterProvider.needAuth
            }
        });
        $routeProvider.otherwise({
            redirectTo: '/portal'
        });

        // Prevent CORS error for accept-headers...
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $httpProvider.responseInterceptors.push(['$rootScope', '$q', '$log', '$location', function($rootScope, $q, $log, $location) {
            function success(response) {
                $log.log(response.config.url, response.status);
                return response;
            }

            function error(response) {
                $log.warn(response.config.url, response.status);
                if (response.status === 401) {
                    $location.url('/portal');
                }
                return $q.reject(response);
            }

            return function(promise) {
                return promise.then(success, error);
            };
        }]);

        wdHttpProvider.requestInterceptors.push(function(config) {
            if (config.url) {
                config.url = wdDevProvider.wrapURL(config.url);
            }
        });
    }]);
});
