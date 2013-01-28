define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return [function() {
    return {
        'default': function(metrics) {
            var fixedHeight = metrics.fixedHeight;
            var minWidth = metrics.minWidth;
            var gapWidth = metrics.gapWidth;
            var gapHeight = metrics.gapHeight;
            var borderWidth = metrics.borderWidth;
            var containerWidth = metrics.containerWidth;
            var photos = metrics.photos;
            // var defaultRatio = 3 / 2;

            // Scale each photo to max(minWidth, scaledWidth) * fixedHeight
            _.each(photos, function(photo) {
                // Keep original dimensions.
                photo.originWidth = photo.width;
                photo.originHeight = photo.height;
                var w = photo.width;
                var h = photo.height;
                var ratio = w / h;
                // Keep the photo unscaled which height less than fixedHeight.
                if (h > fixedHeight) {
                    w = Math.round(h * ratio);
                }
                photo.width = Math.max(w, minWidth);
                photo.height = fixedHeight;
            });

            // Divide photos into several rows.
            // Each row must has the following definitions:
            // 1. rowWidth, the sum of width of all photos in the row.
            // 2. minRowWidth, the sum of minWidth of all photos in the row.
            // Then must satisfy the following conditions:
            // 1. minRowWidth < containerWidth < rowWidth;\
            // So that we can guarantee all rows can be scaled into the same with of container perfectly.
            var rows = [];
            var row;
            var rowWidth = 0;
            var minRowWidth = 0;
            var photo;
            for (var i = 0, l = photos.length; i < l; i += 1) {
                photo = photos[i];
                if (!rowWidth) {
                    // Start a new row.
                    row = [];
                    rows.push(row);
                }
                rowWidth    += (rowWidth    ? gapWidth : 0) + borderWidth * 2 + photo.width;
                minRowWidth += (minRowWidth ? gapWidth : 0) + borderWidth * 2 + minWidth;
                // console[minRowWidth > containerWidth && row.length > 0 ? 'warn' : 'log'](rows.length, i, photo.width, minRowWidth, rowWidth, containerWidth);
                // When cw < mw < w, full, drop the current and start a new row
                if (minRowWidth > containerWidth) {
                    // Side case that containerWidth is extremely narrow.
                    // Prevent infinity loop.
                    if (row.length === 0) {
                        row.push(photo);
                    }
                    else {
                        // step back
                        i -= 1;
                    }
                    // Clear to indicate a new row started.
                    rowWidth = minRowWidth = 0;
                }
                // mw < w < cw, spare, can contain more
                else if (rowWidth < containerWidth) {
                    row.push(photo);
                }
                // mw < cw < w, full, start a new row
                else {
                    row.push(photo);
                    rowWidth = minRowWidth = 0;
                }
            }

            // Scale each row to fix with container width.
            _.each(rows, function(row, i) {
                // Each row should have the following definitions:
                // 1. currentWidth, sum of width of all photos in the row.
                // 2. availableWidth, containerWidth exclude the gaps and borders,
                //     the real space for photos.
                // 3. deltaWidth, the gap between availableWidth and currentWidth,
                //     may be positive or negative.
                var currentWidth = _.reduce(row, function(sum, photo) {
                    return sum + photo.width;
                }, 0);
                var availableWidth = containerWidth - (row.length - 1) * gapWidth - row.length * 2 * borderWidth;
                var deltaWidth = availableWidth - currentWidth;
                var scale  = availableWidth / currentWidth;
                if (scale > 1) {
                    // Scale up every photo in the row.
                    // But last row need no scale.
                    if (i !== rows.length - 1) {
                        _.each(row, function(photo) {
                            photo.width = Math.round(photo.width * scale);
                        });
                    }
                }
                else if (scale < 1) {
                    deltaWidth = -deltaWidth;
                    // Scale down photos.
                    // We can only scale photos whose width larger than minWidth.
                    // Filter them out first.
                    var shrinkablePhoto = _.filter(row, function(photo) {
                        return photo.width > minWidth;
                    });
                    // Sum up the shrinkable space.
                    // The result should equal or larger than deltaWidth, according to previous process.
                    var shrinkablePhotoWidth = _.reduce(shrinkablePhoto, function(sum, photo) {
                        return sum + photo.width - minWidth;
                    }, 0);
                    var shrinkScale = deltaWidth / shrinkablePhotoWidth;
                    _.each(shrinkablePhoto, function(photo) {
                        photo.width = Math.round(photo.width - (photo.width - minWidth) * shrinkScale);
                    });
                }
            });
            var metas = [];
            var height = 0;
            // Calculate offset for each photo.
            _.each(rows, function(row) {
                var left = 0;
                var top = height;
                _.each(row, function(photo) {
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
    };
}];
});
