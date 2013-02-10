define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return function() {
    var self = this;
    var providerRequestInterceptors = self.requestInterceptors = [];
    self.$get = [
                '$http', '$q', '$rootScope', '$timeout', '$injector',
        function($http,   $q,   $rootScope,   $timeout,   $injector) {

        var requestInterceptors = [];

        _(providerRequestInterceptors).each(function(interceptor) {
            requestInterceptors.push(
                _.isString(interceptor) ? $injector.get(interceptor) : $injector.invoke(interceptor)
            );
        });

        function http(config) {
            function failRequestInterceptor(requestInterceptor) {
                return requestInterceptor(config) === false;
            }

            if (_(requestInterceptors).any(failRequestInterceptor)) {
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
