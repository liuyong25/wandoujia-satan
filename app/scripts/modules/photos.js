define([
        'angular',
        'directives/photos/showcase',
        'modules/resources',
        'underscore',
        'services/photos/photo-group',
        'modules/bootstrap',
        'modules/common',
        'directives/photos/actionbar',
        'directives/photos/slides',
        'services/photos/layout-algorithm'
    ], function(
        angular,
        showcase,
        resources,
        _,
        PhotoGroup,
        bootstrap,
        common,
        actionbar,
        slides,
        layoutAlgorithm
    ) {
'use strict';

angular.module('wdPhotos', ['wdCommon', 'wdResources', 'bootstrap'])
    .constant('WDP_PLAYING_INTERVAL', 1000)
    .directive('wdpShowcase', showcase)
    .directive('wdpActionbar', actionbar)
    .directive('wdpSlides', slides)
    .factory('PhotosLayoutAlgorithm', layoutAlgorithm)
    .factory('PhotoGroup', PhotoGroup)
    .controller('galleryController', ['$scope', 'Photos', 'PhotoGroup', '$window', 'wdSharing',
        function($scope, Photos, PhotoGroup, $window, wdSharing) {
        $scope.photos = [];
        $scope.groups = [];
        $scope.photosPositions = {};
        $scope.selectedPhotos = [];
        $scope.previewPhoto = null;
        $scope.previewPhotoIndex = null;

        var photos = Photos.query(function() {
            $scope.photos = _.sortBy(photos, function(photo) {
                return -photo.date_added;
            });
            // $scope.photos = _.first(photos, 5);  // for debug...
            $scope.groups = PhotoGroup.divide($scope.photos);
        });
        $scope.isSelected = function(photo) {
            return _.indexOf($scope.selectedPhotos, photo) >= 0;
        };
        $scope.selectAll = function() {
            if ($scope.selectedPhotos.length === $scope.photos.length) {
                $scope.selectedPhotos = [];
            }
            else {
                $scope.selectedPhotos = $scope.photos;
            }
        };
        $scope.select = function(photo) {
            $scope.selectedPhotos.push(photo);
        };
        $scope.deselect = function(photo) {
            $scope.selectedPhotos.splice(_.indexOf($scope.selectedPhotos, photo), 1);
        };
        $scope.preview = function(photo, index) {
            $scope.previewPhoto = photo;
            $scope.previewPhotoIndex = index;
        };
        $scope.download = function(photo) {
            $window.open(photo.path);
        };
        $scope.share = function(photo) {
            wdSharing.weibo(photo);
        };
        $scope.delete = function(photo) {
            $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
            var group = _.find($scope.groups, function(group) {
                return _.any(group.photos, function(p) {
                    return p === photo;
                });
            });
            group.photos.splice(_.indexOf(group.photos, photo), 1);
            photo.$remove();
        };
        $scope.deleteAll = function() {
        };
        $scope.upload = function() {};
    }]);

});
