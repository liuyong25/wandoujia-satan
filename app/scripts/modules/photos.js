define([
        'angular',
        'directives/photos/showcase',
        'services/photos/photo-group',
        'directives/photos/actionbar',
        'directives/photos/slides',
        'services/photos/layout-algorithm',
        'directives/photos/block',
        'directives/photos/uploader',
        'directives/photos/frame',
        'directives/photos/progress',
        'directives/photos/repeat',
        'services/photos/image-helper',
        'services/photos/message-pusher',
        'controllers/photos/gallery',
        'modules/common',
        'modules/bootstrap',
        'modules/resources'
    ], function(
        angular,
        showcase,
        PhotoGroup,
        actionbar,
        slides,
        layoutAlgorithm,
        block,
        uploader,
        frame,
        progress,
        repeat,
        imageHelper,
        messagePusher,
        galleryController,
        common,
        bootstrap,
        resources
    ) {
'use strict';

angular.module('wdPhotos', ['wdCommon', 'wdResources', 'bootstrap'])
    .constant('WDP_LOAD_IMAGE_DELAY', 200)
    .constant('WDP_PRELOAD_IMAGE_OFFSET', 100)
    .constant('WDP_PLAYING_INTERVAL', 3000)
    .directive('wdpUploader', uploader)
    .directive('wdpShowcase', showcase)
    .directive('wdpBlock', block)
    .directive('wdpActionbar', actionbar)
    .directive('wdpSlides', slides)
    .directive('wdpFrame', frame)
    .directive('wdpProgress', progress)
    .directive('wdpRepeat', repeat)
    .factory('PhotosLayoutAlgorithm', layoutAlgorithm)
    .factory('PhotoGroup', PhotoGroup)
    .factory('wdpImageHelper', imageHelper)
    .factory('wdpMessagePusher', messagePusher)
    .controller('galleryController', galleryController);

// Suppress jshint unused warning. Forgive me...
(function() {})(common, bootstrap, resources);
});
