define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmSyncMessagesCollection', '$http',
function(wdmSyncMessagesCollection,   $http) {

var SyncMessagesCollection = wdmSyncMessagesCollection.SyncMessagesCollection;

function SearchMessagesCollection(conversation) {
    SyncMessagesCollection.apply(this);
    this._cursor = null;
    this.laterLoaded = false;
}

SearchMessagesCollection.prototype = Object.create(SyncMessagesCollection.prototype);

_.extend(SearchMessagesCollection.prototype, {

    constructor: SearchMessagesCollection,

    setCursor: function(data) {
        this._cursor = this.create(data);
        this.add(this._cursor);
    },

    isCursor: function(m) {
        return this._cursor === m;
    },

    fetch: function() {
        var self = this;

        return this.sync('read', {
            params: {
                cursor: this._cursor.id,
                offset: -5,
                length: 11
            }
        }).then(function done(messages) {
            if (self.length < 11) {
                self.laterLoaded = true;
            }
            return messages;
        });
    },

    fetchLater: function() {
        var self = this;
        return this.sync('read', {
            params: {
                cursor: this.collection[this.length - 1].id,
                offset: -10,
                length: 10
            }
        }).then(function done(messages) {
            this.laterLoaded = this.loaded;
            return messages;
        });
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
