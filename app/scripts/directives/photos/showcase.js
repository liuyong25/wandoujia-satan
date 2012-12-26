define([
        'text!templates/photos/showcase.html',
        'underscore',
        'angular'
    ], function(
        template,
        _,
        angular
    ) {
'use strict';

function defaultLayoutAlgorithm(metrics) {
    var gapWidth = metrics.gapWidth;
    var gapHeight = metrics.gapHeight;
    var borderWidth = metrics.borderWidth;
    var containerWidth = metrics.containerWidth;
    var photos = metrics.photos;
    var defaultRatio = 3 / 2;

    // Keep each photo by w / h ratio between 1 / defaultRatio to defaultRatio
    _.each(photos, function(photo) {
        photo.originWidth = photo.width;
        photo.originHeight = photo.height;
        if (photo.width + borderWidth * 2 >= containerWidth) {
            return;
        }
        var w = photo.width;
        var h = photo.height;
        var ratio = w / h;
        if (ratio > defaultRatio) {
            photo.width = h * defaultRatio;
        }
        else if (ratio < 1 / defaultRatio) {
            photo.height = w * defaultRatio;
        }
    });

    var rows = [];
    var row;
    var rowWidth = 0;
    _.each(photos, function(photo) {
        if (photo.width + borderWidth * 2 >= containerWidth) {
            rows.splice(Math.max(0, rows.length - 2), 0, [photo]);
        }
        else {
            if (!rowWidth) {
                rows.push(row = []);
            }
            row.push(photo);
            rowWidth += (rowWidth ? gapWidth : 0) + borderWidth * 2 + photo.width;
            if (rowWidth >= containerWidth) {
                rowWidth = 0;
            }
        }
    });
    _.each(rows, function(row) {
        var rowHeight = _.chain(row).pluck('height').min().value();
        var currentWidth = _.reduce(row, function(memo, photo) { return memo + photo.width; }, 0);
        var availableWidth = containerWidth - (row.length - 1) * gapWidth - row.length * 2 * borderWidth;
        var scale  = availableWidth / currentWidth;
        _.each(row, function(photo) {
            if (scale < 1) {
                photo.width = Math.round(photo.width * scale);
            }
            photo.height = rowHeight;
        });
    });
    var metas = [];
    var height = 0;
    _.each(rows, function(row, i) {
        var left = 0;
        var top = height;
        _.each(row, function(photo, j) {
            metas.push({
                id: photo.id,
                x: left,
                y: top,
                innerX: (photo.width - photo.originWidth) / 2,
                innerY: (photo.height - photo.originHeight) / 2,
                width: photo.width,
                height: photo.height
            });
            left += 2 * borderWidth + photo.width;
            if (left > containerWidth) {
                metas[metas.length - 1].width -= left - containerWidth;
            }
            left += gapWidth;
        });
        height = top + row[0].height + 2 * borderWidth + gapHeight;
    });

    return {
        height: height,
        metas: metas
    };
}

var layoutController = ['$scope', '$window', function($scope, $window) {
    $scope.relayout = function() {
        if (!$scope.photos.length) {
            return;
        }
        $scope.layout = defaultLayoutAlgorithm({
            gapWidth: 12,
            gapHeight: 35,
            borderWidth: 5,
            containerWidth: angular.element('.showcases-container').width() - 20 - 40,
            containerHeight: -1,
            photos: _.map($scope.photos, function(photo) {
                return {
                    id: photo.id,
                    width: photo.width,
                    height: photo.height
                };
            })
        });

        $scope.datePosition = {
            top: $scope.layout.metas[0].height / 2 - 20 / 2
        };
    };

    $scope.createBlockPosition = function() {
        var meta = $scope.layout.metas[this.$index];
        return {
            left: meta.x + 40,
            top: meta.y
        };
    };
    $scope.createPhotoDimensions = function() {
        var meta = $scope.layout.metas[this.$index];
        return {
            width: meta.width,
            height: meta.height
        };
    };
    $scope.createImagePosition = function() {
        var meta = $scope.layout.metas[this.$index];
        return {
            left: meta.innerX,
            top: meta.innerY
        };
    };
}];

return [function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            date: '@',
            photos: '='
        },
        controller: layoutController,
        template: template,
        link: function(scope, element, attrs) {
            function layout() {
                scope.relayout();
                if (scope.layout) {
                    element.height(scope.layout.height);
                }
            }
            var relayout = _.debounce(function() {
                scope.$apply(layout);
            }, 1000);

            angular.element(window).on('resize', relayout);
            element.on('$destory', function() {
                angular.element(window).off('resize', relayout);
            });

            scope.$watch('photos', function() {
                layout();
            });
        }
    };
}];


});
