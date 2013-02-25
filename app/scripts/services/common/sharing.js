define([], function() {
'use strict';
return ['$window', function($window) {
    return {
        weibo: function(photo) {
            $window.open('http://service.weibo.com/share/share.php?appkey=1483181040&relateUid=1727978503&title='+encodeURIComponent(photo.display_name)+'&url=&pic='+encodeURIComponent(photo.path));
        }
    };
}];
});
