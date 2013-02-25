define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return [function() {
    var now = new Date().getTime();
    var aDay = 1000 * 60 * 60 * 24;
    var aWeek = aDay * 7;
    var today = Math.floor(now / aDay) * aDay;
    var yesterday = today - aDay;
    var thisWeek = Math.floor(now / aWeek) * aWeek;
    var periods = [
        {
            title: '今天',
            start: today,
            end: today + aDay - 1
        },
        {
            title: '昨天',
            start: yesterday,
            end: yesterday + aDay - 1
        },
        {
            title: '本周',
            start: thisWeek,
            end: yesterday - 1
        },
        {
            title: '上周',
            start: thisWeek - aWeek,
            end: thisWeek - 1
        },
        {
            title: '其他',
            start: 0,
            end: thisWeek - aWeek - 1
        }
    ];
    return {
        divide: function(photos) {
            if (!photos.length) {
                return [];
            }
            photos = _.sortBy(photos, function(photo) {
                return -photo.date_added;
            })
            var pointer = 0;
            var groups = [];
            _.each(periods, function(period) {
                var group = {
                    date: period.title,
                    photos: [],
                    selectedPhotos: []
                };
                var photo;
                while (pointer < photos.length) {
                    photo = photos[pointer];
                    if (photo.date_added >= period.start &&
                        photo.date_added <= period.end) {
                        group.photos.push(photo);
                        pointer += 1;
                    }
                    else {
                        break;
                    }
                }
                if (group.photos.length) {
                    groups.push(group);
                }
            });
            return groups;
        }
    };
}];
});
