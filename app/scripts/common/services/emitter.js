define([
    'jquery'
], function(
    jQuery
) {
'use strict';
return [function() {
return function EventEmitter(obj, override) {
    var delegate = jQuery({});
    override = !!override;
    ['on', 'off', 'trigger'].forEach(function(fnName) {
        if (!override && (fnName in obj)) {
            throw new Error('EventEmitter can not mixin to ' + obj + ' for there has already a property named ' + fnName);
        }
        obj[fnName] = function() {
            delegate[fnName].apply(delegate, arguments);
            return this;
        };
        obj[fnName].delegate = delegate;
    });
};
}];
});
