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
console.log(metrics);
    var fixedHeight = metrics.fixedHeight;
    var minWidth = metrics.minWidth;
    var gapWidth = metrics.gapWidth;
    var gapHeight = metrics.gapHeight;
    var borderWidth = metrics.borderWidth;
    var containerWidth = metrics.containerWidth;
    var photos = metrics.photos;
    var defaultRatio = 3 / 2;

    _.each(photos, function(photo) {
        photo.originWidth = photo.width;
        photo.originHeight = photo.height;
        var w = photo.width;
        var h = photo.height;
        var ratio = w / h;
        h = Math.min(fixedHeight, h);
        w = Math.max(minWidth, h * ratio);
        photo.width = w;
        photo.height = fixedHeight;
    });

    var rows = [];
    var row;
    var rowWidth = 0;
    var minRowWidth = 0;
    var photo;
    for (var i = 0, l = photos.length; i < l; i += 1) {
        photo = photos[i];
        if (!rowWidth) {
            row = [];
            rows.push(row);
        }
        // row.push(photo);
        minRowWidth += (minRowWidth ? gapWidth : 0) + borderWidth * 2 + minWidth;
        rowWidth += (rowWidth ? gapWidth : 0) + borderWidth * 2 + photo.width;
// console[minRowWidth > containerWidth && row.length > 0 ? 'warn' : 'log'](rows.length, i, photo.width, minRowWidth, rowWidth, containerWidth);
        if (containerWidth < minRowWidth && row.length > 0 ||
            containerWidth < rowWidth) {
            // step back
            i -= 1;
            rowWidth = minRowWidth = 0;
        }
        else {
            row.push(photo);
        }
    }
    _.each(rows, function(row) {
        // var rowHeight = _.chain(row).pluck('height').min().value();
        var currentWidth = _.reduce(row, function(memo, photo) {
            return memo + photo.width;
        }, 0);
        var availableWidth = containerWidth - (row.length - 1) * gapWidth - row.length * 2 * borderWidth;
        var scale  = availableWidth / currentWidth;
        if (scale > 1) {
            _.each(row, function(photo) {
                photo.width = Math.round(photo.width * scale);
            });
        }
        else if (scale < 1) {
            _.chain(row)
                .filter(function(photo) {
                    return photo.width > minWidth;
                })
                .each(function(photo) {
                    photo.width = Math.round(photo.width * scale);
                });
        }
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
            fixedHeight: 170,
            minWidth: 120,
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
