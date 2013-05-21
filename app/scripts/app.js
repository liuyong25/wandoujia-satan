define([
    'angular',
    'auth/main',
    'photos/main',
    'text!templates/auth/portal.html',
    'text!templates/photos/gallery.html',
    'text!templates/contacts/index.html',
    'text!templates/applications/index.html',
    'text!templates/messages/conversations.html',
    'common/main',
    'common/language',
    'messages/main',
    'contacts/main',
    'applications/main'
], function(
    angular,
    auth,
    photos,
    PortalTemplate,
    PhotosTemplate,
    ContactsTemplate,
    ApplicationsTemplate,
    MessagesTemplate,
    common,
    language,
    messages,
    contacts,
    applications
) {
'use strict';

angular.module('wdApp', ['wdCommon', 'wdAuth', 'wdPhotos', 'wdLanguage', 'wdMessages', 'wdContacts','wdApplications'])
    .config([   '$routeProvider', '$httpProvider',
        function($routeProvider,   $httpProvider) {

        // Prevent CORS error for accept-headers...
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Used for filter route changing which need auth.
        var validateToken = ['$q', 'wdAuthToken', '$location',
            function($q, wdAuthToken, $location) {
            if (wdAuthToken.valid()) {
                return true;
            }
            else {
                // Auth invalid, jump to portal
                $location.url('/portal?ref=' + encodeURIComponent($location.url()));
                return $q.reject('Authentication failed.');
            }
        }];

        var reflectNavbar = function(moduleName) {
            return [function() {
                return moduleName;
            }];
        };

        var minVersionRequirement = function(versionCode) {
            return ['wdDev', function(wdDev) {
                return wdDev.getMetaData('version_code') >= versionCode;
            }];
        };

        // Routers configurations.
        $routeProvider.when('/portal/:help', {
            redirectTo: '/portal'
        });
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
            redirectTo: '/' + (localStorage.getItem('lastModule') || 'photos')
        });
        $routeProvider.when('/photos', {
            template: PhotosTemplate,
            controller: 'galleryController',
            resolve: {
                auth: validateToken,
                nav: reflectNavbar('photos'),
                versionSupport: minVersionRequirement(3769)
            },
            reloadOnSearch: false
        });
        $routeProvider.when('/messages', {
            template: MessagesTemplate,
            controller: 'wdmConversationController',
            resolve: {
                auth: validateToken,
                nav: reflectNavbar('messages'),
                versionSupport: minVersionRequirement(3769)
            },
            reloadOnSearch: false
        });
        $routeProvider.when('/contacts', {
            template: ContactsTemplate,
            controller: 'ContactsCtrl',
            resolve: {
                auth: validateToken,
                nav: reflectNavbar('contacts'),
                versionSupport: minVersionRequirement(3769)
            },
            reloadOnSearch: false
        });
        $routeProvider.when('/applications', {
            template: ApplicationsTemplate,
            controller: 'ApplicationsCtrl',
            resolve: {
                auth: validateToken,
                nav: reflectNavbar('applications'),
                versionSupport: minVersionRequirement(3796)
            },
            reloadOnSearch: false
        });
        $routeProvider.otherwise({
            redirectTo: '/portal'
        });

        // Global exception handling.
        $httpProvider.interceptors.push(['wdDev', '$rootScope', '$q', '$log', 'wdAuthToken', function(wdDev, $rootScope, $q, $log, wdAuthToken) {
            return {
                request: function(config) {
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
                    pushActiveRequest($rootScope);
                    return config;
                },
                response: function success(response) {
                    $log.log(response.config.url, response.status);
                    popActiveRequest($rootScope);
                    return response;
                },
                responseError: function error(rejection) {
                    $log.warn(rejection.config.url, rejection.status);
                    popActiveRequest($rootScope);
                    // If auth error, always signout.
                    // 401 for auth invalid, 0 for server no response.
                    if (!rejection.config.disableErrorControl &&
                        (rejection.status === 401 /*|| response.status === 0 */)) {
                        wdAuthToken.signout();
                    }
                    return $q.reject(rejection);
                }
            };
        }]);

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
    }])
    .run([      '$window', '$rootScope', 'wdKeeper', 'GA', 'wdWordTable', 'wdSocket', 'wdTitleNotification',
        function($window,   $rootScope,   wdKeeper,   GA,   wdWordTable,   wdSocket,   wdTitleNotification) {
        // Tip users when leaving.
        $window.onbeforeunload = function () {
            return wdKeeper.getTip();
        };

        (function(keeper) {
            $rootScope.$on('ajaxStart', function() {
                keeper = wdKeeper.push($rootScope.DICT.app.UNLOAD_NETWORK_TIP);
            });
            $rootScope.$on('ajaxStop',  function() {
                keeper.done();
            });
        })();

        // GA support
        $rootScope.GA = GA;

        // i18n word table
        $rootScope.DICT = wdWordTable;


        $rootScope.notifyNewMessage = function() {
            wdTitleNotification.notify($rootScope.DICT.app.MESSAGE_NOTIFICATION_TITLE);
        };
        $rootScope.restoreTitle = function() {
            wdTitleNotification.restore();
        };

        $rootScope.$on('signin', function() {
            wdSocket.connect();
        });
        $rootScope.$on('signout', function() {
            wdSocket.close();
        });
    }]);

angular.bootstrap(document, ['wdApp']);

(function() {})(common, language, photos, auth, messages, contacts);
});
