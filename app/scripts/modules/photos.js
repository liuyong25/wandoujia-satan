define([
        'angular',
        'directives/photos/showcase',
        'modules/resources',
        'underscore',
        'services/photos/photo-group',
        'modules/bootstrap',
        'modules/common',
        'directives/photos/actionbar',
        'directives/photos/slides'
    ], function(
        angular,
        showcase,
        resources,
        _,
        PhotoGroup,
        bootstrap,
        common,
        actionbar,
        slides
    ) {
'use strict';

angular.module('wdPhotos', ['wdCommon', 'wdResources', 'bootstrap'])
    .constant('WDP_PLAYING_INTERVAL', 1000)
    .directive('wdpShowcase', showcase)
    .directive('wdpActionbar', actionbar)
    .directive('wdpSlides', slides)
    .factory('PhotoGroup', PhotoGroup)
    .controller('galleryController', ['$scope', 'Photos', 'PhotoGroup', '$window',
        function($scope, Photos, PhotoGroup, $window) {
        $scope.photos = [];
        $scope.groups = [];
        $scope.selectedPhotosCount = 0;
        $scope.previewPhoto = null;
        $scope.previewPhotoIndex = null;
        var photos = Photos.query(function() {
            $scope.photos = _.sortBy(photos, function(photo) {
                return -photo.date_added;
            });
            // $scope.photos = _.first(photos, 5);  // for debug...
            $scope.groups = PhotoGroup.divide($scope.photos);
        });
        $scope.selectAll = function() {
            $scope.$broadcast($scope.selectedPhotosCount === $scope.photos.length ? 'selectNone' : 'selectAll');
        };
        $scope.$on('select', function() {
            $scope.selectedPhotosCount += 1;
        });
        $scope.$on('deselect', function() {
            $scope.selectedPhotosCount -= 1;
        });
        $scope.$on('preview', function(e, photo, index) {
            $scope.previewPhoto = photo;
            $scope.previewPhotoIndex = index;
        });
        $scope.$on('download', function(e, photo) {
            $window.open(photo.path);
        });
        $scope.$on('delete', function(e, photo) {
        });

        $scope.delete = function(photo) {
            $scope.photos = _.without($scope.photos, photo);
        };
    }])
    .controller('blockController', ['$scope', '$window', function($scope, $window) {
        // model for select checkbox
        $scope.selected = false;
        // photo actions
        $scope.delete = function() {
            $scope.$emit('delete', this.photo, this.$index);
        };
        $scope.share = function() {};
        $scope.download = function() {
            $scope.$emit('download', this.photo, this.$index);
        };
        $scope.preview = function() {
            $scope.$emit('preview', this.photo, this.$index);
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
