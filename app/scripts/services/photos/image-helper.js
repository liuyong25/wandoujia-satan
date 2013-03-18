define([
        'jquery'
    ], function(
        jQuery
    ) {
'use strict';
return [function() {
    // When done, resolve by image.
    function preload(url, onload) {
        var TIMEOUT = 5000;
        var image = new Image();
        var defer = jQuery.Deferred();
        var promise = defer.promise();
        var timeout;

        if (onload) {
            promise.done(onload);
        }

        image.onload = function() {
            image.onerror = image.onload = null;
            clearTimeout(timeout);
            defer.resolve(image);
        };
        image.onerror = function() {
            image.onerror = image.onload = null;
            clearTimeout(timeout);
            defer.resolve('error');
        };

        image.src = url;

        // timeout = setTimeout(function() {
        //     image.onerror = image.onload = null;
        //     defer.reject('timeout');
        // }, TIMEOUT);

        return promise;
    }

    // When done, resolve by dataURI
    function canvasResize(source, width, height, outputType) {
        outputType = outputType || 'image/jpeg';
        if (typeof source !== 'string' && !(source instanceof Image)) {
            throw new Error('Source must be url or <img>');
        }
        var defer = jQuery.Deferred();
        jQuery.when(typeof source === 'string' ? preload(source) : source)
            .done(function(image) {
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, width, height);
                defer.resolve(canvas.toDataURL(outputType));
            })
            .fail(function() {
                defer.reject('image error');
            });
        return defer.promise();
    }

    return {
        preload: preload,
        canvasResize: canvasResize
    };
}];
});
