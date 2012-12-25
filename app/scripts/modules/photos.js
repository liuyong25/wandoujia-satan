define([
        'angular',
        'directives/photos/showcase',
        'modules/resources',
        'underscore'
    ], function(
        angular,
        showcase,
        resources,
        _
    ) {
'use strict';

angular.module('wdPhotos', ['wdResources'])
    .directive('wdShowcase', showcase)
    .controller('galleryController', ['$scope', 'Photos', function($scope, Photos) {
        var data = [];
        _.times(10, function(i) {
            data.push({
                id: i,
                path: 'http://photo.wandoujia.com/photo/thumbnail?token=%2Fimage%2F0d0da66d0450d0fc623ce27e2150cce5&size=height170&expires=1356505644401&signature=pootKauZTkOxTxXCDU%2Bys0EK9Ds%3D',
                display_name: 'xxxxx',
                title: 'gum',
                date_added: Date.now(),
                width: 285,
                height: 170
            });
        });
        $scope.photos = data;
    }]);


});
