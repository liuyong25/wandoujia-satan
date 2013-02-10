define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return function() {
    var self = this;
    self.requestInterceptors = [];
    self.$get = [
                '$http', '$q', '$rootScope', '$timeout', '$injector',
        function($http,   $q,   $rootScope,   $timeout,   $injector) {

        function http(config) {
            function failRequestInterceptor(requestInterceptor) {
                return $injector.invoke(requestInterceptor, null, {config: config}) === false;
            }

            if (_(self.requestInterceptors).any(failRequestInterceptor)) {
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
                // Keep same as $http, always asyncly.
                $timeout(function() {
                    deferred.reject('requestInterceptor failed.');
                }, 0);
                return promise;
            }
            else {
                return $http(config);
            }
        }
        return http;
    }];
};
});
