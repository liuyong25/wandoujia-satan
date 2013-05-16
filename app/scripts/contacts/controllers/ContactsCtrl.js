define([
    'fineuploader',
    'underscore'
], function(fineuploader,_){

return ['$scope','wdAlert','wdDev','$route','GA','wdcContacts', '$timeout','wdKey',
function ContactsCtrl($scope, wdAlert , wdDev ,$route,GA,wdcContacts, $timeout,wdKey){

    //存储当前联系人的数据列表
    var G_contacts = [];

    //联系人列表
    var G_list = [];

    //当前显示的联系人列表
    var G_pageList = [];

    //搜索出的联系人列表
    var G_searchList = [];

    //每次拉取数据的长度
    var DATA_LENGTH_ONCE = 50;

    //标示是否首次进入
    var G_isFirst = true;

    //当前被点击的元素
    var G_clicked = {};

    //数据是否已经加载完成
    var G_dataFinish = false;

    //正在显示的数据，cancel功能的时候会用到
    var G_showingContact = {};

    //当前的状态
    var G_status = ''; // “edit” 正在编辑，“new” 正在新建

    //默认头像
    var G_defaultPhoto = '../../images/contacts/default.png';

    //全局的timer
    var G_searchTimer;

    //各个type字段映射表
    var G_typeMap = $scope.$root.DICT.contacts.TYPE_MAP;

    //IM中使用的字段
    var G_protocol = $scope.$root.DICT.contacts.IM_PROTOCOL;
    var G_debug = 0 ;

    //按键相关
    var G_keyContact;

    //获取数据
    function init(){

        wdcContacts.init();
        wdcContacts.onchange(function(data){
            getData(data);
        });
    };

    //每次加载数据时触发
    function getData(data) {
        G_dataFinish = wdcContacts.getLoadStatus();
        for ( var i = 0, l=data.length; i<l; i++ ){

            //修正默认头像
            if (!data[i].photo_path){
                data[i].photo_path = G_defaultPhoto;
            };
            G_contacts.push(data[i]);
        };
        getList(data);
        G_isFirst = false;
    }

    function getListItem(data){
        var id = data.id || '';
        var name = (data.name && data.name.display_name) || $scope.$root.DICT.contacts.NO_NAME;
        var phone = (data.phone[0] && data.phone[0].number) || (data.email[0] && data.email[0].address) ||'';
        var photo = data.photo_path || G_defaultPhoto;
        var obj = {
            id : id,
            name : name,
            phone : phone,
            photo : photo,
            read_only : data['read_only']
        };
        return obj;
    };

    //取得电话号码等列表信息
    function getList(data,isUnshift){
        var l = data.length;

        //第一次数据已经载入
        if(G_isFirst){
            $scope.isLeftLoadingShow = false;
            $scope.isNewContactDisable = false;
            G_keyContact = wdKey.push('contacts');
        };

        if( G_list.length < 1 && l<1 ){
            $('.wdj-contacts .wd-blank').show();
        };

        for(var i = 0; i<l; i++ ){
            var obj = getListItem(data[i]);

            //首次进入默认显示第一个联系人
            if (!i && G_isFirst) {
                $scope.isRightLoadShow = false;
                showContacts(G_contacts[0].id);
                obj.clicked = true;
                G_clicked = obj;

            }else{
                obj.clicked = false;
            };

            if(G_isFirst){
                $scope.pageList.push(obj);
            };

            if(!isUnshift){
                G_list.push(obj);
            }else{
                G_list.unshift(obj);
            };
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

            $scope.isRightLoadShow = false;
            $scope.isPhotoUploadShow = false;
            if(!id){
                //$('.contacts-edit').hide();
                $scope.isContactsEditShow = false;
                return;
            };

            var data = getContactsById(id,G_contacts);
            if(!data){
                data = G_contacts[0];
                $('ul.contacts-list')[0].scrollTop = 0;
            };

            //账户信息，存储当前账号
            data['account'] = {};
            if(!data['organization'][0]){
                data['organization'][0] = {type:'Work',Company:'',department:'',job_description:'',label:'',office_location:'',phonetic_name:'',symbol:'',title:''};
            }

            if(!!data['website']){
                for (var i = 0 , l = data['website'].length ; i < l ; i ++ ) {
                    if( data['website'][i]['URL'].indexOf('http://')<0 ){
                        data['website'][i]['URL'] = 'http://' + data['website'][i]['URL'];
                    }
                }
            }

            data = changeDataType(data);

            //备份数据到全局，以便之后cancel时使用
            G_showingContact = {};
            $.extend(true,G_showingContact,data);

            G_clicked.clicked = false;

            for(var i = 0,l = $scope.pageList.length; i < l; i++){
                if ( !!$scope.pageList[i].id && $scope.pageList[i].id == id ) {
                    $scope.pageList[i].clicked = true;
                    G_clicked = $scope.pageList[i];
                };
            };
            $scope.contact = data;
            $scope.isContactsEditShow = true;

            //样式相关处理
            if(G_dataFinish){
                if(G_searchList.length>0){
                    if($scope.pageList.length < G_searchList.length){
                        $scope.isLoadMoreBtnShow = true;
                    }else{
                        $scope.isLoadMoreBtnShow = false;
                    };
                }else{
                    if($scope.pageList.length < G_list.length){
                        $scope.isLoadMoreBtnShow = true;
                    }else{
                        $scope.isLoadMoreBtnShow = false;
                    };
                };
            }else{
                if(G_searchList.length>0){
                    if( $scope.pageList.length < G_searchList.length ){
                        $scope.isLoadMoreBtnShow = true;
                    }else{
                        $scope.isLoadMoreBtnShow = false;
                    };
                }else{
                    $scope.isLoadMoreBtnShow = true;
                };
            };
            $scope.isEditBtnShow = true;
            $scope.isDelBtnShow = true;
            $scope.isSaveBtnShow = false;
            $scope.isCancelBtnShow = false;

            setTimeout(function(){

                var wrap = $('.contacts-edit');
                wrap.find('div.editName').hide();
                wrap.find('p.name').show();
                wrap.find('p.remark').show();
                wrap.find('select').hide();
                wrap.find('input').hide();
                wrap.find('button.btn-addNewItem').hide();
                wrap.find('hr').show();
                wrap.find('span.delete').hide();


                wrap.find('p.des').css('display','inline-block');
                wrap.find('p.detail').css('display','inline-block');
                var label = $('.labelFlag');
                for(var i = 0 , l = label.length ; i<l; i++ ){
                    if(!!label.eq(i).text()){
                        label.eq(i).css('display','inline-block').prevAll('p.des').hide();
                    };
                };

                var dt = wrap.find('dt');
                for(var i = 0 ,l = dt.length;i<l;i++){
                    if(!dt.eq(i).next('dd').length){
                        dt.eq(i).hide();
                    };
                };
            },50);
        };

        switch(G_status){
            case 'new':
                if(!wdcContacts.checkBlank($scope.contact)){
                    wdAlert.confirm(
                        'Save Contact',
                        'Save changes to this contact? ',
                        "Save",
                        "Don't Save"
                    ).then(function(){
                        $scope.saveContact($scope.contact.id);
                        show();
                    },function(){
                        G_status = '';
                        $scope.pageList.shift();
                        show();
                    });
                }else{
                    $scope.pageList.shift();
                    show();
                    G_status = '';
                };
                break;
            case 'edit':
                wdAlert.confirm(
                    'Save Contact',
                    'Save changes to this contact? ',
                    "Save",
                    "Don't Save"
                ).then(function(){
                    $scope.saveContact($scope.contact.id);
                    show();
                },function(){
                    G_status = '';
                    $scope.pageList.shift();
                    show();
                });
            break;
            default:
                show();
            break;
        };
    };

    //删除选中的联系人，传入id删除单个，不传入说明删除多个。
    $scope.deleteContacts = function(id){

        GA('Web Contacts:click delete contacts button');

        var word = "";

        //取得read only的账号
        var read_only = [];

        //删除一个
        if(!!id){
            word = "contact";

        //删除多个
        }else{
            word = "contacts";
            for(var i = 0 , l = G_list.length ; i < l ; i ++){
                if( G_list[i].checked === true && G_list[i]['read_only'] ){
                    read_only.push(G_list[i]['name']);
                    G_list[i].checked = false;
                };
            };
        }

        var alertTpl = '<p>Delete the selected '+word+' from your phone?</p>';
        if(read_only.length > 0){
            alertTpl += '<p>Those are read-only contacts,can not be deleted:</p><ul>'
            for(var i = 0 , l = read_only.length; i < l ; i++ ){
                alertTpl += ('<li>'+read_only[i]+'</li>');
            };
            alertTpl += '</ul>';
        };

        setTimeout(function(){
            $('.modal-body').html(alertTpl);
        },300);

        wdAlert.confirm(
            'Delete '+word,
            'Delete the selected '+word+' from your phone?',
            'Delete',
            'Cancel'
        ).then(function() {
            $('.modal-body').html('');
            $('.modal-backdrop').html('');

            var delId = [];

            //标志是否全部删除成功
            var flagNum = 0;

            //生成delId
            if(!id){
                for(var i = 0 , l = G_list.length ; i < l ; i ++){
                    if( G_list[i].checked === true && !G_list[i]['read_only'] ){
                        delId.push(G_list[i].id);
                    };
                };
            }else{
                delId.push(id);
            };

            for(var i = 0 , l = delId.length ; i < l ; i ++ ){
                for(var j = 0 , k = $scope.pageList.length ; j < k ; j++){
                    if( $scope.pageList[j].id == delId[i] ){
                        $scope.pageList.splice(j,1);
                        break;
                    };
                };
                for(var j = 0, k = G_list.length ; j < k ; j++ ){
                    if( !!G_list[j] && !!G_list[j]['id'] && G_list[j]['id'] == delId[i]){
                        G_list.splice(j,1);
                        if(!G_list.length){
                            $('.wdj-contacts .wd-blank').show();
                        };
                        break;
                    };
                };
                for(var j = 0, k = G_searchList.length ; j < k ; j++ ){
                    if( !!G_searchList[j] && !!G_searchList[j]['id'] && G_searchList[j]['id'] == delId[i]){
                        G_searchList.splice(j,1);
                        break;
                    };
                };
            };
            $scope.loadMore();
            if(!!$scope.pageList[0]){
                $scope.pageList[0]['clicked'] = true;
                G_clicked = $scope.pageList[0];
                showContacts($scope.pageList[0]['id']);
            }else{
                showContacts();
            };
            if(!!G_clicked && !!G_clicked['clicked']){
                G_clicked.clicked = false;
            };
            $('ul.contacts-list')[0].scrollTop = 0;
            if(!id){
                $scope.isDeleteBtnShow = false;
            };

            wdcContacts.delContacts(delId).success(function(){
            }).error(function(){
                wdAlert.alert('Failed to delete selected contacts', '', 'OK').then(function(){$('.modal-backdrop').html('');location.reload();});
            });

        //then最后的括号
        },

        //cancel时
        function(){
            $('.modal-body').html('');
        });
    };

    //取消所有
    $scope.deselectAll = function(){
        $scope.isDeselectBtnShow = false;
        $scope.isDeleteBtnShow = false;
        $scope.selectedNum = 0;
        GA('Web Contacts:click Deselect all button');
        for(var i = 0, l = $scope.pageList.length;i<l;i++){
            $scope.pageList[i].checked = false ;
        };
    };

    $scope.clickChecked = function(isChecked){

        if(isChecked === false){
            $scope.selectedNum -= 1;
            GA('Web Contacts:click checkbox unchecked');
        }else{
            $scope.selectedNum += 1;
            GA('Web Contacts:click checkbox checked');
        };

        if($scope.selectedNum > 0){
            $scope.isDeselectBtnShow = true;
            $scope.isDeleteBtnShow = true;
        }else{
            $scope.isDeselectBtnShow = false;
            $scope.isDeleteBtnShow = false;
        }
    };

    //编辑联系人
    $scope.editContact = function(id){

        GA('Web Contacts:click edit contact button');
        $scope.isPhotoUploadShow = true;
        G_keyContact.done();

        var wrap = $('.contacts-edit');
        var ele =  wrap.children('.info');

        //addNewContact方法中调用了editContact方法
        if(G_status !== 'new'){
            G_status = 'edit';
            ele.find('.account').hide();
        };

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
        ele.find('span.delete').show();
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

        $scope.isEditBtnShow = false;
        $scope.isDelBtnShow = false;
        $scope.isSaveBtnShow = true;
        $scope.isCancelBtnShow = true;

        //添加新item的功能
        ele.find('.btn-addNewItem').show();

        $('input').one('click',function(e){
            e.target.select();
        });

        //图片上传
        photoUpload();
    };

    //保存联系人
    $scope.saveContact = function(id){

        G_keyContact = wdKey.push('contacts');
        G_keyContact.done();

        //检查是否用户没有填入信息
        if(wdcContacts.checkBlank($scope.contact)){
            wdAlert.alert('Please enter the contact','','OK');
            return;
        };

        //UI操作
        var wrap = $('.contacts-edit');
        var ele =  wrap.children('.info');
        $scope.isContactsEditShow = false;
        $scope.isRightLoadShow = true;
        $scope.isPhotoUploadShow = false;

        var saveData = changeDataTypeBack($scope.contact);

        switch(G_status){
            case 'edit':
                GA('Web Contacts:click save the editing contact button');
                var editData = saveData;
                wdcContacts.editContact(editData).success(function(data){

                    for(var i = 0 , l = $scope.pageList.length;i<l; i++ ){
                        if(!!id && $scope.pageList[i]['id']===id){
                            $scope.pageList[i] = getListItem(data);
                        };
                    };
                    for(var i = 0 , l = G_list.length;i<l; i++ ){
                        if(!!id && G_list[i]['id']===id){
                            G_list[i] = getListItem(data);
                        };
                    };
                    for(var i = 0 , l = G_contacts.length;i<l; i++ ){
                        if(!!id && G_contacts[i]['id']===id){
                            G_contacts[i] = data;
                        };
                    };
                    showContacts(data['id']);
                }).error(function(){
                    wdAlert.alert('Failed to save edits', '', 'OK').then(function(){showContacts($scope.contact.id);});
                    GA('Web Contacts:save the editing contact failed');
                });
            break;
            case 'new':
                GA('Web Contacts:click save the new contact button');
                var editData = [];
                editData.push(saveData);
                var account = editData[0].account || {name:'',type:''};
                editData[0]['account_name'] = account['name'];
                editData[0]['account_type'] = account['type'];

                wdcContacts.newContact(editData).success(function(data){
                    G_contacts.unshift(data[0]);
                    $scope.pageList.shift();
                    $scope.pageList.unshift(getListItem(data[0]));
                    getList(data,true);
                    showContacts(data[0]['id']);
                    $('ul.contacts-list')[0].scrollTop = 0;
                }).error(function(){
                    wdAlert.alert('Failed to save new contact', '', 'OK').then(function(){showContacts(G_showingContact[id]);});
                    $scope.pageList.shift();
                    showContacts(G_showingContact['id']);
                    G_status = '';
                    GA('Web Contacts:save new contact failed');
                });

            break;
        };
        G_status = '';
    };

    //取消编辑联系人
    $scope.cancelContact = function(id){
        GA('Web Contacts:click cancel contact button');
        $scope.isPhotoUploadShow = false;
        G_keyContact = wdKey.push('contacts');
        switch(G_status){
            case 'new':
                $scope.pageList.shift();

                //无联系人时显示无联系人界面
                if(!G_list.length){
                    $('.wdj-contacts .wd-blank').show();
                }else{
                    id = G_list[0].id;
                };

            break;
            case 'edit':
                id = G_clicked.id;
            break;
        };
        G_status = '';
        var data = getContactsById(id,G_contacts);
        for( var i in data ){
            data[i] = null;
        };
        $.extend(true,data,G_showingContact);

        var wrap = $('.contacts-edit');
        $scope.isContactsEditShow = true;
        var ele =  wrap.children('.info');
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
            wrap.find('span.delete').show();
            var sel = wrap.find('select').show();
            var label = wrap.find('input.label');
            for(var i = 0, l = label.length ; i<l ; i++){
                if( sel.eq(i).val().indexOf('CUSTOM') > 0 ){
                    label.eq(i).show();
                };
            };
        },100);
    };

    //删除一个条目
    $scope.delItem = function(key,item){
        for(var i = 0 , l = $scope.contact[key].length; i<l; i++ ){
            if( $scope.contact[key][i] == item ){
                $scope.contact[key].splice(i,1);
            };
        };
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

        GA('Web Contacts:click add a New Contacts button');
        if( G_status == 'new'){ return; };
        $scope.isNoContactsShow = false;
        $('.wdj-contacts .wd-blank').hide();
        $scope.isRightLoadShow = false;
        var wrap = $('.contacts-edit .info');
        wrap.find('img.photo').attr('src',G_defaultPhoto);
        //$scope.searchText = '';

        //获取用户账户
        wdcContacts.getAccount().success(function(data) {
            $scope.contact.account = data[0];
            $scope.accounts = data;
            if(data.length > 1){
                wrap.find('div.account').show().children().show();
            };
        }).error(function(){
            //wdAlert.alert("");
        });

        var obj = {
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

        G_clicked['clicked'] = false;
        G_clicked = {
            id : "",
            name : "New contact",
            phone : "",
            photo : G_defaultPhoto,
            clicked : true
        };
        $scope.pageList.unshift(G_clicked);
        $scope.contact = obj;
        G_status = 'new';
        setTimeout(function(){
            $('ul.contacts-list')[0].scrollTop = 0;
            $scope.editContact();
            $scope.isContactsEditShow = true;
            $scope.$apply();
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

    function photoUpload(){
        var uploader = new fineuploader.FineUploaderBasic({
            button: $('.contacts-edit .photoUpload')[0],
            request: {
                endpoint: wdDev.wrapURL('/resource/contacts/'+$scope.contact.id+'/upload/')
            },
            validation: {
                acceptFiles: 'image/*'
            },
            cors: {
                expected: true,
                sendCredentials: true
            },
            autoUpload: false,
            callbacks: {
                onSubmit: function(id) {
                    var file = uploader.getFile(id);
                    if(!file.type.match('image.*')){
                        return;
                    }else{
                        var reader = new FileReader();
                        reader.readAsDataURL(file);

                        //显示为base64
                        reader.onload = function(e){
                            $('.contacts-edit img.photo').attr('src',e.target.result);
                        };
                    };
                }
            }
        });

        $('.contacts-edit .footer .btn-save').click(function() {
            uploader.uploadStoredFiles();
        });
    };


    //搜索功能
    $('.wdj-contacts .btn-all .search input').on('keyup',_.debounce(function(){
        $scope.searchContacts();
        $scope.$apply();
    },300));

    $('.wdj-contacts .btn-all .search .icon-clear').on('click',function(){
        $scope.pageList = G_list;
        showContacts(G_list[0]['id']);
    });

    $scope.clearSearch = function(){
        $scope.isNoContactsShow = false;
        $scope.searchContacts();
    };

    //搜索联系人功能
    $scope.searchContacts = function(){
        $scope.isLoadMoreBtnShow = false;
        $scope.isListLoadShow = true;

        $scope.pageList = [];
        G_searchList = [];
        $scope.searchText = $scope.searchText || '';
        var text = $scope.searchText.toLocaleLowerCase();
        $scope.isNoContactsShow = false;

        //调用搜索接口
        var search = wdcContacts.searchContacts(text).then(function(data){
            $scope.isListLoadShow = false;
            for(var i = 0 , l = data.length ; i < l ; i += 1 ){
                G_searchList.push(getListItem(data[i]));
            }
            if(!!G_searchList[0]){
                $scope.isNoContactsShow = false;
                G_clicked['clicked'] = false;
                $scope.pageList = G_searchList.slice(0,DATA_LENGTH_ONCE);
                if($scope.pageList.length < G_searchList.length){
                    $scope.isLoadMoreBtnShow = true;
                }else{
                    $scope.isLoadMoreBtnShow = false;
                };
                $scope.pageList[0]['clicked'] = true;
                G_clicked = $scope.pageList[0];
                showContacts($scope.pageList[0]['id']);
            }else{
                $scope.isNoContactsShow = true;
                $scope.isLoadMoreBtnShow = false;
                showContacts();
            };
            $('ul.contacts-list')[0].scrollTop = 0;
        });
    };

    //加载更多
    $scope.loadMore = function(){
        var pl = $scope.pageList.length;
        var l = pl + DATA_LENGTH_ONCE;
        if( !!$scope.searchText ){
            $scope.pageList = $scope.pageList.concat(G_searchList.slice(pl,l));
            if(l>$scope.pageList.length){
                $scope.isLoadMoreBtnShow = false;
            };
        }else{
            $scope.pageList = $scope.pageList.concat(G_list.slice(pl,l));
            if(l>G_list.length){
                $scope.isLoadMoreBtnShow = false;
            };
        };
    };

    //主函数开始
    $scope.isContactsEditShow = false;
    $scope.isLeftLoadingShow = true;
    $scope.isRightLoadShow = true;
    $scope.isLoadMoreBtnShow = false;
    $scope.isListLoadShow = false;
    $scope.isPhotoUploadShow = false;
    $scope.isNoContactsShow = false;
    $scope.isDeselectBtnShow = false;
    $scope.isDeleteBtnShow = false;
    $scope.isEditBtnShow = true;
    $scope.isDelBtnShow = true;
    $scope.isSaveBtnShow = false;
    $scope.isCancelBtnShow = false;
    $scope.isNewContactDisable = true;

    //被选中的数量
    $scope.selectedNum = 0;

    //用于版本检测
    $scope.serverMatchRequirement = $route.current.locals.versionSupport;
    //$scope.list = G_list;
    $scope.pageList = G_pageList;
    $scope.typeMap = G_typeMap;
    $scope.protocolMap = G_protocol;
    $scope.showContacts = showContacts;
    window.wdcContacts = wdcContacts;
    wdKey.$apply('up', 'contacts', function() {
        console.log('up');
        for (var i = 0 , l = G_pageList.length ; i < l ; i += 1 ){
            if( (i - 1 < l) && G_pageList[i]['clicked'] ){
                showContacts(G_pageList[i-1]['id']);
                $('ul.contacts-list')[0].scrollTop = (i-1)*68;
                return;
            }
        }
    });
    wdKey.$apply('down', 'contacts', function() {
        for (var i = 0 , l = G_pageList.length ; i < l ; i += 1 ){
            if( (i + 1 < l) && G_pageList[i]['clicked'] ){
                showContacts(G_pageList[i+1]['id']);
                $('ul.contacts-list')[0].scrollTop = (i+1)*68;
                return;
            }
        }
    });

    $scope.$on('$destroy', function() {
        G_keyContact.done();
    });

    init();

//return的最后括号
}];
});
