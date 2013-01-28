define([
        'keymaster',
        'underscore'
    ], function(
        keymaster,
        _
    ) {
'use strict';
return ['$rootScope', function($rootScope) {
    keymaster.key.$apply = function() {
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
        keymaster.key.apply(keymaster, args);
    };
    return keymaster.key;
}];
});
