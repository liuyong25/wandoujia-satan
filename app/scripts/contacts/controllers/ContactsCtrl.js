define([], function(){
'use strict';

return ['$scope','$http',
function ContactsCtrl($scope, wdHttp){

    //存储当前联系人的数据列表
    var G_contacts = [];

    //联系人列表
    var G_list = [];

    //每次拉取数据的长度
    var G_dataLengthOnce = 10;

    //标示是否首次进入
    var G_isFirst = true;

    //当前被点击的元素
    var G_clicked = {};

    //获取数据
    function getData(offset,length,cursor){
        wdHttp({
            method: 'get',
            url: '/resource/contacts?offset='+offset+'&length='+length+'&cursor='+cursor
        }).success(function(data) {
            for(var i = 0,l = data.length;i<l;i++){

                //修正默认头像
                if(!data[i].photo_path){
                    data[i].photo_path = '../../images/contacts/default.gif';
                };
                G_contacts.push(data[i]);
            };
            getList(data);

            //数据已取完
            if(l === length){
                getData(G_contacts.length,G_dataLengthOnce,'');
            };

        });
    };

    //取得电话号码
    function getList(data){
        var l = data.length;
        for(var i = 0; i<l; i++ ){
            var id = data[i].id || '';
            var name = data[i].name && data[i].name.display_name || '';
            var phone = data[i].phone[0] && data[i].phone[0].number || '';
            var photo = data[i].photo_path;
            var obj = {
                id : id,
                name : name,
                phone : phone,
                photo : photo
            };

            //首次进入默认显示第一个联系人
            if (G_isFirst) {
                $scope.contact = G_contacts[0];
                obj.clicked = true;
                G_clicked = obj;
                G_isFirst = false;
            }else{
                obj.clicked = false;
            };
            G_list.push(obj);
        };
    };

    //获取某个联系人的信息
    function getContactsById(id,data){
        var l = data.length;
        for(var i = 0; i<l; i++ ){
            if(data[i].id == id ){
                return data[i];
            };
        };
    };

    //显示对应的联系人
    $scope.showContacts = function(id){
        var data = getContactsById(id,G_contacts);
        console.log(data);
        G_clicked.clicked = '';
        for(var i = 0,l = G_list.length; i < l; i++){
            if ( G_list[i].id == id ) {
                G_list[i].clicked = 'clicked';
                G_clicked = G_list[i];
            };
        };
        $scope.contact = data;
    };

    //主函数开始
    getData(0,G_dataLengthOnce,'');
    $scope.list = G_list;

//return的最后括号
}];
});










