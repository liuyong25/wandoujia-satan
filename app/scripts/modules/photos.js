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
        'services/photos/layout-algorithm',
        'directives/photos/block',
        'directives/photos/uploader',
        'directives/photos/frame'
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
        layoutAlgorithm,
        block,
        uploader,
        frame
    ) {
'use strict';

angular.module('wdPhotos', ['wdCommon', 'wdResources', 'bootstrap'])
    .constant('WDP_LOAD_IMAGE_DELAY', 200)
    .constant('WDP_PRELOAD_IMAGE_OFFSET', 100)
    .constant('WDP_PLAYING_INTERVAL', 3000)
    .directive('wdpUploader', uploader)
    .directive('wdpShowcase', showcase)
    .directive('wdpBlock', block)
    .directive('wdpActionbar', actionbar)
    .directive('wdpSlides', slides)
    .directive('wdpFrame', frame)
    .factory('PhotosLayoutAlgorithm', layoutAlgorithm)
    .factory('PhotoGroup', PhotoGroup)
    .controller('galleryController', ['$scope', 'Photos', 'PhotoGroup', '$window', 'wdSharing',
        function($scope, Photos, PhotoGroup, $window, wdSharing) {
        $scope.photos = [];
        $scope.groups = [];
        $scope.selectedPhotos = [];
        $scope.previewPhoto = null;

        Photos.query(function(photos) {
            $scope.photos = photos;
            // $scope.photos = _.first(photos, 5);  // for debug...
        });

        $scope.$watch('photos', function() {
            $scope.groups.splice(0, $scope.groups.length);
            $scope.groups.push.apply($scope.groups, PhotoGroup.divide($scope.photos));
        }, true);
        $scope.isSelected = function(photo) {
            return _.indexOf($scope.selectedPhotos, photo) >= 0;
        };
        $scope.selectAll = function() {
            if ($scope.selectedPhotos.length === $scope.photos.length) {
                $scope.selectedPhotos = [];
            }
            else {
                $scope.selectedPhotos = $scope.photos.slice();
            }
        };
        $scope.toggleSelected = function(selected, photo) {
            $scope[selected ? 'select' : 'deselect'](photo);
        };
        $scope.select = function(photo) {
            $scope.selectedPhotos.push(photo);
        };
        $scope.deselect = function(photo) {
            $scope.selectedPhotos.splice(_.indexOf($scope.selectedPhotos, photo), 1);
        };
        $scope.preview = function(photo) {
            $scope.previewPhoto = photo;
        };
        $scope.download = function(photo) {
            $window.open(photo.path);
        };
        $scope.share = function(photo) {
            wdSharing.weibo(photo);
        };
        $scope.delete = function(photo) {
            if (!$window.confirm('确定删除？')) {
                return;
            }
            $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
            // var group = _.find($scope.groups, function(group) {
            //     return _.any(group.photos, function(p) {
            //         return p === photo;
            //     });
            // });
            // group.photos.splice(_.indexOf(group.photos, photo), 1);
            photo.$remove();
        };
        $scope.deleteSelected = function() {
            if (!$window.confirm('确定删除所有选中图片？')) {
                return;
            }

            _.each($scope.selectedPhotos, function(photo) {
                $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
                photo.$remove();
                // $scope.delete(photo);
            });
            $scope.selectedPhotos = [];
        };
        $scope.upload = function(files) {
            console.log(11111,files);
            _.each(files, function(file) {
                Photos.get({id: file.id}, function(photo) {
                    $scope.photos.unshift(photo);
                });
            });
        };
    }]);

});
