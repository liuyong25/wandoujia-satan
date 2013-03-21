define([
    'text!templates/messages/loadmore.html'
], function(
    template
) {
'use strict';
return ['$q', function($q) {
return {

template: template,
replace: true,
scope: true,
link: function(scope, element, attributes) {
    scope.loading = false;

    element.on('click', function() {
        if (scope.loading) { return; }
        scope.$apply(function() {
            scope.loading = true;
            $q.when(scope.$eval(attributes.wdmLoadMore)).then(function success() {
                scope.loading = false;
            }, function error() {
                scope.loading = false;
            });
        });
    });

}

};
}];
});
