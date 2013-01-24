define([
        'angular',
        'modules/auth',
        'modules/photos',
        'text!templates/auth/portal.html',
        'text!templates/photos/gallery.html'
    ], function(
        angular,
        auth,
        photos,
        PortalTemplate,
        PhotosTemplate
    ) {
'use strict';
angular.module('wdApp', ['wdAuth', 'wdPhotos'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/portal', {
            template: PortalTemplate,
            controller: 'portalController'
        });
        // $routeProvider.when('/', {
        //     redirectTo: '/photos'
        // });
        $routeProvider.when('/photos', {
            template: PhotosTemplate,
            controller: 'galleryController'
        });
        $routeProvider.when('/photos/:action/:id', {
            template: PhotosTemplate,
            controller: 'galleryController'
        });
        $routeProvider.otherwise({
            redirectTo: '/portal'
        });
    }]);
});
