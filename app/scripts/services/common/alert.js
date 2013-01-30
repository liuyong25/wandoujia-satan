define([], function() {
'use strict';
return ['$q', function($q) {
    var modal = null;
    return {
        registerModal: function(newModal) {
            modal = newModal;
        },
        alert: function(content) {
            if (modal === null) {
                throw new Error('Not Found bsModal');
            }
            return $q.when(modal.open(content));
        },
        confirm: function(content) {
            if (modal === null) {
                throw new Error('Not Found bsModal');
            }
            return $q.when(modal.open(content));
        }
    };
}];
});
