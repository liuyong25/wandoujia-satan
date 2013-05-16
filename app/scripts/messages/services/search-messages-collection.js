define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmSyncMessagesCollection', '$http',
function(wdmSyncMessagesCollection,   $http) {

var _super = wdmSyncMessagesCollection.SyncMessagesCollection.prototype;

function SearchMessagesCollection(conversation) {
    _super.constructor.call(this, conversation);
    this._cursor = null;
    this.laterLoaded = false;
}

SearchMessagesCollection.prototype = Object.create(_super, {
    allLoaded: {get: function() { return this.loaded && this.laterLoaded; }},
    snippet: {get: function() { return this._cursor.body; }}
});

_.extend(SearchMessagesCollection.prototype, {

    constructor: SearchMessagesCollection,

    setCursor: function(m) {
        this._cursor = m;
        // this.add(this._cursor);
    },

    isCursor: function(m) {
        return this._cursor.id === m.id;
    },

    fetch: function() {
        var params;
        var isFirst = false;
        if (this.length) {
            params = {
                cursor: this.collection[0].id,
                offset: 1,
                length: 10
            };
        }
        else {
            isFirst = true;
            params = {
                cursor: this._cursor.id,
                offset: -5,
                length: 11
            };
        }

        return this.sync('read', {
            params: params
        }).then(function done(messages) {
            if (isFirst && this.length < 11) {
                this.laterLoaded = true;
            }
            return messages;
        }.bind(this));

    },

    fetchLater: function() {

        return this.sync('read', {
            params: {
                cursor: this.collection[this.length - 1].id,
                offset: -10,
                length: 10
            }
        }).then(function done(messages) {
            this.laterLoaded = this.loaded;
            return messages;
        }.bind(this));

    },

    fetchEarlier: function() {
        return this.sync('read', {
            params: {
                cursor: this.collection[0].id,
                offset: 1,
                length: 10
            }
        });
    }

});

return {
    SearchMessagesCollection: SearchMessagesCollection,
    createSearchMessagesCollection: function(conversation) {
        return new SearchMessagesCollection(conversation);
    }
};

}];
});
