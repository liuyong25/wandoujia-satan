define([
    'text!templates/common/upgrade-warning.html'
], function(
    template
) {
'use strict';
return [function() {
return {

restrict: 'EAC',
template: template,
replace: true,
scope: {
    warningText: '@text'
}

};
}];
});
