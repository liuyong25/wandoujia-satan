define([
        'plupload'
    ], function(
        plupload
    ) {
'use strict';

return [function() {
    return {
        scope: {
            uploaded: '&onUploaded'
        },
        link: function($scope, element, attrs) {
            var uploader = new plupload.Uploader({
                url: 'test',
                runtimes: 'html5, html4',
                container: attrs.containerId,
                'browse_button': attrs.browseButtonId,
                'drop_element': element.attr('id'),
                'multi_selection': false
            });
            uploader.bind('Init', function(up, params) {
                console.log(params.runtime);
            });
            uploader.init();
            uploader.bind('FilesAdded', function(up, files) {
                console.log(files);
                up.start();
            });
            uploader.bind('UploadProgress', function(up, file) {
                console.log(file);
            });
            uploader.bind('Error', function(up, err) {
                console.log(err);
            });
            uploader.bind('FileUploaded', function(up, file, info) {
                $scope.uploaded({file: info.response.id});
            });
        }
    };
}];
});
