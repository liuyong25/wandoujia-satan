define( [
    'underscore'
], function(
    _
) {
    'use strict';

//$q是promise
return [ '$http', '$q','$rootScope', function ( $http, $q, $rootScope ) {

    var global = {
        appsList:[],
        fun : undefined
    };

    var me = this;

    function getAppListData() {
        return $http({
            method: 'get',
            url: '/resource/apps?length=9999'
        }).success(function(data) {
            for( var i = 0,l = data.length ; i<l; i+=1 ){
                global.appsList.push(data[i]);
            }
        }).error(function(){
        });
    }

    $rootScope.$on('signout', function() {
        global.appsList = [];
    });

    return {

        onchange : function(fun){
            global.fun = fun;
            if(global.appsList.length){
                global.fun.call(me,global.appsList);
            }else{
                getAppListData().success(function(){
                    global.fun.call(me,global.appsList);
                });
            }
        }

    };

}];
});
