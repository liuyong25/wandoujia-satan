define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return [
        '$scope', '$window', 'wdSharing', 'Photos', '$log', '$route', 'wdAlert',
        'wdViewport', 'GA', 'wdpMessagePusher', 'PhotosLayoutAlgorithm', '$q',
function($scope,  $window,    wdSharing,   Photos,   $log,   $route,   wdAlert,
         wdViewport,   GA,   wdpMessagePusher,   PhotosLayoutAlgorithm,   $q) {

$log.log('wdPhotos:galleryController initializing!');

$scope.loaded = false;
$scope.photos = [];
$scope.layout = { height: 0 };
$scope.selectedPhotos = [];
$scope.previewPhoto = null;

$scope.$watch('photos.length', layout);

wdViewport.on('resize', function() {
    $scope.$apply(layout);
});

if ($route.current.params.preview) {
    Photos.get(
        { id: $route.current.params.preview },
        function(photo) {
            mergePhotos(photo);
            $scope.preview(photo);
            loadScreen();
        }, function() {
            loadScreen();
        });
}
else {
    loadScreen();
}
// Temp
wdpMessagePusher
    .channel('photos.add', function(message) {
        _.each(message.data, function(id) {
            var photo = _.find($scope.photos, function(photo) {
                return photo.id === id;
            });
            if (!photo) {
                Photos.get({id: id}, function(photo) {
                    mergePhotos(photo);
                });
            }
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
                $scope.$apply();
            }
        });
    })
    .start();

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
    return wdAlert.confirm(
            $scope.$root.DICT.photos.CONFIRM_DELETE_TITLE,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CONTENT,
            $scope.$root.DICT.photos.CONFIRM_DELETE_OK,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CANCEL
        ).then(function() {
        $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
        $scope.deselect(photo);
        photo.$remove();
    });
};
$scope.deleteSelected = function() {
    return wdAlert.confirm(
            $scope.$root.DICT.photos.CONFIRM_DELETE_TITLE,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CONTENT,
            $scope.$root.DICT.photos.CONFIRM_DELETE_OK,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CANCEL
        ).then(function() {
        _.each($scope.selectedPhotos, function(photo) {
            $scope.photos.splice(_.indexOf($scope.photos, photo), 1);
            photo.$remove();
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
        photo.id = res[0].id;
        Photos.get({id: res[0].id}, function(newPhoto) {
            _.extend(photo, newPhoto);
        });
    });
};
$scope.fetch = function() {
    loadScreen();
};

// Shortcuts destruction.
$scope.$on('$destroy', function() {
    wdpMessagePusher.clear().stop();
});

function loadScreen() {
    $scope.loaded = false;
    (function fetchLoop(defer, viewportHeight, lastLayoutHeight) {
        var photosLengthBeforeFetch = $scope.photos.length;
        fetchPhotos(50).then(function done() {
            $scope.layout = calculateLayout();
            if ($scope.photos.length !== photosLengthBeforeFetch &&
                $scope.layout.height - lastLayoutHeight < viewportHeight) {
                fetchLoop(defer, viewportHeight, lastLayoutHeight);
            }
            else {
                defer.resolve();
            }
        }, function fail() {
            defer.reject();
        });
        return defer.promise;
    })($q.defer(), wdViewport.height(), $scope.layout.height)
    .then(function done() {
        $scope.loaded = true;
    }, function fail() {
        $scope.loaded = false;
    });

}

function fetchPhotos(amount) {
    var defer = $q.defer();
    var params = {
        offset: 0,
        length: amount.toString()
    };
    var lastPhoto = $scope.photos[$scope.photos.length - 1];
    if (lastPhoto && lastPhoto.id) {
        params.cursor = lastPhoto.id;
        params.offset = 1;
    }
    var timeStart = (new Date()).getTime();
    Photos.query(
        params,
        function fetchSuccess(photos) {
            mergePhotos(photos);
            GA('perf:photos_query_duration:success:' + ((new Date()).getTime() - timeStart));
            defer.resolve();
        },
        function fetchError() {
            GA('perf:photos_query_duration:fail:' + ((new Date()).getTime() - timeStart));
            defer.reject();
        });
    return defer.promise;
}

// Merge latest fetched photos into existed ones.
// If there are any duplicated ones, keep only one copy.
function mergePhotos(photos) {
    if (!_.isArray(photos)) {
        photos = [photos];
    }
    photos = _.sortBy($scope.photos.concat(photos), function(photo) {
        return -photo.date_added;
    });
    $scope.photos = _.uniq(photos, function(photo) {
        return photo.id;
    });
}

function calculateLayout() {
    return PhotosLayoutAlgorithm['default']({
        fixedHeight: 170,
        minWidth: 120,
        gapWidth:  10,
        gapHeight: 10,
        borderWidth: 0,
        containerWidth: wdViewport.width() - (30 + 20) * 2,
        containerHeight: -1,
        photos: _.map($scope.photos, function(photo) {
            return {
                id: photo.id,
                width: photo.thumbnail_width,
                height: photo.thumbnail_height
            };
        })
    });
}

function layout() {
    if (!$scope.photos.length) { return; }
    $scope.$evalAsync(function() {
        $scope.$broadcast('wdp:showcase:layout', $scope.layout);
    });
}

}];
});
