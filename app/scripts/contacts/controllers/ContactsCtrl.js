define([
    'fineuploader'
], function(fineuploader){

return ['$scope','$http','wdAlert','wdDev','$route','GA','wdcContacts',
function ContactsCtrl($scope, $http, wdAlert , wdDev ,$route,GA,wdcContacts){

    //存储当前联系人的数据列表
    var G_contacts = [];

    //联系人列表
    var G_list = [];

    //当前显示的联系人列表
    var G_pageList = [];

    //搜索出的联系人列表
    var G_searchList = [];

    //每次拉取数据的长度
    //var G_dataLengthOnce = 50;
    var DATA_LENGTH_ONCE = 50;

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
    var G_debug = 0 ;

    //获取数据
    function init(){

        wdcContacts.init();
        wdcContacts.onchange(function(data){
            getData(data);
        });
    };

    //每次加载数据时触发
    function getData(data) {
        for ( var i = 0, l=data.length; i<l; i++ ){

            //修正默认头像
            if (!data[i].photo_path){
                data[i].photo_path = G_defaultPhoto;
            };
            G_contacts.push(data[i]);
        };
        getList(data);
        G_isFirst = false;
        G_dataFinish = wdcContacts.getLoadStatus();
    }

    function getListItem(data){
        var id = data.id || '';
        var name = (data.name && data.name.display_name) || 'No Name';
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

        if(G_isFirst){
            $('.wdj-contacts').children('.wd-loading').hide();
            $('.wdj-contacts .left').show();
            $('.wdj-contacts .right').show();
        };

        if( G_list.length < 1 && l<1 ){
            $('.wdj-contacts .wd-blank').show();
        };

        for(var i = 0; i<l; i++ ){
            var obj = getListItem(data[i]);

            //首次进入默认显示第一个联系人
            if (!i && G_isFirst) {
                $('.wdj-contacts .right .wd-loading').hide();
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

            $('.wdj-contacts .right .wd-loading').hide();
            if(!id){
                //$('.contacts-edit').hide();
                $scope.shouldContactsEditShow = false;
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
            };
            if(!data['photo_path']){
                data['photo_path'] = G_defaultPhoto;
            };
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

            //样式相关处理
            setTimeout(function(){
                $scope.shouldContactsEditShow = true;
                var wrap = $('.contacts-edit');
                wrap.find('div.editName').hide();
                wrap.find('p.name').show();
                wrap.find('p.remark').show();
                wrap.find('select').hide();
                wrap.find('input').hide();
                wrap.find('button.btn-addNewItem').hide();
                wrap.find('hr').show();
                wrap.find('span.delete').hide();
                if(G_dataFinish){
                    if(G_searchList.length>0){
                        if($scope.pageList.length < G_searchList.length){
                            $(".contacts-list .load-more").show();
                        }else{
                            $(".contacts-list .load-more").hide();
                        };
                    }else{
                        if($scope.pageList.length < G_list.length){
                            $(".contacts-list .load-more").show();
                        }else{
                            $(".contacts-list .load-more").hide();
                        };
                    };
                }else{
                    if(G_searchList.length>0){
                        if( $scope.pageList.length < G_searchList.length ){
                            $(".contacts-list .load-more").show();
                        }else{
                            $(".contacts-list .load-more").hide();
                        };
                    }else{
                        $(".contacts-list .load-more").show();
                    };
                };

                wrap.find('p.des').css('display','inline-block');
                wrap.find('p.detail').css('display','inline-block');
                if(!data.read_only){
                    wrap.find('.footer .btn-edit').show();
                    wrap.find('.footer .btn-del').show();
                }else{
                    wrap.find('.footer .btn-edit').hide();
                    wrap.find('.footer .btn-del').hide();
                };

                wrap.find('.footer .btn-save').hide();
                wrap.find('.footer .btn-cancel').hide();

                wrap.find('img.photo').off('mouseenter',showPhotoUpload);
                wrap.find('.photoUpload').hide().off('mouseout',hidePhotoUpload);

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
                if(!checkBlank($scope.contact)){
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

        //取得read only的账号
        var read_only = [];

        if(!id){
            for(var i = 0 , l = G_list.length ; i < l ; i ++){
                if( G_list[i].checked === true && G_list[i]['read_only'] ){
                    read_only.push(G_list[i]['name']);
                    G_list[i].checked = false;
                };
            };
        };

        var word = "";
        if(!!id){
            word = "contact";
        }else{
            word = "contacts";
        };
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
            G_selectAll = true;
            $scope.selectAll();
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
                $('.wdj-contacts .btn-all .btn-delete').hide();
            };

            httpDel(delId);

            //删除多个
            function httpDel(delId){
                var i = 0;
                var l = delId.length;
                var del = function(){
                    $http({
                        method: 'delete',
                        url: '/resource/contacts/'+delId[i],
                        timeout:7000
                    }).success(function(){
                        i++;
                        if(i<l){
                            del();
                        }else{
                            //全部删除
                        };
                    }).error(function(){
                        wdAlert.alert('Failed to delete selected contacts', '', 'OK').then(function(){$('.modal-backdrop').html('');location.reload();});
                    });
                };
                del();
            };

        //then最后的括号
        },

        //cancel时
        function(){
            $('.modal-body').html('');
        });
    };

    //选中所有
    $scope.selectAll = function(){
        if (G_selectAll === true) {
            GA('Web Contacts:click Deselect all button');
            $('.btn-all .btn-selectAll').html('<i class="icon-ab-sel"></i>Select all');
            $('.btn-all .btn-delete').hide();
            G_selectAll = false;
        }else{
            GA('Web Contacts:click select all button');
            $('.btn-all .btn-delete').show();
            $('.btn-all .btn-selectAll').html('<i class="icon-ab-sel"></i>Deselect all');
            G_selectAll = true;
        };
        for(var i = 0, l = $scope.pageList.length;i<l;i++){
            $scope.pageList[i].checked = G_selectAll ;
        };
    };

    $scope.clickChecked = function(isChecked){
        if(isChecked){
            GA('Web Contacts:click checkbox checked');
        }else{
            GA('Web Contacts:click checkbox unchecked');
        };

        for(var i = 0, l = $scope.pageList.length;i<l;i++){

            if($scope.pageList[i].checked){
                $('.btn-all .btn-delete').show();
                return;
            }
        };
        $('.btn-all .btn-delete').hide();
    };

    //编辑联系人
    $scope.editContact = function(id){

        GA('Web Contacts:click edit contact button');

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
        wrap.find('.photoUpload').on('mouseout',hidePhotoUpload);
        wrap.find('img.photo').on('mouseenter',showPhotoUpload);

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
        wrap.find('.footer .btn-del').hide();
        wrap.find('.footer .btn-save').show();
        wrap.find('.footer .btn-cancel').show();

        //添加新item的功能
        ele.find('.btn-addNewItem').show();

        $('input').one('click',function(e){
            e.target.select();
        });

        //图片上传
        photoUpload();
    };

    //检查当前输入是否为空，为空返回true
    function checkBlank(contact){
        if(!!contact['name']['given_name'] ||!!contact['name']['middle_name']||!!contact['name']['family_name']  ){
            return false;
        };

        for(var m in contact){
            for(var n in contact[m]){
                switch(m){
                    case 'IM':
                        if(!!contact[m][n]['data']){return false;}
                    break;
                    case 'address':
                        if(!!contact[m][n]['formatted_address']){return false;}
                    break;
                    case 'email':
                        if(!!contact[m][n]['address']){return false;}
                    break;
                    case 'address':
                        if(!!contact[m][n]['formatted_address']){return false;}
                    break;
                    // case 'name':
                    //     if(!!contact[m][n]['family_name']||!!contact[m][n]['given_name']||!!contact[m][n]['middle_name']){return false;}
                    // break;
                    case 'address':
                        if(!!contact[m][n]['formatted_address']){return false;}
                    break;
                    case 'note':
                        if(!!contact[m][n]['note']){return false;}
                    break;
                    case 'organization':
                        if(!!contact[m][n]['company']||!!contact[m][n]['title']){return false;}
                    break;
                    case 'phone':
                        if(!!contact[m][n]['number']){return false;}
                    break;
                    case 'relation':
                        if(!!contact[m][n]['name']){return false;}
                    break;
                    case 'website':
                        if(!!contact[m][n]['URL']){return false;}
                    break;
                };
            };
        }

        //用户没有输入，返回true
        return true;
    };

    //保存联系人
    $scope.saveContact = function(id){

        //检查是否用户没有填入信息
        if(checkBlank($scope.contact)){
            wdAlert.alert('Please enter the contact','','OK');
            return;
        };

        //UI操作
        var wrap = $('.contacts-edit');
        var ele =  wrap.children('.info');
        wrap.hide();
        $('.wdj-contacts .right .wd-loading').show();

        var saveData = changeDataTypeBack($scope.contact);

        switch(G_status){
            case 'edit':
                GA('Web Contacts:click save the editing contact button');
                var editData = saveData;
                $http({
                    method: 'put',
                    url: '/resource/contacts/'+id,
                    data:editData,
                    timeout:7000
                }).success(function(data){

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

                $http({
                    method: 'post',
                    url: '/resource/contacts/',
                    data:editData,
                    timeout:7000
                }).success(function(data){
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
        $scope.shouldContactsEditShow = true;
        var ele =  wrap.children('.info');


        wrap.find('img.photo').off('mouseenter',showPhotoUpload);
        wrap.find('.photoUpload').hide().off('mouseout',hidePhotoUpload);

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
        $('.contacts-list .no-contacts').hide();
        $('.wdj-contacts .left').show();
        $('.wdj-contacts .right').show();
        $('.wdj-contacts .wd-blank').hide();
        $('.wdj-contacts .right .wd-loading').hide();
        var wrap = $('.contacts-edit .info');
        wrap.find('img.photo').attr('src',G_defaultPhoto);
        //$scope.searchText = '';

        //获取用户账户
        $http({
            method: 'get',
            url: '/resource/accounts'
        }).success(function(data) {
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
            $scope.shouldContactsEditShow = true;
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

    function showPhotoUpload(){
        $('.contacts-edit .photoUpload').show();
    };

    function hidePhotoUpload(){
        $('.contacts-edit .photoUpload').hide();
    };

    // function photoUpload(e){
    //     var file = e.target.files[0];
    //     if(!file.type.match('image.*')){
    //         return;
    //     }else{
    //         G_photoBinary = file;
    //         var reader = new FileReader();
    //         reader.readAsDataURL(file);

    //         //显示为base64
    //         reader.onload = function(e){
    //             $('.contacts-edit img.photo').attr('src',e.target.result);
    //         };
    //     };
    // };

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
    $('.wdj-contacts .btn-all .search input').on('keyup',function(e){
        clearTimeout(G_searchTimer);
        G_searchTimer = setTimeout($scope.searchContacts,10);
    });
    $('.wdj-contacts .btn-all .search .icon-clear').on('click',function(){
        $scope.pageList = G_list;
        showContacts(G_list[0]['id']);
    });
    $scope.clearSearch = function(){
        $('ul.contacts-list li.no-contacts').hide();
        $scope.searchContacts();
    };

    //搜索联系人功能，根据联系人列表 G_list 搜索
    $scope.searchContacts = function(){
        $scope.pageList = [];
        G_searchList = [];
        $scope.searchText = $scope.searchText || '';
        var text = $scope.searchText.toLocaleLowerCase();
        for( var i = 0, l = G_list.length; i < l ; i++ ){
            if(  (G_list[i]['name'].toLocaleLowerCase().indexOf(text)>=0) || (G_list[i]['phone'].toLocaleLowerCase().indexOf(text)>=0) ){
                G_searchList.push(G_list[i]);
            };
        };
        if(!!G_searchList[0]){
            $('ul.contacts-list li.no-contacts').hide();
            G_clicked['clicked'] = false;
            $scope.pageList = G_searchList.slice(0,DATA_LENGTH_ONCE);
            if($scope.pageList.length < G_searchList.length){
                $(".contacts-list .load-more").hide();
            };
            $scope.pageList[0]['clicked'] = true;
            G_clicked = $scope.pageList[0];
            showContacts($scope.pageList[0]['id']);
        }else{
            $('ul.contacts-list li.no-contacts').show();
            $(".contacts-list .load-more").hide();
            showContacts();
        };
        $('ul.contacts-list')[0].scrollTop = 0;
        $scope.$apply();
    };

    //加载更多
    $scope.loadMore = function(){
        var pl = $scope.pageList.length;
        var l = pl + DATA_LENGTH_ONCE;
        if( !!$scope.searchText ){
            $scope.pageList = $scope.pageList.concat(G_searchList.slice(pl,l));
            if(l>$scope.pageList.length){
                $(".contacts-list .load-more").hide();
            };
        }else{
            $scope.pageList = $scope.pageList.concat(G_list.slice(pl,l));
            if(l>G_list.length){
                $(".contacts-list .load-more").hide();
            };
        };
    };

    //主函数开始
    $scope.shouldContactsEditShow = false;

    //用于版本检测
    $scope.serverMatchRequirement = $route.current.locals.versionSupport;
    //$scope.list = G_list;
    $scope.pageList = G_pageList;
    $scope.typeMap = G_typeMap;
    $scope.protocolMap = G_protocol;
    $scope.showContacts = showContacts;

    init();

    window.wdcContacts = wdcContacts;

//return的最后括号
}];
});
