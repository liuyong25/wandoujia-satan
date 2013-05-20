define([], function() {
'use strict';
return [function() {
return {

link: function($scope, $element) {

    $scope.lastSelected = null;

    $scope.select = function(c, shiftKey) {
        if (c.selected && shiftKey) {
            var startIndex = Math.max($scope.cvs().indexOf($scope.lastSelected), 0);
            var stopIndex = $scope.cvs().indexOf(c);
            $scope.cvs().slice(Math.min(startIndex, stopIndex), Math.max(startIndex, stopIndex) + 1).forEach(function(c) {
                c.selected = true;
            });
        }
        if (!c.selected && c === $scope.lastSelected) {
            var cvs = $scope.cvs();
            var index = cvs.indexOf(c);
            var cursor = null;
            var i, l, cc;

            for (i = index + 1, l = cvs.length; i < l; i += 1) {
                cc = cvs[i];
                if (cc.selected) {
                    cursor = cc;
                    break;
                }
            }

            if (!cursor) {
                for (i = index - 1; i >= 0; i -= 1) {
                    cc = cvs[i];
                    if (cc.select) {
                        cursor = cc;
                        break;
                    }
                }
            }
            $scope.lastSelected = cursor;
        }

        if (c.selected) {
            $scope.lastSelected = c;
        }

    };
}

};
}];
});
