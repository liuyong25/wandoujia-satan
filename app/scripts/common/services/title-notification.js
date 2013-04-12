define([], function() {
'use strict';
return ['$window', function($window) {
    var timer;
    var speed = 1500;
    var endChar = '... ';
    var pos = 0;
    var originPageTitle = $window.document.title;
    var notificationTitle = '';

    var notification = {
        notify: function(message) {
            if (timer) { return; }
            notificationTitle = message;
            moveTitle();
        },
        restore: function() {
            $window.document.title = originPageTitle;
            clearTimeout(timer);
            timer = null;
            pos = 0;
        }
    };

    function moveTitle() {
        var ml = notificationTitle.length;

        var title = pos % 2 ? notificationTitle : originPageTitle;
        $window.document.title = title;

        pos += 1;
        if (pos > ml) {
            pos=0;
        }
        timer = setTimeout(function() {
            moveTitle();
        },speed);
    }

    return notification;
}];
});
