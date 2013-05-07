define( [
    'underscore'
], function(
    _
) {
    'use strict';

//$q是promise
return [ '$http', '$q', function ( $http, $q ) {
    var G_appList = [];
    return {
        getAppListData : function (){
            return $http({
                method: 'get',
                url: '/resource/apps?length=9999'
            }).success(function(data) {
                for( var i = 0,l = data.length ; i<l; i+=1 ){
                    G_appList.push(data[i]);
                }
            }).error(function(){
            });
        }
    };

}];
});
