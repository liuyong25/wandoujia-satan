define([
    'messages/services/hashmap',
    'underscore'
], function(
    HashMap,
    _
) {
'use strict';
return [function() {

var cache = {};
var collection = [];
var hashmap = new HashMap();

cache.insert = multiple(insert);

return hashmap;

//======================================================
/**
 * Insert a conversation raw data into client cache.
 */
function insert(c) {
    if (cvsExisted(c)) {
        mergeCvs(c);
    }
    else {
        collection.push(c);
        hashmap.put(c);
    }
}

/**
 * Remove a conversation from client cache.
 */
function remove(c) {
    var index = _(collection).indexOf(c);
    if (index >= 0) {
        collection.splice(index, 1);
        hashmap.remove(c);
    }
}

/**
 * Update a conversation in client cache.
 */
function update(c) {

}

function mergeCvs(c) {
    _(findCvs(c)).extend(c);
}

function findCvs(c) {
    return _(collection).find(equalTo(c));
}

function cvsExisted(c) {
    return inCollection(c);
}

function inCollection(c) {
    return !!_(collection).any(equalTo(c));
}

function inHashMap(c) {
    return !!hashmap.get(c);
}

function equalTo(target) {
    return function(item) {
        return item.id === target.id;
    };
}

function toArray(source) {
    return [].concat(source);
}

function multiple(fn) {
    return function(items) {
        _(toArray(items)).each(fn);
        return this;
    };
}

}];
});
