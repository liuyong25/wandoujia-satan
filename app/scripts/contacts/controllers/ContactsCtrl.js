define([], function(){
'use strict';

return ['$scope','$http','wdAlert',
function ContactsCtrl($scope, $http, wdAlert){

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

    //正在显示的数据，cancel功能的时候会用到
    var G_showingContact = {};

    //当前的状态
    var G_status = ''; // “edit” 正在编辑，“new” 正在新建

    //默认头像
    var G_defaultPhoto = '../../images/contacts/default.png';

    //修改后的头像二进制数据
    var G_photoBinary = '';

    //全局的timer
    var G_searchTimer;

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
                    data[i].photo_path = G_defaultPhoto;
                };

                G_contacts.push(data[i]);
            };
            getList(data);

            //数据未取完
            if(l === length){
                //如果支持cursor打开这个接口，但是速度不如没有cursor的快
                //getData(1,G_dataLengthOnce,data[l-1].id);

                //不支持cursor取数据
                getData(G_contacts.length,G_dataLengthOnce,null);

            }else{
                G_dataFinish = true ;
            };

        });
    };

    //取得电话号码等列表信息
    function getList(data){
        var l = data.length;
        for(var i = 0; i<l; i++ ){
            var id = data[i].id || '';
            var name = (data[i].name && data[i].name.display_name) || (data[i].phone[0] && data[i].phone[0].number) || (data[i].email[0] && data[i].email[0].address) || 'No Name';
            var phone = data[i].phone[0] && data[i].phone[0].number || '';
            var photo = data[i].photo_path || G_defaultPhoto;
            var obj = {
                id : id,
                name : name,
                phone : phone,
                photo : photo
            };

            //首次进入默认显示第一个联系人
            if (G_isFirst) {
                G_isFirst = false;
                $('.wdj-contacts .right .wd-loading').hide();
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

        var show = function(){
            if(!id){
                $('.contacts-edit').hide();
                return;
            };
            var data = getContactsById(id,G_contacts);

            //账户信息，存储当前账号
            data['account'] = {};
            if(!data['organization'][0]){
                data['organization'][0] = {type:'Work',Company:'',department:'',job_description:'',label:'',office_location:'',phonetic_name:'',symbol:'',title:''};
            };
            data = changeDataType(data);

            //备份数据到全局
            G_showingContact = {};
            $.extend(true,G_showingContact,data);

            G_clicked.clicked = false;

            for(var i = 0,l = G_list.length; i < l; i++){
                if ( !!G_list[i].id && G_list[i].id == id ) {
                    G_list[i].clicked = true;
                    G_clicked = G_list[i];
                };
            };
            $scope.contact = data;

            console.log('showContacts:');
            console.log(data);

            //样式相关处理
            setTimeout(function(){
                var wrap = $('.contacts-edit').show().find('.info');
                wrap.find('p.des').css('display','inline-block');
                wrap.find('p.detail').css('display','inline-block');
                var label = $('.labelFlag');
                for(var i = 0 , l = label.length ; i<l; i++ ){
                    if(!!label.eq(i).text()){
                        label.eq(i).css('display','inline-block').prevAll('p.des').hide();
                    };
                };

                var dt = wrap.find('dt');
                var detail = wrap.find('dd p.detail');
                for(var i = 0 ,l = dt.length;i<l;i++){
                    if(!detail.eq(i).text()){
                        dt.eq(i).hide();
                    };
                };

            },20);
        };

        switch(G_status){
            case 'new':
            case 'edit':
                wdAlert.confirm(
                    'Are you sure?',
                    'Do you save?',
                    'OK',
                    'Cancel'
                ).then(function(){
                    G_status = '';
                    $scope.saveContact($scope.contact.id);
                    show();
                });
            break;
            default:
                show();
            break;
        };
    };

    //删除选中的联系人
    $scope.deleteContacts = function(){

        wdAlert.confirm(
            'Are you sure?',
            'you will delete those contacts',
            'OK',
            'Cancel'
        ).then(function() {
            $('.modal-backdrop').remove();
            var delId = [];
            var flagNum = 0;
            for(var i = 0 , l = G_list.length ; i < l ; i ++){
                if( G_list[i].checked === true ){
                    delId.push(G_list[i].id);
                };
            };
            $('.wdj-contacts .btn-all .btn-delete').hide();

            for(var i = 0 , l = delId.length ; i < l ; i ++ ){
                for(var j = 0 , k = G_list.length ; j < k ; j++){
                    if( G_list[j].id == delId[i] ){

                        //TODO:添加删除接口
                        $http({
                            method: 'delete',
                            url: '/resource/contacts/'+delId[i]
                        }).success(function(){
                            flagNum ++ ;
                            // if( flagNum  === l ){
                            //     wdAlert.alert('Delete success!', 'Delete success!', 'OK').then(function(){$('.modal-backdrop').remove();});
                            // };
                        }).error(function(){
                            flagNum ++ ;
                            if( flagNum === 1){
                                wdAlert.alert('Delete fail!', 'Delete fail!', 'OK').then(function(){$('.modal-backdrop').remove();});
                            };
                        });

                        G_list.splice(j,1);
                        break;
                    };
                };
            };

        //then最后的括号
        });
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
    $scope.editContact = function(id){

        //addNewContact方法中调用了editContact方法
        if(G_status !== 'new'){
            G_status = 'edit';
        };

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
        wrap.find('img.photo').on('mouseenter',showPhotoUpload);
        wrap.find('.photoUpload').on('mouseout',hidePhotoUpload);
        wrap.find('.photoUpload input').on('change',photoUpload);
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
        ele.find('dl dd p.detail').css('display','inline-block');
        wrap.find('img.photo').off('mouseenter',showPhotoUpload);
        wrap.find('.photoUpload').hide().off('mouseout',hidePhotoUpload);
        wrap.find('.photoUpload input').off('change',photoUpload);
        var label = $('.contacts-edit .info .labelFlag');
        for(var i = 0 , l = label.length ; i<l; i++ ){
            if(!!label.eq(i).text()){
                label.eq(i).css('display','inline-block').prevAll('p.des').hide();
            }else{
                label.eq(i).prevAll('p.des').css('display','inline-block');
            };
        };

        wrap.find('.footer .btn-edit').show();
        wrap.find('.footer .btn-save').hide();
        wrap.find('.footer .btn-cancel').hide();

        var saveData = changeDataTypeBack($scope.contact);

        console.log('saveContact:');

        switch(G_status){
            case 'new':
                var editData = [];
                editData.push(saveData);
                var account = editData[0].account || {name:'',type:''};
                editData[0]['account_name'] = account['name'];
                editData[0]['account_type'] = account['type'];
                console.log(saveData);

                $http({
                    method: 'post',
                    url: '/resource/contacts/',
                    data:editData
                }).success(function(data){
                    if (!!G_photoBinary) {
                        $http({
                            method: 'post',
                            url: '/resource/contacts/'+id+'/upload/',
                            data: G_photoBinary
                        }).success(function(data){
                            G_photoBinary = '';
                            G_contacts.push(data[0]);
                            getList(data);
                            showContacts(data[0]['id']);
                        });
                    }else{
                            G_contacts.push(data[0]);
                            getList(data);
                            showContacts(data[0]['id']);
                    };
                });

            break;
            case 'edit':
                var editData = saveData;
                console.log(saveData);
                $http({
                    method: 'put',
                    url: '/resource/contacts/'+id,
                    data:editData
                }).success(function(data){
                    if (!!G_photoBinary) {
                        $http({
                            headers:{ "Content-Type" : "text/plain"},
                            method: 'post',
                            url: '/resource/contacts/'+id+'/upload/',
                            data: G_photoBinary
                        }).success(function(data){
                            G_photoBinary = '';
                            showContacts(data['id']);
                        });
                    }else{
                            showContacts(data['id']);
                    };
                });
            break;
        };
        G_status = '';
    };

    //取消编辑联系人
    $scope.cancelContact = function(id){

        switch(G_status){
            case 'new':
            case 'edit':
                id = G_clicked.id;
                G_status = '';
            break;
        };
        var data = getContactsById(id,G_contacts);
        for( var i in data ){
            data[i] = null;
        };
        $.extend(true,data,G_showingContact);

        var wrap = $('.contacts-edit');
        var ele =  wrap.children('.info');

        wrap.find('img.photo').attr('src',data.photo_path);
        ele.find('p.name').show();
        ele.find('p.remark').show();
        ele.find('.editName').hide();

        ele.find('hr').show();

        ele.find('input').hide();
        ele.find('select').hide();
        ele.find('.btn-addNewItem').hide();
        wrap.find('img.photo').off('mouseenter',showPhotoUpload);
        wrap.find('.photoUpload').hide().off('mouseout',hidePhotoUpload);
        wrap.find('.photoUpload input').off('change',photoUpload);

        var label = ele.find('.labelFlag');
        for(var i = 0 , l = label.length ; i<l; i++ ){
            if(!!label.eq(i).text()){
                label.eq(i).css('display','inline-block').prevAll('p.des').hide();
            }else{
                label.eq(i).prevAll('p.des').show();
            };
        };

        ele.find('p.detail').css('display','inline-block');

        wrap.find('.footer .btn-edit').show();
        wrap.find('.footer .btn-save').hide();
        wrap.find('.footer .btn-cancel').hide();

        showContacts(id);
    };

    //增加一个条目
    $scope.addNewItem = function (id,itemType){
        var obj = $scope.contact;
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
                obj.IM.push({protocol:'AIM',data:''}); //IM比较特殊，使用的protocol
            break;
            // case 'nickname':
            //     i = obj.nickname.length;
            //     obj.nickname.push({type:'Default',name:''});
            // break;
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

        //获取用户账户
        $http({
            method: 'get',
            url: '/resource/accounts'
        }).success(function(data) {
            //var data = [{type:'gogole',name:'wangxiao@gmail.com'},{type:'wandoujia',name:'wangxiao@wandoujia.com'}];
            $scope.contact.account = data[0];
            $scope.accounts = data;
        });

        var wrap = $('.contacts-edit .info');
        wrap.find('img.photo').attr('src',G_defaultPhoto);
        wrap.find('div.account').show().children().show();

        var obj = {
            // id:'wangxiao',
            account_name:'',
            account_type:'',
            photo_path:G_defaultPhoto,
            IM:[{protocol:'AIM',custom_protocol:'',data:'',label:'',type:''}],
            address:[{type:'Home',city:'',country:'',formatted_address:'',label:'',neightborhood:'',pobox:'',post_code:'',region:'',street:''}],
            email:[{type:'Home',address:'',display_name:'',label:''}],
            name:{display_name:'',family_name:'',given_name:'',middle_name:'',phonetic_family_name:'',phonetic_given_name:'',phonetic_middle_name:'',prefix:'',suffix:''},
            // nickname:[{type:'Default',label:'',name:''}],
            note:[{type:'Default',note:''}],
            organization:[{type:'Work',Company:'',department:'',job_description:'',label:'',office_location:'',phonetic_name:'',symbol:'',title:''}],
            phone:[{type:'Mobile',label:'',number:''}],
            relation:[{type:'Friend',name:'',label:''}],
            website:[{type:'Homepage',URL:'',label:''}]
        };
        $scope.contact = obj;
        G_status = 'new';
        setTimeout(function(){
            $scope.editContact();
        },100);
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

            //IM显示protocol
            if(!!data['IM'][0]){
                for(var i = 0 , l = data['IM'].length ; i < l ; i++ ){
                    data['IM'][i]['protocol'] = G_protocol[data['IM'][i]['protocol']] || data['IM'][i]['protocol'];
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

        //IM字段中使用protocol代替type
        if(!!obj['IM'] && !!obj['IM'].length){
            for(var i = 0 ,l = obj['IM'].length; i < l ; i++ ){
                for(var m in G_protocol){
                    if(obj['IM'][i]['protocol'] === G_protocol[m]){
                        obj['IM'][i]['protocol'] = m;
                    };
                };
            };
        };

        return obj;
    };

    function showPhotoUpload(){
        $('.contacts-edit .photoUpload').show();
    };

    function hidePhotoUpload(){
        $('.contacts-edit .photoUpload').hide();
    };

    function photoUpload(e){
        var file = e.target.files[0];
        if(!file.type.match('image.*')){
            return;
        }else{
            var reader = new FileReader();
            reader.readAsDataURL(file);

            //显示为base64
            reader.onload = function(e){

                $('.contacts-edit img.photo').attr('src',e.target.result);

                //传给服务器为二进制
                var reader = new FileReader();
                reader.readAsBinaryString(file);
                reader.onload = function(e){
                    G_photoBinary = e.target.result;
                };

            };
        };
    };

    //搜索功能
    $('.wdj-contacts .btn-all .search input').on('keyup',function(e){
        clearTimeout(G_searchTimer);
        G_searchTimer = setTimeout($scope.searchContacts,300);
    });
    $('.wdj-contacts .btn-all .search .icon-clear').on('click',function(){
        $scope.list = G_list;
        showContacts(G_list[0]['id']);
    });

    //搜索联系人功能，根据联系人列表 G_list 搜索
    $scope.searchContacts = function(){
        $scope.list = [];
        var text = $scope.searchText;
        for( var i = 0, l = G_list.length; i < l ; i++ ){
            if(  (G_list[i]['name'].indexOf(text)>=0) || (G_list[i]['phone'].indexOf(text)>=0) ){
                $scope.list.push(G_list[i]);
            };
        };
        if(!!$scope.list[0]){
            G_clicked['clicked'] = false;
            G_clicked = $scope.list[0];
            $scope.list[0]['clicked'] = true;
            showContacts($scope.list[0]['id']);
        }else{
            showContacts();
        };
        $scope.$apply();
    };

    //主函数开始
    getData(0,G_dataLengthOnce,null);
    $scope.list = G_list;
    $scope.typeMap = G_typeMap;
    $scope.protocolMap = G_protocol;
    $scope.showContacts = showContacts;

//return的最后括号
}];
});










