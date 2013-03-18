define([
        'angular',
        'text!templates/photos/block.html',
        'jquery',
        'underscore'
    ], function(
        angular,
        template,
        jQuery,
        _
    ) {
'use strict';
return [function() {
return {

template: template,
replace: true,
restrict: 'CA',
link: function($scope, element) {
    // Element cache
    var photo = element.children('.photo');
    var image = angular.element(new Image()).appendTo(photo);

    // Selection
    $scope.$watch('isSelected(photo)', function(newValue) {
        $scope.selected = newValue;
        $scope.checkboxTipText = newValue ? $scope.$root.DICT.photos.BLOCK_DESELECT : $scope.$root.DICT.photos.BLOCK_SELECT;
    });
    // Update thumbnail
    $scope.$watch('photo.thumbnail_path', function() {
        photo.addClass('fadeIn');
        renderImage();
    });
    // Update layout
    $scope.$on('wdp:showcase:layout', function(e, layout) {
        relayout(layout.metas);
    });

    var success = false;
    $scope.cancelUpload = function() {
        if (!success) {
            $scope.photo.deferred.cancelUpload();
        }
        $scope.removeFailed($scope.photo);
    };
    $scope.retryUpload = function() {
        $scope.photo.deferred.retryUpload();
    };

    var isUpload = !!$scope.photo.deferred;
    element
        .children('.actions')
            .toggle(!isUpload)
            .end()
        .children('.wdp-progress')
            .toggle(isUpload);
    if (isUpload) {
        $scope.photo.deferred.done(function() {
            success = true;
            setTimeout(function() {
                element
                    .children('.actions')
                        .show()
                        .end()
                    .children('.wdp-progress')
                        .addClass('fadeOut')
                        .one('webkitAnimationEnd', function() {
                            angular.element(this).hide();
                        });
                setTimeout(function() {
                    element.children('.wdp-progress').remove();
                }, 400);
            }, 2000);
        });
    }

    function renderImage() {
        preloadImage($scope.photo.thumbnail_path, function(path) {
            image.attr('src', path).addClass('fadeIn');
        });
    }
    function preloadImage(path, callback) {
        var temp = new Image();
        temp.onload = function() {
            temp = temp.onload = null;
            callback(path);
        };
        temp.src = path;
    }
    function relayout(layout) {
        layout = layout[$scope.$index];
        element.css({
                left: layout.x,
                top: layout.y
            });
        photo.css({
                width: layout.width,
                height: layout.height
            });
        image.css({
            left: layout.innerX,
            top: layout.innerY
        });
    }
}

};
}];
});
