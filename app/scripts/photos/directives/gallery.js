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
    $scope.lastSelectedPhoto = null;

    $scope.selectedPhotos = function() {
        return $scope.photos.filter($scope.isSelected);
    };
    $scope.isSelected = function(photo) {
        return !!photo.selected;
    };
    $scope.deselectAll = function() {
        $scope.photos.forEach(function(p) {
            p.selected = false;
        });
        $scope.lastSelectedPhoto = null;
        GA('photos:toolbar:deselect_all');
    };
    $scope.select = function(photo, shiftKey) {
        if (photo.selected) {
            GA('photos:photo:select');
        }
        else {
            GA('photos:photo:deselect');
        }

        if (photo.selected && shiftKey) {
            var startIndex = Math.max($scope.photos.indexOf($scope.lastSelectedPhoto), 0);
            var stopIndex = $scope.photos.indexOf(photo);
            $scope.photos.slice(Math.min(startIndex, stopIndex), Math.max(startIndex, stopIndex) + 1).forEach(function(p) {
                p.selected = true;
            });
        }
        if (!photo.selected && photo === $scope.lastSelectedPhoto) {
            var index = $scope.photos.indexOf(photo);
            var cursor = null;
            var i, p;
            for (i = index + 1; i < $scope.photos.length; i += 1) {
                p = $scope.photos[i];
                if (p.selected) {
                    cursor = p;
                    break;
                }
            }
            if (!cursor) {
                for (i = index - 1; i >= 0; i -= 1) {
                    p = $scope.photos[i];
                    if (p.selected) {
                        cursor = p;
                        break;
                    }
                }
            }
            $scope.lastSelectedPhoto = cursor;
        }
        if (photo.selected) {
            $scope.lastSelectedPhoto = photo;
        }
    };

    // Removal logic, delegate real removal to $scope.removePhotos.
    $scope.deleteSelected = function() {
        return confirm().then(function() {
            $scope.removePhotos($scope.selectedPhotos());
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
