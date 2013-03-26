define([
    'underscore'
], function(
    _
) {
'use strict';
return function HashMap(defaults) {
    var hashmap = {};

    function retrieveId(obj) {
        return _(obj).isObject() ? obj.id : obj;
    }

    this._hashmap = hashmap;
    this.contains = function(model) {
        return retrieveId(model) in hashmap;
    };
    this.put = function(models, init) {
        if (!_(models).isArray()) {
            models = [models];
        }
        _(models).each(function(model) {
            if (this.contains(model)) {
                _(hashmap[retrieveId(model)]).extend(init);
            }
            else {
                hashmap[model.id] = _.extend({}, defaults, init, {
                    model: model
                });
            }
        }, this);
    };
    this.get = function(model, prop) {
        if (!this.contains(model)) { return null; }
        var status = hashmap[retrieveId(model)];
        return (typeof prop === 'undefined') ? status : status[prop];
    };
    this.remove = function(model) {
        delete hashmap[retrieveId(model)];
    };
    this.reset = function() {
        this._hashmap = hashmap = {};
    };
};
});
