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
    .controller('galleryController', ['$scope', 'Photos', 'PhotoGroup', '$window', 'wdSharing', '$routeParams',
        function($scope, Photos, PhotoGroup, $window, wdSharing, $routeParams) {
        $scope.photos = [];
        $scope.groups = [];
        $scope.selectedPhotos = [];
        $scope.previewPhoto = null;

        function mergePhotos(photos) {
            if (!angular.isArray(photos)) {
                photos = [photos];
            }
            photos = _.sortBy($scope.photos.concat(photos), function(photo) {
                return -photo.date_added;
            });
            $scope.photos = _.uniq(photos, true, function(photo) {
                return photo.id;
            });
        }

        if ($routeParams.action === 'preview') {
            Photos.get({id: $routeParams.id}, function(photo) {
                mergePhotos(photo);
                $scope.preview(photo);
            });
        }
        Photos.query(function(photos) {
            mergePhotos(photos);
            // $scope.photos = _.first(photos, 5);  // for debug...
        });

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
        $scope.startUpload = function(files) {
            _.each(files.reverse(), function(file, i) {
                var photo;
                file.data.then(function(data) {
                    photo = new Photos({
                        'thumbnail_path': data.dataURI,
                        'thumbnail_width': data.width,
                        'thumbnail_height': data.height,
                        'deferred': file.uploading
                    });
                    $scope.photos.unshift(photo);
                });
                file.uploading.then(function(res) {
                    Photos.get({id: res[i].id}, function(newPhoto) {
                        angular.extend(photo, newPhoto);
                    });
                });
            });
        };
        $scope.upload = function(files) {
            _.each(files, function(file) {
                Photos.get({id: file.id}, function(photo) {
                    $scope.photos.unshift(photo);
                });
            });
        };
    }]);
});
