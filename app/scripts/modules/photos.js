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
        'directives/photos/frame',
        'directives/photos/progress',
        'directives/photos/repeat',
        'services/photos/image-helper',
        'services/photos/message-pusher'
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
        frame,
        progress,
        repeat,
        imageHelper,
        messagePusher
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
    .directive('wdpProgress', progress)
    .directive('wdpRepeat', repeat)
    .factory('PhotosLayoutAlgorithm', layoutAlgorithm)
    .factory('PhotoGroup', PhotoGroup)
    .factory('wdpImageHelper', imageHelper)
    .factory('wdpMessagePusher', messagePusher)
    .controller('galleryController', [
        '$scope', '$window', 'wdSharing', 'wdHttp', 'Photos', '$log', '$route', 'wdKey', 'wdAlert', 'wdViewport', 'GA', 'wdpMessagePusher',
        function($scope, $window, wdSharing, wdHttp, Photos, $log, $route, wdKey, wdAlert, wdViewport, GA, wdpMessagePusher) {

        $log.log('wdPhotos:galleryController initializing!');

        $scope.loadead = false;
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
            $scope.photos = _.uniq(photos, function(photo) {
                return photo.id;
            });
        }

        function fetchPhotos() {
            var params = {
                offset: 0,
                length: '5'
            };
            if ($scope.photos.length && $scope.photos[$scope.photos.length - 1].date_added) {
                params.cursor = $scope.photos[$scope.photos.length - 1].id;
            }
            var timeStart = (new Date()).getTime();
            Photos.query(params, function(photos) {
                mergePhotos(photos);
                $scope.loaded = true;
                GA('perf:photos_query_duration:success:' + ((new Date()).getTime() - timeStart));
            }, function() {
                $scope.loaded = true;
                GA('perf:photos_query_duration:fail:' + ((new Date()).getTime() - timeStart));
            });
        }

        if ($route.current.params.preview) {
            Photos.get({id: $route.current.params.preview}, function(photo) {
                mergePhotos(photo);
                $scope.preview(photo);
                fetchPhotos();
            }, function() {
                fetchPhotos();
            });
        }
        else {
            fetchPhotos();
        }
        // Temp
        wdpMessagePusher
            .channel('photos.add', function(message) {
                _.each(message.data, function(id) {
                    Photos.get({id: id}, function(photo) {
                        mergePhotos(photo);
                    });
                });
            })
            .channel('photos.remove', function(message) {
                _.each(message.data, function(id) {
                    var photo = _.find($scope.photos, function(photo) {
                        return photo.id === id;
                    });
                    if (photo) {
                        $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
                        $scope.deselect(photo);
                        photo.$remove();
                    }
                });
            })
            .start();

        $scope.$on('wdpShowcase:fetch', function(event) {
            event.stopPropagation();
            fetchPhotos();
        });

        $scope.isSelected = function(photo) {
            return _.indexOf($scope.selectedPhotos, photo) >= 0;
        };
        $scope.selectAll = function() {
            if ($scope.selectedPhotos.length === $scope.photos.length) {
                GA('photos:toolbar:deselect_all');
                $scope.selectedPhotos = [];
            }
            else {
                GA('photos:toolbar:select_all');
                $scope.selectedPhotos = $scope.photos.slice();
            }
        };
        $scope.toggleSelected = function(selected, photo) {
            if (selected) {
                GA('photos:photo:select');
            }
            else {
                GA('photos:photo:deselect');
            }
            $scope[selected ? 'select' : 'deselect'](photo);
        };
        $scope.select = function(photo) {
            $scope.selectedPhotos.push(photo);
        };
        $scope.deselect = function(photo) {
            $scope.selectedPhotos.splice(_.indexOf($scope.selectedPhotos, photo), 1);
        };
        $scope.preview = function(photo) {
            if (photo.path) {
                $scope.previewPhoto = photo;
            }
        };
        $scope.download = function(photo) {
            $window.open(photo.path);
        };
        $scope.share = function(photo) {
            wdSharing.weibo(photo);
        };
        $scope['delete'] = function(photo) {
            return wdAlert.confirm('删除图片', '确定在手机中删除这张图片吗？').then(function() {
                $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
                $scope.deselect(photo);
                photo.$remove();
            });
        };
        $scope.deleteSelected = function() {
            return wdAlert.confirm('删除图片', '确定在手机中删除所选中的图片吗？').then(function() {
                _.each($scope.selectedPhotos, function(photo) {
                    $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
                    photo.$remove();
                    // $scope.delete(photo);
                });
                $scope.selectedPhotos = [];
            });
        };
        $scope.removeFailed = function(photo) {
            $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
        };
        $scope.startUpload = function(file) {
            var photo;
            file.photo.then(function(data) {
                photo = new Photos({
                    'thumbnail_path': data.dataURI,
                    'thumbnail_width': data.width,
                    'thumbnail_height': data.height,
                    'deferred': file.upload
                });
                $scope.photos.unshift(photo);
            });
            file.upload.then(function(res) {
                Photos.get({id: res[0].id}, function(newPhoto) {
                    angular.extend(photo, newPhoto);
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
        $scope.fetch = function() {
            fetchPhotos();
        };

        // Shortcuts destruction.
        $scope.$on('$destroy', function() {
            wdKey.setScope('all');
            wdKey.deleteScope('photos');
            wdpMessagePusher.clear().stop();
        });
    }]);
});
