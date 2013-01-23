define([
        'plupload',
        'jquery',
        'underscore'
    ], function(
        plupload,
        jQuery,
        _
    ) {
'use strict';

return ['$q', 'wdDev', function($q, wdDev) {
    return {
        scope: {
            startUpload: '&onStartUpload'
        },
        link: function($scope, element, attrs) {
            var uploader = new plupload.Uploader({
                url: wdDev.getServer() + wdDev.getAPIPrefix() + '/directive/photos/upload',
                runtimes: 'html5, html4',
                container: attrs.containerId,
                'browse_button': attrs.browseButtonId,
                'drop_element': element.attr('id'),
                'multi_selection': false
            });
            uploader.init();
            uploader.bind('FilesAdded', function(up, files) {
                files = _.map(files, function(file) {
                    var deferred = $q.defer();
                    var data = {};
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        reader.onload = null;
                        var image = new Image();
                        image.onload = function() {
                            image.onload = null;
                            data.width = image.width;
                            data.height = image.height;
                            if (data.height > 170) {
                                data.width *= 170 / data.height;
                                data.height = 170;
                                var canvas = document.createElement('canvas');
                                canvas.width = data.width;
                                canvas.height = data.height;
                                var ctx = canvas.getContext('2d');
                                ctx.drawImage(image, 0, 0, data.width, data.height);
                                data.dataURI = canvas.toDataURL('image/jpeg');
                            }
                            else {
                                data.dataURI = e.target.result;
                            }

                            $scope.$apply(function() {
                                deferred.resolve(data);
                            });
                        };
                        image.src = e.target.result;
                    };
                    reader.onerror = function() {
                        reader.onerror = null;
                        $scope.$apply(function() {
                            deferred.reject('something wrong.');
                        });
                    };
                    reader.readAsDataURL(file.nativeFile);
                    file.deferred = jQuery.Deferred();
                    return {
                        file: file,
                        data: deferred.promise,
                        uploading: file.deferred.promise()
                    };
                });
                $scope.startUpload({files: files});
                up.start();
            });
            uploader.bind('UploadProgress', function(up, file) {
                $scope.$apply(function() {
                    $scope.$evalAsync(function() {
                        file.deferred.notify(file.percent);
                    });
                });
            });
            uploader.bind('FileUploaded', function(up, file, info) {
                $scope.$apply(function() {
                    $scope.$evalAsync(function() {
                        file.deferred.resolve(jQuery.parseJSON(info.response));
                    });
                });
            });
            uploader.bind('Error', function(up, err) {
                $scope.$apply(function() {
                    $scope.$evalAsync(function() {
                        err.file.deferred.reject(err);
                    });
                });
            });
        }
    };
}];
});
