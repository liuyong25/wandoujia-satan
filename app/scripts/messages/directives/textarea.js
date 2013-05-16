define([], function() {
'use strict';
return ['GA', function(GA) {
return {

link: function(scope, element, attributes) {
    if (!element.attr('placeholder')) {
        attributes.$observe('placeholder', function(value) {
            element.attr('placeholder', value);
        });
    }
    element.on('keydown', function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            element.attr('rows', 1);
            element.trigger('submit');
            return;
        }
    });
    element.on('focus', function() {
        GA('messages:focus_editor');
    });
}

};
}];
});
