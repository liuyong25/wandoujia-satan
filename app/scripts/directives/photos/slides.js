define([
        'text!templates/photos/slides.html',
        'underscore'
    ], function(
        template,
        _
    ) {
'use strict';
return ['WDP_PLAYING_INTERVAL', function(WDP_PLAYING_INTERVAL) {
    return {
        template: template,
        replace: true,
        controller: ['$scope', function($scope) {
                $scope.playing = null;
                $scope.play = function() {
                    if ($scope.playing !== null) {
                        $scope.pause();
                        return;
                    }
                    $scope.playing = setInterval(function() {
                        if ($scope.index < $scope.photos.length - 1) {
                            $scope.next();
                        }
                        else {
                            $scope.pause();
                        }
                    }, WDP_PLAYING_INTERVAL);
                };
                $scope.pause = function() {
                    clearInterval($scope.playing);
                    $scope.playing = null;
                };
                $scope.next = function() {
                    $scope.current = $scope.photos[_.indexOf($scope.photos, $scope.current) + 1];
                };
                $scope.previous = function() {
                    $scope.index -= 1;
                    $scope.current = $scope.photos[_.indexOf($scope.photos, $scope.current) - 1];
                };
                $scope.hasNext = function() {
                    return _.indexOf($scope.photos, $scope.current) < $scope.photos.length - 1;
                };
                $scope.hasPrevious = function() {
                    return _.indexOf($scope.photos, $scope.current) > 0;
                };
                $scope.close = function() {
                    $scope.current = null;
                    $scope.index = null;
                };
                $scope.remove = function() {
                    $scope['delete']({photo: $scope.current});
                    $scope.close();
                };
            }],
        scope: {
            current: '=',
            photos: '=',
            'delete': '&onDelete',
            download: '&onDownload',
            share: '&onShare'
        }
    };
}];
});
