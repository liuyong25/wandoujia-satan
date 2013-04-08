define([], function() {
'use strict';
return [function() {
return {

link: function(scope, element) {
    element.on('click', function() {
        scope.$apply('showConversation(c)');
    });
    element.on('click', '.wdmcr-a', function(e) {
        e.stopPropagation();
    });
}

};
}];
});
