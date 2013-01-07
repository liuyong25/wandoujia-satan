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
            selectionType:  '=',
            count:          '=',
            pickDate:       '&onPickDate',
            upload:         '&onUpload',
            selectAll:      '&onSelectAll',
            'delete':       '&onDelete',
            download:       '&onDownload',
            share:          '&onShare'
        }
    };
}];
});
