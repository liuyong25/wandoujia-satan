define([], function() {
'use strict';
return [function() {
    return {
        restrict: 'C',
        template: '<div ng-class="{\'wd-loading-hide\': !visible()}" id="floatingCirclesG"><div class="f_circleG" id="frotateG_01"></div><div class="f_circleG" id="frotateG_02"></div><div class="f_circleG" id="frotateG_03"></div><div class="f_circleG" id="frotateG_04"></div><div class="f_circleG" id="frotateG_05"></div><div class="f_circleG" id="frotateG_06"></div><div class="f_circleG" id="frotateG_07"></div><div class="f_circleG" id="frotateG_08"></div></div>',
        replace: true,
        scope: {
            visible: '&'
        }
    };
}];
});
