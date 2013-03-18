define([
    'text!templates/bootstrap/alert.html'
], function(
    template
) {
'use strict';
return [function() {
return {

template: template,
replace: true,
transclude: true,
controller: [function() {}],
link: function(scope, element) {
    element.alert();
    element.on('click', '[bs-alert-dismiss]', function() {
        element.alert('close');
    });
}


};
}];
});
