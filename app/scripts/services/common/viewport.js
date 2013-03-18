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
    var $doc = jQuery($window.document.body);

    var width = null;
    var height = null;
    var top = null;
    var left = null;

    var resizeDirty = true;
    var scrollDirty = true;

    $win
        .on('resize', _.debounce(function() {
            resizeDirty = true;
            $watcher.trigger('width', [width]);
            $watcher.trigger('height', [height]);
            $watcher.trigger('resize', [width, height]);
        }, 1000))
        .on('scroll', _.throttle(function() {
            scrollDirty = true;
            $watcher.trigger('top', [top]);
            $watcher.trigger('left', [left]);
            $watcher.trigger('scroll', [top, left]);
        }, 300));

    function updateDimensions() {
        if (resizeDirty) {
            resizeDirty = false;
            width = $win.width();
            height = $win.height();
        }
    }
    function updateOffset() {
        if (scrollDirty) {
            scrollDirty = false;
            left = $win.scrollLeft();
            top = $win.scrollTop();
        }
    }

    return {
        width: function() {
            updateDimensions();
            return width;
        },
        height: function() {
            updateDimensions();
            return height;
        },
        top: function() {
            updateOffset();
            return top;
        },
        left: function() {
            updateOffset();
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
