define([
    'underscore'
], function(
    _
) {
'use strict';

function Model(rawData) {
    _.extend(this, rawData);

    var instance = Object.create(this, {
        rawData: {value: this}
    });

    instance._collection = null;
    instance.selected = false;

    return instance;
}

Object.defineProperties(Model.prototype, {
    isNew: {get: function() { return typeof this.id !== 'number'; }}
});

_.extend(Model.prototype, {
    extend: function(newData) {
        if (typeof newData.extend === 'function') {
            newData = newData.rawData;
        }
        _.extend(this.rawData, newData);
        return this;
    }
});

return Model;

});
