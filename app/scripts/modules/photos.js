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
        $scope.selectedPhotosCount = 0;
        $scope.selectAll = function() {
            $scope.$broadcast($scope.selectedPhotosCount > 1 ? 'selectNone' : 'selectAll');
        };
        $scope.$on('select', function() {
            $scope.selectedPhotosCount += 1;
        });
        $scope.$on('deselect', function() {
            $scope.selectedPhotosCount -= 1;
        });
    }])
    .controller('blockController', ['$scope', '$window', function($scope, $window) {
        $scope.selected = false;
        $scope.preview = function() {
            $window.alert(this.photo.id);
        };
        $scope.delete = function() {
            $window.confirm('delete? ' + this.photo.id);
        };
        $scope.share = function() {};
        $scope.download = function() {};
        $scope.$watch('selected', function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            var eventName = newValue ? 'select' : 'deselect';
            $scope.$emit(eventName, $scope.photo.id);
        });
        $scope.$on('selectAll', function() {
            $scope.selected = true;
        });
        $scope.$on('selectNone', function() {
            $scope.selected = false;
        });
    }]);


});
