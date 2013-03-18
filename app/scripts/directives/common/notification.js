define([], function() {
'use strict';
return [function() {
return {

restrict: 'CA',
require: ['bsAlert'],
scope: true,
link: function(scope, element) {
    element
        .on('click', '[bs-alert-dismiss]', triggerDismiss)
        .on('click', '[wd-notification-action]', triggerAction)
        .on('close', swallowBsAlertEvent)
        .on('closed', destroyDirective);

    //======================
    function triggerDismiss() {
        element.trigger('dismiss');
    }
    function triggerAction() {
        element.alert('close');
        element.trigger('action');
    }
    function swallowBsAlertEvent(event) {
        event.stopPropagation();
    }
    function destroyDirective(event) {
        swallowBsAlertEvent(event);
        scope.$destroy();
        element.remove();
    }
}

};
}];
});
