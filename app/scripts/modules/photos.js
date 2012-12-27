define([
        'angular',
        'directives/photos/showcase',
        'modules/resources',
        'underscore',
        'services/photos/photo-group'
    ], function(
        angular,
        showcase,
        resources,
        _,
        PhotoGroup
    ) {
'use strict';

angular.module('wdPhotos', ['wdResources'])
    .directive('wdShowcase', showcase)
    .factory('PhotoGroup', PhotoGroup)
    .controller('galleryController', ['$scope', 'Photos', 'PhotoGroup', function($scope, Photos, PhotoGroup) {
        $scope.photos = [];
        $scope.selectedPhotosCount = 0;
        $scope.previewId = null;
        var photos = Photos.query(function() {
            $scope.photos = photos;
            $scope.groups = PhotoGroup.divide(photos);
        });
        $scope.selectAll = function() {
            $scope.$broadcast($scope.selectedPhotosCount === $scope.photos.length ? 'selectNone' : 'selectAll');
        };
        $scope.closePreview = function() {
                $scope.previewId = null;
        };
        $scope.$on('select', function() {
            $scope.selectedPhotosCount += 1;
        });
        $scope.$on('deselect', function() {
            $scope.selectedPhotosCount -= 1;
        });
        $scope.$on('preview', function(photoId) {
            $scope.previewId = photoId;
        });
    }])
    .controller('blockController', ['$scope', '$window', function($scope, $window) {
        // model for select checkbox
        $scope.selected = false;
        // photo actions
        $scope.delete = function() {
            $window.confirm('delete? ' + this.photo.id);
        };
        $scope.share = function() {};
        $scope.download = function() {};
        $scope.preview = function() {
            $scope.$emit('preview', this.photo.id);
        };
        // events
        $scope.$watch('selected', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.$emit(newValue ? 'select' : 'deselect', $scope.photo.id);
            }
        });
        $scope.$on('selectAll', function() {
            $scope.selected = true;
        });
        $scope.$on('selectNone', function() {
            $scope.selected = false;
        });
    }]);


});
