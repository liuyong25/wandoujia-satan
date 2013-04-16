define([], function() {
'use strict';
return [function() {



var Messages = {
    _collection: [],

    get collection() {
        return this._collection;
    },
    set collection(messages) {
        // Merge messages into collection.
        return this._collection;
    },

    get hasError() {
        // A process detect if there is an error message.
        return true;
    },

    get hasRunning() {
        // A process detect if there is any message of running status.
        return true;
    },

    get hasUnread() {
        // A process detect if there is any unread message.
        return true;
    }
};


function wrapMessage(origin) {
    return Object.create(origin, {

    });
}


return Messages;
}];
});
