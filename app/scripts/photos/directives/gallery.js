define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return [function() {
return {

scope: true,
controller: ['$scope', 'GA', 'wdAlert', function($scope, GA, wdAlert) {
    // Selection logic.
    $scope.selectedPhotos = [];
    $scope.lastSelectedPhoto = null;

    $scope.isSelected = function(photo) {
        return _.indexOf($scope.selectedPhotos, photo) >= 0;
    };
    $scope.toggleSelected = function(selected, photo) {
        if (selected) {
            $scope.select(photo);
            GA('photos:photo:select');
        }
        else {
            $scope.deselect(photo);
            GA('photos:photo:deselect');
        }
    };
    $scope.deselectAll = function() {
        $scope.selectedPhotos = [];
        $scope.lastSelectedPhoto = null;
        GA('photos:toolbar:deselect_all');
    };
    $scope.select = function(photo) {
        $scope.selectedPhotos.push(photo);
    };
    $scope.batchSelect = function(photo, shiftKey) {
        if (!shiftKey) {
            $scope.lastSelectedPhoto = photo;
        }
        else {
            var startIndex = Math.max($scope.photos.indexOf($scope.lastSelectedPhoto), 0);
            var stopIndex = $scope.photos.indexOf(photo);
            $scope.photos.slice(Math.min(startIndex, stopIndex), Math.max(startIndex, stopIndex) + 1).forEach(function(p) {
                if (!$scope.isSelected(p)) {
                    $scope.selectedPhotos.push(p);
                }
            });
        }
    };
    $scope.deselect = function(photo) {
        $scope.selectedPhotos.splice(_.indexOf($scope.selectedPhotos, photo), 1);
        if ($scope.lastSelectedPhoto === photo) {
            $scope.lastSelectedPhoto = null;
        }
    };
    $scope.$on('wdp:photos:remove', function(e, photos) {
        _.each(photos, function(photo) {
            $scope.deselect(photo);
        });
    });

    // Removal logic, delegate real removal to $scope.removePhotos.
    $scope.deleteSelected = function() {
        return confirm().then(function() {
            $scope.removePhotos($scope.selectedPhotos);
            $scope.selectedPhotos = [];
            $scope.lastSelectedPhoto = null;
        });
    };

    // Utils
    function confirm() {
        return wdAlert.confirm(
            $scope.$root.DICT.photos.CONFIRM_DELETE_TITLE,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CONTENT,
            $scope.$root.DICT.photos.CONFIRM_DELETE_OK,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CANCEL
        );
    }
}],
link: function() {
}

};
}];
});
