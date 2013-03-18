define([
        'keymaster',
        'underscore'
    ], function(
        keymaster,
        _
    ) {
'use strict';
return ['$rootScope', '$log', '$q', function($rootScope, $log, $q) {
    var stack = [];
    var key = keymaster.key;

    key.push = function(scope) {
        var deferred = $q.defer();
        stack.unshift(scope);
        key.setScope(scope);
        $log.log('Shortcuts scope changed to: ' + key.getScope() + '. Total ' + stack.length);
        deferred.promise.then(function() {
            stack.shift();
            var scope = stack[0] || 'all';
            key.setScope(scope);
            $log.log('Shortcuts scope changed to: ' + key.getScope() + '. Total ' + stack.length);
        });
        return {
            done: function() {
                deferred.resolve();
            }
        };
    };

    key.$apply = function() {
        var args = _.toArray(arguments);
        _.each(args, function(arg, i) {
            if (_.isFunction(arg)) {
                args[i] = function() {
                    return $rootScope.$apply(function() {
                        return arg.apply(null, arguments);
                    });
                };
            }
        });
        key.apply(keymaster, args);
    };
    return key;
}];
});
