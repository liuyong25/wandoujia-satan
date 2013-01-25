define([], function() {
'use strict';
return function() {
    var self = this;
    self.requestInterceptors = [];
    self.$get = ['$http', '$q', function($http, $q) {
        return function http(config) {
            var failed = false;
            var requestInterceptor, i, l;
            for (i = 0, l = self.requestInterceptors.length; i < l; i += 1) {
                if (self.requestInterceptors[i].call(null, config) === false) {
                    failed = true;
                    break;
                }
            }
            return failed ? $q.reject('requestInterceptor failed.') : $http(config);
        };
    }];
};
});
