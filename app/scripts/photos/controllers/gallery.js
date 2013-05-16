define([
    'underscore',
    'text!templates/photos/extension-notification.html',
    'angular'
], function(
    _,
    extensionNotificationTemplate,
    angular
) {
'use strict';
return [
        '$scope', '$window', 'Photos', '$log', '$route', '$location', 'wdAlert', 'wdpPhotos',
        'wdViewport', 'GA', 'PhotosLayoutAlgorithm', '$q', 'wdNotification',
function($scope,  $window,    Photos,   $log,   $route,   $location,   wdAlert,   wdpPhotos,
         wdViewport,   GA,   PhotosLayoutAlgorithm,   $q,   wdNotification) {

$scope.firstScreenLoaded = false;
$scope.loaded = false;
$scope.allLoaded = false;
$scope.layout = null;
$scope.previewPhoto = null;

// A temp solution.
// Delegate '$scope.photos' to 'wdpPhotos.photos'
Object.defineProperty($scope, 'photos', {
    get: function() { return wdpPhotos.collection; },
    set: function(photos) { wdpPhotos.collection = photos; }
});

// Layout when photos amount change. Not a robust way...
$scope.$watch('photos.length', layout);

wdViewport.on('resize', function() {
    $scope.$apply(layout);
});

if ($route.current.params.preview) {
    Photos.get(
        { id: $route.current.params.preview },
        function(photo) {
            $location.search('preview', null).replace();
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

var chromeExtensionNotification;
if ($window.chrome &&
    $window.chrome.webstore &&
    !localStorage.getItem('photosExtensionInstalled') &&
    !angular.element($window.document.documentElement).hasClass('photos-extension-installed')) {
    chromeExtensionNotification = setTimeout(function() {
        wdNotification.notify($scope, extensionNotificationTemplate)
            .then(null, function() {
                localStorage.setItem('photosExtensionInstalled', true);
            });
    }, 3000);
}

wdpPhotos.on('add.wdp', function(e, p) {
    // do nothing...
}).on('remove.wdp', function(e, p) {
    $scope.$broadcast('wdp:photos:remove', [p]);
});

$scope.preview = function(photo) {
    if (photo.path) {
        $scope.previewPhoto = photo;
    }
};
$scope.download = function(photo) {
    var f = $window.document.createElement('iframe');
    f.style.width = '1px';
    f.style.height = '1px';
    f.style.margin = '0 -1px -1px 0';
    f.style.visibility = 'hidden';
    $window.document.body.appendChild(f);
    setTimeout(function() {
        $window.document.body.removeChild(f);
        f = f.src = null;
    }, 2000);
    f.src = photo.path;
    // $window.open(photo.path, '_self');
};
$scope['delete'] = function(photo) {
    return wdAlert.confirm(
            $scope.$root.DICT.photos.CONFIRM_DELETE_TITLE,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CONTENT,
            $scope.$root.DICT.photos.CONFIRM_DELETE_OK,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CANCEL
        ).then(function() {
        $scope.removePhotos(photo);
        $scope.$broadcast('wdp:photos:remove', [photo]);
    });
};
$scope.removePhotos = function(photos) {
    if (!_.isArray(photos)) {
        photos = [photos];
    }
    _.each(photos, function(photo) {
        exclude($scope.photos, photo);
        photo.$remove();
    });
};
$scope.removeFailed = function(photo) {
    exclude($scope.photos, photo);
};
$scope.startUpload = function(file) {
    var photo;
    // Insert a photo placeholder.
    file.photo.then(function(data) {
        photo = new Photos({
            'id': _.uniqueId('WDP_MERGE_'),
            'thumbnail_path': data.dataURI,
            'thumbnail_width': data.width,
            'thumbnail_height': data.height,
            'deferred': file.upload
        });
        $scope.photos.unshift(photo);
    });
    // After uploaded, fetch the real photo data and merge into placeholder.
    file.upload.then(function(res) {
        photo.id = res[0].id;
        Photos.get({id: res[0].id}, function(newPhoto) {
            _.extend(photo, newPhoto);
            mergePhotos(newPhoto);
        });
    });
};
$scope.fetch = function() {
    loadScreen();
};

$scope.$on('$destroy', function() {
    clearTimeout(chromeExtensionNotification);
    wdpPhotos.off('.wdp');
});

//==========================================================================
function loadScreen() {
    $scope.loaded = false;
    (function fetchLoop(defer, viewportHeight, lastLayoutHeight) {
        calculateLayout();
        if ($scope.layout && $scope.layout.height - lastLayoutHeight >= viewportHeight) {
            defer.resolve();
        }
        else {
            var photosLengthBeforeFetch = $scope.photos.length;
            fetchPhotos(30).then(function done(allLoaded) {
                var newPhotosLength = $scope.photos.length - photosLengthBeforeFetch;
                if (newPhotosLength === 0 || allLoaded) {
                    $scope.allLoaded = true;
                    defer.resolve();
                }
                else {
                    fetchLoop(defer, viewportHeight, lastLayoutHeight);
                }
            }, function fail() {
                defer.reject();
            });
        }
        return defer.promise;
    })($q.defer(), wdViewport.height(), $scope.layout ? $scope.layout.height : 0)
    .then(function done() {
        $scope.firstScreenLoaded = true;
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
    // If photos.length equals 1.
    // It may be preview mode which will load 1 photo first.
    // Or there may be only 1 photo of user, on which situation,
    // loading from first does not matter.
    if ($scope.photos.length > 1 && lastPhoto.id) {
        params.cursor = lastPhoto.id;
        params.offset = 1;
    }
    var timeStart = (new Date()).getTime();
    Photos.query(
        params,
        function fetchSuccess(photos, headers) {
            mergePhotos(photos);
            GA('perf:photos_query_duration:success:' + ((new Date()).getTime() - timeStart));
            defer.resolve(headers('WD-Need-More') === 'false');
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
        return 'date_added' in photo ? -photo.date_added : Number.NEGATIVE_INFINITY;
    });
    $scope.photos = _.uniq(photos, function(photo) {
        return photo.id;
    });
}

function calculateLayout() {
    $scope.layout = PhotosLayoutAlgorithm['default']({
        fixedHeight: 170,
        minWidth: 120,
        gapWidth:  10,
        gapHeight: 10,
        borderWidth: 0,
        containerWidth: wdViewport.width() - 60 - 10 - 20,
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
    if (!$scope.photos.length) {
        $scope.layout = { height: 0};
    }
    else {
        calculateLayout();
    }
    $scope.$evalAsync(function() {
        $scope.$broadcast('wdp:showcase:layout', $scope.layout);
    });
}

function exclude(collection, item) {
    return collection.splice(_.indexOf(collection, item), 1);
}


$scope.installChromeExtension = function() {
    $window.chrome.webstore.install();
};

}];
});
