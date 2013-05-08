define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmMessagesCollection', '$q', '$http',
function(wdmMessagesCollection,   $q,   $http) {

var _super = wdmMessagesCollection.MessagesCollection.prototype;

function SyncMessagesCollection(conversation) {
    _super.constructor.call(this);
    this._conversation = conversation;
    this.loaded = false;
}

SyncMessagesCollection.prototype = Object.create(_super, {
    empty: {get: function() { return !this.length && this.loaded; }}
});

_.extend(SyncMessagesCollection.prototype, {

    constructor: SyncMessagesCollection,

    /**
     * Create a Message and add into collection
     * @param  {Object} data
     * @return {}      [description]
     */
    create: function(data) {
        if (data.thread_id == null) {
            data.thread_id = this._conversation.id;
        }
        return _super.create.call(this, data);
    },

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
    },

    remove: function(messages) {
        var self = this;

        messages = this.drop(messages);

        messages.filter(function(m) {
            return !m.isNew;
        });

        return $q.all(messages.map(function(m) {
            return m.destroy().then(function done() {
                return m;
            }, function fail() {
                // Add message back
                self.add(m);
                return m;
            });
        }));
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
