define([
    'angular',
    'photos/directives/showcase',
    'photos/directives/actionbar',
    'photos/directives/slides',
    'photos/services/layout-algorithm',
    'photos/directives/block',
    'photos/directives/uploader',
    'photos/directives/frame',
    'photos/directives/progress',
    'photos/directives/repeat',
    'photos/services/image-helper',
    'photos/services/message-pusher',
    'photos/controllers/gallery',
    'photos/directives/gallery',
    'common/main',
    'common/resources',
    'photos/services/photos'
], function(
    angular,
    showcase,
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
    gallery,
    common,
    resources,
    photos
) {
'use strict';
// jshint unused:false
angular.module('wdPhotos', ['wdCommon', 'wdResources'])
    .constant('WDP_LOAD_IMAGE_DELAY', 200)
    .constant('WDP_PRELOAD_IMAGE_OFFSET', 100)
    .constant('WDP_PLAYING_INTERVAL', 3000)
    .directive('wdpUploader', uploader)
    .directive('wdpGallery', gallery)
    .directive('wdpShowcase', showcase)
    .directive('wdpBlock', block)
    .directive('wdpActionbar', actionbar)
    .directive('wdpSlides', slides)
    .directive('wdpFrame', frame)
    .directive('wdpProgress', progress)
    .directive('wdpRepeat', repeat)
    .factory('PhotosLayoutAlgorithm', layoutAlgorithm)
    .factory('wdpPhotos', photos)
    .factory('wdpImageHelper', imageHelper)
    .factory('wdpMessagePusher', messagePusher)
    .controller('galleryController', galleryController);

});
