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
                minRowWidth += (minRowWidth ? gapWidth : 0) + borderWidth * 2 + minWidth;
                rowWidth += (rowWidth ? gapWidth : 0) + borderWidth * 2 + photo.width;
        // console[minRowWidth > containerWidth && row.length > 0 ? 'warn' : 'log'](rows.length, i, photo.width, minRowWidth, rowWidth, containerWidth);
                // cw < mw < w, full, drop the last and start a new row
                if (minRowWidth > containerWidth) {
                    // side case that containerWidth is extremely narrow
                    if (row.length === 0) {
                        row.push(photo);
                    }
                    else {
                        // step back
                        i -= 1;
                    }
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
            _.each(rows, function(row, i) {
                // var rowHeight = _.chain(row).pluck('height').min().value();
                var currentWidth = _.reduce(row, function(memo, photo) {
                    return memo + photo.width;
                }, 0);
        // console.log(minWidth * row.length, currentWidth);
                var availableWidth = containerWidth - (row.length - 1) * gapWidth - row.length * 2 * borderWidth;
                var deltaWidth = availableWidth - currentWidth;
                var scale  = availableWidth / currentWidth;
                if (scale > 1) {
                    // last row should not need scale.
                    if (i !== rows.length - 1) {
                        _.each(row, function(photo) {
                            photo.width = Math.round(photo.width * scale);
                        });
                    }
                }
                else if (scale < 1) {
                    var shrinkablePhoto = _.filter(row, function(photo) {
                        return photo.width > minWidth;
                    });
                    var shrinkablePhotoWidth = _.reduce(shrinkablePhoto, function(sum, photo) {
                        return sum + photo.width;
                    }, 0);
                    var shrinkScale = (shrinkablePhotoWidth + deltaWidth) / shrinkablePhotoWidth;
                    _.each(shrinkablePhoto, function(photo) {
                        photo.width = Math.round(photo.width * shrinkScale);
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
    };
}];
});
