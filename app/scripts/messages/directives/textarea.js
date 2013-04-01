define([], function() {
'use strict';
return [function() {
return {

link: function(scope, element) {
    element.on('keydown', function(e) {
        var isNewLine = false;
        var rows = 1;

        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            element.attr('rows', 1);
            element.trigger('submit');
            return;
        }

        if (e.shiftKey && e.which === 13) {
            isNewLine = true;
        }

        rows = element[0].value.split('\n').length + (isNewLine ? 1 : 0);
        rows = Math.min(rows, 4);
        element.attr('rows', rows);
    });
}

};
}];
});
