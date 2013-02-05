define([
        'jquery',
        'underscore'
    ], function(
        jQuery,
        _
    ) {
'use strict';
return ['$window', function($window) {
    var $watcher = jQuery({});
    var $win = jQuery($window);
    var $doc = jQuery($window.document);

    var width = null;
    var height = null;
    var top = null;
    var left = null;

    var cachedWidth = width;
    var cachedHeight = height;
    var cachedTop = top;
    var cachedLeft = left;

    $win
        .on('resize', _.debounce(function() {
            var dirty = false;
            cachedWidth = width;
            width = $win.width();
            cachedHeight = height;
            height = $win.height();
            if (width !== cachedWidth) {
                dirty = true;
                $watcher.trigger('width', [width]);
            }
            if (height !== cachedHeight) {
                dirty = true;
                $watcher.trigger('height', [height]);
            }
            if (dirty) {
                $watcher.trigger('resize', [width, height]);
            }
        }, 1000))
        .on('scroll', _.throttle(function() {
            var dirty = false;
            cachedTop = top;
            top = $win.scrollTop();
            cachedLeft = left;
            left = $win.scrollLeft();
            if (top !== cachedTop) {
                dirty = true;
                $watcher.trigger('top', [top]);
            }
            if (left !== cachedLeft) {
                dirty = true;
                $watcher.trigger('left', [left]);
            }
            if (dirty) {
                $watcher.trigger('scroll', [top, left]);
            }
        }, 300));

    return {
        width: function() {
            if (width === null) {
                width = $win.width();
            }
            return width;
        },
        height: function() {
            if (height === null) {
                height = $win.height();
            }
            return height;
        },
        top: function() {
            if (top === null) {
                top = $win.scrollTop();
            }
            return top;
        },
        left: function() {
            if (left === null) {
                left = $win.scrollLeft();
            }
            return left;
        },
        docWidth: function() {
            return $doc.width();
        },
        docHeight: function() {
            return $doc.height();
        },
        on: function() {
            $watcher.on.apply($watcher, arguments);
            return this;
        },
        off: function() {
            $watcher.off.apply($watcher, arguments);
            return this;
        }
    };
}];
});
