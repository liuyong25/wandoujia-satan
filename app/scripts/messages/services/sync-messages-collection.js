define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmMessagesCollection', '$q', '$http',
function(wdmMessagesCollection,   $q,   $http) {

var MessagesCollection = wdmMessagesCollection.MessagesCollection;

function SyncMessagesCollection(conversation) {
    MessagesCollection.call(this, conversation);
    this._conversation = conversation;
    this.loaded = false;
}

SyncMessagesCollection.prototype = Object.create(MessagesCollection.prototype);

Object.defineProperties(SyncMessagesCollection.prototype, {
    empty: {get: function() { return !this.length && this.loaded; }}
});

_.extend(SyncMessagesCollection.prototype, {

    constructor: SyncMessagesCollection,

    sync: function(action, config, refresh) {
        var self = this;
        var done = null;
        var fail = function() { return $q.reject(); };

        if (action === 'read') {
            config.method = 'GET';
            config.url = '/resource/conversations/' + this._conversation.id + '/messages';
            done = function(response) {
                var data = [].concat(response.data);
                if (!refresh) {
                    self.loaded = response.headers('WD-Need-More') === 'false';
                }
                return self.add(data.map(self.create.bind(self)));
            };

            return $http(config).then(done, fail);
        }
        else {
            return $q.reject();
        }
    }

});

return {
    SyncMessagesCollection: SyncMessagesCollection,
    createSyncMessagesCollection: function(conversation) {
        return new SyncMessagesCollection(conversation);
    },
};
}];
});
