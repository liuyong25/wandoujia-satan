define([
        'text!templates/photos/actionbar.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        replace: true,
        template: template,
        scope: {
            photos:         '=',
            selectedPhotos: '=',
            pickDate:       '&onPickDate',
            startUpload:    '&onStartUpload',
            selectAll:      '&onSelectAll',
            'delete':       '&onDelete',
            download:       '&onDownload',
            share:          '&onShare'
        },
        link: function($scope) {
            $scope.onStartUpload = function(files) {
                $scope.startUpload({files: files});
            }
        }
    };
}];
});
