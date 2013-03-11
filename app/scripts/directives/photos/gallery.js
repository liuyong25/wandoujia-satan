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
    $scope.selectAll = function() {
        if ($scope.selectedPhotos.length === $scope.photos.length) {
            $scope.selectedPhotos = [];
            GA('photos:toolbar:deselect_all');
        }
        else {
            $scope.selectedPhotos = $scope.photos.slice();
            GA('photos:toolbar:select_all');
        }
    };
    $scope.select = function(photo) {
        $scope.selectedPhotos.push(photo);
    };
    $scope.deselect = function(photo) {
        $scope.selectedPhotos.splice(_.indexOf($scope.selectedPhotos, photo), 1);
    };
    $scope.$on('wdp:photos:deselect', function(e, photos) {
        _.each(photos, function(photo) {
            $scope.deselect(photo);
        });
    });
    $scope.$on('wdp:photos:select', function(e, photos) {
        _.each(photos, $scope.select);
    });

    // Removal logic, delegate real removal to $scope.removePhotos.
    $scope['delete'] = function(photo) {
        return confirm().then(function() {
            $scope.removePhotos(photo);
            $scope.deselect(photo);
        });
    };
    $scope.deleteSelected = function() {
        return confirm().then(function() {
            $scope.removePhotos($scope.selectedPhotos);
            $scope.selectedPhotos = [];
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
