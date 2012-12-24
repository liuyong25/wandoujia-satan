define([
        'angular',
        'directives/photos/showcase'
    ], function(
        angular,
        showcase
    ) {
'use strict';
angular.module('wdjPhotos', [])
    .directive('wdShowcase', showcase);
});
