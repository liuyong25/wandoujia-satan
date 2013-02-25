define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return [function() {
    var stack = [];
    return {
        push: function(tip) {
            stack.unshift({
                tip: tip,
                done: function() {
                    stack.splice(_.indexOf(stack, this), 1);
                }
            });
            return stack[0];
        },
        getTip: function() {
            return stack.length && stack[0].tip || null;
        }
    };
}];
});
