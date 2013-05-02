define([], function() {
return ['$http', '$q', function($http, $q){

    //每次拉取联系人列表数据的长度
    var G_dataLengthOnce = 50;

    //全局存储联系人列表的数据
    var G_contacts = [];

    //默认头像
    var G_defaultPhoto = '../../images/contacts/default.png';

    //数据是否拉取完成
    var G_dataFinish = false;

    //获取数据
    function getData(offset,length,cursor){
        var cursor = cursor || 0;
        $http({
            method: 'get',
            url: '/resource/contacts?length='+length+'&cursor='+cursor +'&offset='+offset
        }).success(function(data) {
            for(var i = 0,l = data.length;i<l;i++){

                //修正默认头像
                data[i].photo_path = data[i].photo_path || G_defaultPhoto;
                G_contacts.push(data[i]);
            };

            //数据未取完
            if(l === length){
                //如果支持cursor打开这个接口，但是速度不如没有cursor的快
                //getData(1,G_dataLengthOnce,data[l-1].id);
                //不支持cursor取数据
                getData(G_contacts.length,G_dataLengthOnce,null);

            }else{
                G_dataFinish = true;
            };

        }).error(function(){
            //wdAlert.alert('Lost connection to phone','Please refresh your browser','Refresh').then(function(){location.reload();});
        });
    };
    
}];
});
