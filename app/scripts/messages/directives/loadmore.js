define([
    'text!templates/messages/loadmore.html'
], function(
    template
) {
'use strict';
return ['$q', '$rootScope', function($q, $rootScope) {
return {

template: template,
replace: true,
scope: true,
link: function(scope, element, attributes) {
    scope.loading = false;
    scope.text = $rootScope.DICT.messages.BTN_LOAD;

    attributes.$observe('text', function(value) {
        if (value) {
            scope.text = value;
        }
    });

    element.on('click', function() {
        if (scope.loading) { return; }
        scope.$apply(function() {
            scope.$eval(attributes.pre);
            scope.loading = true;
            $q.when(scope.$eval(attributes.wdmLoadMore)).then(function success() {
                scope.loading = false;
                scope.$eval(attributes.post);
            }, function error() {
                scope.loading = false;
            });
        });
    });

}

};
}];
});
