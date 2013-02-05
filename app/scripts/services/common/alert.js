define([], function() {
'use strict';
return ['$q', function($q) {
    var modal = null;
    return {
        registerModal: function(newModal) {
            modal = newModal;
        },
        alert: function(header, content) {
            if (modal === null) {
                throw new Error('Not Found bsModal');
            }
            return $q.when(modal.open(header, content, true));
        },
        confirm: function(header, content) {
            if (modal === null) {
                throw new Error('Not Found bsModal');
            }
            return $q.when(modal.open(header, content));
        }
    };
}];
});
