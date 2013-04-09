define([
    'text!templates/common/blank.html'
], function(
    template
) {
'use strict';
return [function() {
return {

restrict: 'EAC',
template: template,
transclude: true,
replace: true

};
}];
});
