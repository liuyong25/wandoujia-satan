define([], function() {
'use strict';
return function() {
    var self = this;
    self.requestInterceptors = [];
    self.$get = ['$http', '$q', '$rootScope', function($http, $q, $rootScope) {
        return function http(config) {
            var failed = false;
            var i, l;
            for (i = 0, l = self.requestInterceptors.length; i < l; i += 1) {
                if (self.requestInterceptors[i].call(null, config) === false) {
                    failed = true;
                    break;
                }
            }
            if (failed) {
                var deferred = $q.defer();
                var promise = deferred.promise;
                // This promise will never success...
                promise.success = function() {
                    return promise;
                };
                promise.error = function(fn) {
                    promise.then(null, function(reason) {
                        // Same as $http: data, status, headers, config
                        fn(reason, -1, [], config);
                    });
                    return promise;
                };
                setTimeout(function() {
                    $rootScope.$apply(function() {
                        deferred.reject('requestInterceptor failed.');
                    });
                }, 0);
                return promise;
            }
            else {
                return $http(config);
            }
        };
    }];
};
});
