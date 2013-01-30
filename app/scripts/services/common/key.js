define([
        'keymaster',
        'underscore'
    ], function(
        keymaster,
        _
    ) {
'use strict';
return ['$rootScope', '$log', function($rootScope, $log) {
    var stack = [];
    var key = keymaster.key;

    key.push = function(scope, promise) {
        stack.unshift(scope);
        key.setScope(scope);
        $log.log('Shortcuts scope changed to: ' + key.getScope() + '. Total ' + stack.length);
        promise.then(function() {
            stack.shift();
            var scope = stack[0] || 'all';
            key.setScope(scope);
            $log.log('Shortcuts scope changed to: ' + key.getScope() + '. Total ' + stack.length);
        });
        return stack.length;
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
