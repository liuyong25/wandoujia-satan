define([], function(){
'use strict';

return ['$scope','$http',
function ContactsCtrl($scope, $http){

    //存储当前联系人的数据列表
    var G_contacts = [];

    //联系人列表
    var G_list = [];

    //每次拉取数据的长度
    var G_dataLengthOnce = 30;

    //标示是否首次进入
    var G_isFirst = true;

    //当前被点击的元素
    var G_clicked = {};

    //数据是否已经加载完成
    var G_dataFinish = false;

    //是否selectAll了
    var G_selectAll = false;

    //正在显示的数据
    var G_showingContact = {};

    //各个type字段映射表
    var G_typeMap = {
       'address' : {
           'CA_CUSTOM':'Custom',
           'CA_HOME':'Home',
           'CA_WORK':'Work',
           'CA_OTHER':'Other'
        },
       'event' : {
           'CE_ANNIVERSARY' :'Anniversary', //周年纪念日
           'CE_OTHER' :'Other',
           'CE_BIRTHDAY' :'Birthday'
        },
       'nickname' : {
           'CN_DEFAULT' :'Default',
           'CN_OTHER_NAME' :'Other name',
           'CN_MAINDEN_NAME' :'Mainden name',
           'CN_SHORT_NAME' :'Short name',
           'CN_INITIALS' :'Initials'  //首字母、缩写
        },
       'organization' : {
           'CO_CUSTOM':'Custom',
           'CO_WORK':'Work',
           'CO_OTHER':'Other'
        },
       'website' : {
           'CW_HOMEPAGE':'Homepage',
           'CW_BLOG':'Blog',
           'CW_PROFILE':'Profile',
           'CW_HOME':'Home',
           'CW_WORK':'Work',
           'CW_FTP':'FTP',
           'CW_OTHER':'Other'
        },
       'IM' : {
           'CI_TYPE_CUSTOM':'Custom',
           'CI_HOME':'Home',
           'CI_WORK':'Work',
           'CI_OTHER':'Other'
        },
       'relation' : {
            //'CR_CUSTOM' : 'Custom',
           'CR_ASSISTANT':'Assistant',
           'CR_BROTHER':'Brother',
           'CR_CHILD':'Child',
           'CR_DOMESTIC_PARTNER':'Partner',
           'CR_FATHER':'Father',
           'CR_FRIEND':'Friend',
           'CR_MANAGER':'Manager',
           'CR_MOTHER':'Mother',
           'CR_PARENT':'Parent',
           'CR_PARTNER':'Partner',
           'CR_REFERRED_BY':'Referred by',
           'CR_RELATIVE':'Relative',
           'CR_SISTER':'Sister',
           'CR_SPOUSE':'Spouse'
        },
       'phone' : {
           'CP_CUSTOM':'Custom',
           'CP_HOME':'Home',
           'CP_MOBILE':'Mobile',
           'CP_WORK':'Work',
           'CP_FAX_WORK':'Fax Work',
           'CP_FAX_HOME':'Fax Home',
           'CP_PAGER':'Pager',
           'CP_OTHER':'Other',
           'CP_CALLBACK':'Callback',
           'CP_CAR':'Car',
           'CP_COMPANY_MAIN':'Company main',
           'CP_ISDN':'ISDN',
           'CP_MAIN':'Main',
           'CP_OTHER_FAX':'Other Fax',
           'CP_RADIO':'Radio',
           'CP_TELEX':'Telex',
           'CP_TTY_TDD':'TTY TDD',
           'CP_WORK_MOBILE':'Work Mobile',
           'CP_WORK_PAGER':'Work Pager',
           'CP_ASSISTANT':'Assistant',
           'CP_MMS':'MMS'
        },
       'email' : {
           'CE_CUSTOM':'Custom',
           'CE_HOME':'Home',
           'CE_WORK':'Work',
           'CE_OTHER':'Other',
           'CE_MOBILE':'Mobile'
        },

        //原本没有的
        'note' : {
            'Default' : 'Default'
        }
    };

    //IM中使用的字段
    var G_protocol = {
        'CI_PROTOCOL_CUSTOM':'Custom',
        'CI_AIM':'AIM',
        'CI_MSN':'MSN',
        'CI_YAHOO':'Yahoo',
        'CI_SKYPE':'Skype',
        'CI_QQ':'QQ',
        'CI_GOOGLE_TALK':'Gtalk',
        'CI_ICQ':'ICQ',
        'CI_JABBER':'Jabber',
        'CI_NETMEETING': 'Netmeeting'
    };

    //获取数据
    function getData(offset,length,cursor){
        cursor = cursor || 0;
        $http({
            method: 'get',
            url: '/resource/contacts?length='+length+'&cursor='+cursor +'&offset='+offset
        }).success(function(data) {
            for(var i = 0,l = data.length;i<l;i++){

                //修正默认头像
                if(!data[i].photo_path){
                    data[i].photo_path = '../../images/contacts/default.png';
                };

                G_contacts.push(data[i]);
            };
            getList(data);

            //数据未取完
            if(l === length){
                //getData(1,G_dataLengthOnce,data[l-1].id);
            }else{
                G_dataFinish = true ;
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
                G_isFirst = false;
                showContacts(G_contacts[0].id);
                obj.clicked = true;
                G_clicked = obj;
            }else{
                obj.clicked = false;
            };

            //用户是否在未加载完数据时点了selectAll按钮
            if(G_selectAll){
                obj.checked = true ;
            }else{
                obj.checked = false ;
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
    function showContacts(id){
        var data = getContactsById(id,G_contacts);
        data = changeDataType(data);
        console.log(data);

        //备份数据到全局
        G_showingContact = {};
        $.extend(true,G_showingContact,data);

        G_clicked.clicked = '';
        for(var i = 0,l = G_list.length; i < l; i++){
            if ( G_list[i].id == id ) {
                G_list[i].clicked = 'clicked';
                G_clicked = G_list[i];
            };
        };
        $scope.contact = data;

        setTimeout(function(){
            var label = $('.contacts-edit .info .labelFlag');
            for(var i = 0 , l = label.length ; i<l; i++ ){
                if(!!label.eq(i).text()){
                    label.eq(i).css('display','inline-block').prevAll('p.des').hide();
                };
            };
        },100);
    };

    //删除选中的联系人
    $scope.deleteContacts = function(){
        var delId = [];
        for(var i = 0 , l = G_list.length ; i < l ; i ++){
            if( G_list[i].checked === true ){
                delId.push(G_list[i].id);
            };
        };

        for(var i = 0 , l = delId.length ; i < l ; i ++ ){
            for(var j = 0 , k = G_list.length ; j < k ; j++){
                if( G_list[j].id == delId[i] ){

                    //TODO:添加删除接口
                    $http({
                        method: 'delete',
                        url: '/resource/contacts/'+delId[i]
                    }).success(function(){
                        // wdAlert('delete success!');
                    });

                    G_list.splice(j,1);
                    break;
                };
            };
        };
    };

    //选中所有
    $scope.selectAll = function(){
        if (G_selectAll === true) {
            $('.btn-all .btn-delete').hide();
            G_selectAll = false;
        }else{
            $('.btn-all .btn-delete').show();
            G_selectAll = true;
        };
        for(var i = 0, l = $scope.list.length;i<l;i++){
            $scope.list[i].checked = G_selectAll ;
        };
    };

    $scope.clickChecked = function(){
        for(var i = 0, l = $scope.list.length;i<l;i++){
            if($scope.list[i].checked){
                $('.btn-all .btn-delete').show();
                return;
            }
        };
        $('.btn-all .btn-delete').hide();
    };

    //编辑联系人
    $scope.editContact = function(){
        var wrap = $('.contacts-edit');
        var ele =  wrap.children('.info');
        var change = function(arr){
            for(var i = 0 , l = arr.length ; i<l ; i++ ){
                var val = arr.eq(i).hide().text();
                arr.eq(i).next('input').val(val).show();
            };
        };

        ele.find('dt').show();
        ele.find('p.name').hide();
        ele.find('p.remark').hide();
        ele.find('hr').hide();
        ele.find('div.editName').show();
        ele.find('div.editName input').show();
        ele.find('p.labelFlag').hide();
        change(ele.find('dl dd p.detail').hide());

        var desEle = ele.find('dl dd p.des');
        for(var i = 0 , l = desEle.length ; i<l ; i++ ){
            var el = desEle.eq(i);
            var val = el.hide().text();
            var sel = el.nextAll('select').show();
            if( sel.val().indexOf('CUSTOM') >= 0 ){
                el.nextAll('input.label').show();
            };
        };

        //监视select变化
        changeTypeSelect();

        wrap.find('.footer .btn-edit').hide();
        wrap.find('.footer .btn-save').show();
        wrap.find('.footer .btn-cancel').show();

        //添加新item的功能
        ele.find('.btn-addNewItem').show();
    };

    //保存联系人
    $scope.saveContact = function(id){

        //UI操作
        var wrap = $('.contacts-edit');
        var ele =  wrap.children('.info');

        ele.find('select').hide();
        ele.find('input').hide();
        ele.find('.editName').hide();
        ele.find('.btn-addNewItem').hide();

        ele.find('.name').show();
        ele.find('.remark').show();

        ele.find('hr').show();
        ele.find('dl dd p.detail').show();
        var label = $('.contacts-edit .info .labelFlag');
        for(var i = 0 , l = label.length ; i<l; i++ ){
            if(!!label.eq(i).text()){
                label.eq(i).css('display','inline-block').prevAll('p.des').hide();
            }else{
                label.eq(i).prevAll('p.des').show();
            };
        };

        wrap.find('.footer .btn-edit').show();
        wrap.find('.footer .btn-save').hide();
        wrap.find('.footer .btn-cancel').hide();

        //TODO:补充保存联系人接口
        var editData = changeDataTypeBack(getContactsById(id,G_contacts));
        // $http({
        //     method: 'put',
        //     url: '/resource/contacts/'+id,
        //     data:editData
        // }).success(function(data){
        //
        //     // wdAlert('delete success!');
        // });
    };

    //取消编辑联系人
    $scope.cancelContact = function(id){
        var data = getContactsById(id,G_contacts);
        for( var i in data ){
            data[i] = null;
        };
        $.extend(true,data,G_showingContact);

        var wrap = $('.contacts-edit');
        var ele =  wrap.children('.info');

        ele.find('p.name').show();
        ele.find('p.remark').show();
        ele.find('.editName').hide();

        ele.find('hr').show();

        ele.find('input').hide();
        ele.find('select').hide();
        ele.find('.btn-addNewItem').hide();
        var label = ele.find('.labelFlag');
        for(var i = 0 , l = label.length ; i<l; i++ ){
            if(!!label.eq(i).text()){
                label.eq(i).css('display','inline-block').prevAll('p.des').hide();
            }else{
                label.eq(i).prevAll('p.des').show();
            };
        };

        ele.find('p.detail').show();

        wrap.find('.footer .btn-edit').show();
        wrap.find('.footer .btn-save').hide();
        wrap.find('.footer .btn-cancel').hide();

        showContacts(id);
    };

    //增加一个条目
    $scope.addNewItem = function (id,itemType){
        var obj = getContactsById(id,G_contacts);
        var i = 0;
        switch(itemType){
            case 'phone':
                i = obj.phone.length;
                obj.phone.push({type:'Mobile',number:''});
            break;
            case 'email':
                i = obj.email.length;
                obj.email.push({type:'Home',number:''});
            break;
            case 'address':
                i = obj.address.length;
                obj.address.push({type:'Home',formatted_address:''}); //多个
            break;
            case 'IM':
                i = obj.IM.length;
                obj.IM.push({type:'Home',data:''});
            break;
            case 'nickname':
                i = obj.nickname.length;
                obj.nickname.push({type:'Default',name:''});
            break;
            case 'note':
                i = obj.note.length;
                obj.note.push({type:'Default',note:''});
            break;
            case 'website':
                i = obj.website.length;
                obj.website.push({type:'Homepage',URL:''});
            break;
            case 'relation':
                i = obj.relation.length;
                obj.relation.push({type:'Brother',name:''});
            break;
        };

        //改了scope后需要一定时间才能传到view，需要延时下。
        setTimeout(function(){
            var wrap = $('.contacts-edit .info');
            wrap.find('p.detail').hide();
            wrap.find('p.des').hide();
            wrap.find('input.detail').show();
            var sel = wrap.find('select').show();
            var label = wrap.find('input.label');
            for(var i = 0, l = label.length ; i<l ; i++){
                if( sel.eq(i).val().indexOf('CUSTOM') > 0 ){
                    label.eq(i).show();
                };
            };
        },100);
    };

    //切换type的select时触发
    function changeTypeSelect(){
        var wrap = $('.contacts-edit .info');
        var label = wrap.find('input.label');
        wrap.on('change',function(e){
            var ele = $(e.target);
            if(ele.val().indexOf('CUSTOM') >= 0){
                ele.nextAll('input.label').show();
            }else{
                ele.nextAll('input.label').val('').hide();
            };
        });
    };

    //添加新的联系人
    $scope.addNewContact = function(){

    };

    //改变data中的type值
    function changeDataType(data){

        //因为angular的select问题，所以修正type
        for(var k in data){

            //改变type
            if(!!data[k]['type'] && !!G_typeMap[k] && !!G_typeMap[k][data[k]['type']]){
                data[k]['type'] = G_typeMap[k][data[k]['type']];
            }else if( !!data[k][0] && !!G_typeMap[k] && !!data[k][0]['type']){
                for(var i = 0 , l = data[k].length ; i < l ; i++ ){
                    data[k][i]['type'] = G_typeMap[k][data[k][i]['type']] || data[k][i]['type'];
                };
            };

            //改变没有type值的
            if(!!data['note'][0]){
                for(var i = 0 , l = data['note'].length ; i < l ; i++ ){
                    data['note'][i].type = 'Default';
                };
            };

        };
        return data;
    };

    //将data中的type值改变回来
    function changeDataTypeBack(data){

        var obj = {};
        $.extend(true,obj,data);

        for(var k in obj){

            //改变type
            if( !!obj[k]['type'] && !!G_typeMap[k] ){
                for(var t in G_typeMap[k]){
                    if(obj[k]['type'] === G_typeMap[k][t]){
                        obj[k]['type'] = t;
                    };
                };
            }else if( !!obj[k][0] && !!G_typeMap[k] && !!obj[k][0]['type']){
                for(var i = 0 , l = obj[k].length ; i < l ; i ++ ){
                    for(var t in G_typeMap[k]){
                        if(obj[k][i]['type'] === G_typeMap[k][t]){
                            obj[k][i]['type'] = t;
                        };
                    };
                };
            };

        };
        return obj;

    };

    //主函数开始
    getData(0,G_dataLengthOnce,null);
    $scope.list = G_list;
    $scope.typeMap = G_typeMap;
    $scope.showContacts = showContacts;
//return的最后括号
}];
});










