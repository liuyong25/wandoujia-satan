define([], function() {
'use strict';
return ['$q', function($q) {
    var modal = null;
    return {
        registerModal: function(newModal) {
            modal = newModal;
        },
        alert: function(header, content, ok) {
            if (modal === null) {
                throw new Error('Not Found bsModal');
            }
            return $q.when(modal.open({
                header: header,
                content: content,
                ok: ok,
                onlyOk: true
            }));
        },
        confirm: function(header, content, ok, cancel) {
            if (modal === null) {
                throw new Error('Not Found bsModal');
            }
            return $q.when(modal.open({
                header: header,
                content: content,
                ok: ok,
                cancel: cancel
            }));
        }
    };
}];
});
