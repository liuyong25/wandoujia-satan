define([
    'underscore'
], function(
    _
) {
'use strict';

function Collection(options) {
    this.collection = [];
}

Object.defineProperties(Collection.prototype, {
    length: {get: function() { return this.collection.length; }},
    empty:  {get: function() { return !this.length; }},
    hasSelected: {
        get: function() {
            return this.collection.some(function(item) {
                return item.selected;
            });
        }
    },
    allSelected: {
        get: function() {
            return this.collection.every(function(item) {
                return item.selected;
            });
        }
    }
});

_.extend(Collection.prototype, {

    constructor: Collection,

    sort: function() {},

    getById: function(id) {
        return _(this.collection).find(function(item) {
            return item.id === id;
        });
    },

    contains: function(item) {
        return this.collection.indexOf(item) !== -1;
    },

    create: function(data) {
        throw new Error('Not implement create method!');
    },

    add: function(items) {
        items = [].concat(items);
        var updated = items.map(function(item) {
            var existed = this.getById(item.id);
            if (existed) {
                existed.extend(item);
                return existed;
            }
            else {
                if (item._collection) {
                    item = this.create(item.rawData);
                }
                item._collection = this;
                this.collection.push(item);
                return item;
            }
        }, this);

        this.sort();

        return updated;
    },

    drop: function(items) {
        items = [].concat(items);
        items.forEach(function(item) {
            var index = this.collection.indexOf(item);
            if (index !== -1) {
                this.collection.splice(index, 1);
                item._collection = null;
            }
        }, this);

        this.sort();

        return items;
    },

    clear: function() {
        this.drop(this.collection);
    },

    toggleSelectAll: function() {
        var toBe = !this.allSelected;
        this.collection.forEach(function(c) {
            c.selected = toBe;
        });
    },
});

return Collection;

});
