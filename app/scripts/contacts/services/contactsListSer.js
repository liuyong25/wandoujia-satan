define( [
    'underscore'
], function(
    _
) {
    'use strict';

//$q是promise
return [ '$http', '$q', function ( $http, $q ) {

    //配置项
    var CONFIG = {

        //每次拉取联系人列表数据的长度
        'dataLengthOnce' : 50,

        //统一的超时时间
        'timeout' : 7000
    };

    var global = {

        //全局存储联系人列表的数据
        'contacts' : [],

        //数据是否拉取完成
        'dataFinish' : false,

        //临时存储onchange中触发的函数
        'fun' : undefined
    };

    var me = this;

    //获取数据
    function getData( offset, length, cursor ) {
        cursor = cursor || 0;

        return $http({
            method: 'get',
            url: '/resource/contacts',
            timeout:CONFIG.timeout,
            params: {
                'length':length,
                'cursor':cursor,
                'offset':offset
            }
        }).success( function( data ) {

            _.each( data, function( value ) {
                global.contacts.push( value );
            });

            global.fun.call(me,data);

            //数据未取完
            if ( data.length === length ) {

                //如果支持cursor打开这个接口，但是速度不如没有cursor的快
                //getData(1,CONFIG.dataLengthOnce,data[l-1].id);
                //不支持cursor取数据
                getData( global.contacts.length, CONFIG.dataLengthOnce, null );

            } else {

                global.dataFinish = true;

            }

        }).error( function() {
            //wdAlert.alert('Lost connection to phone','Please refresh your browser','Refresh').then(function(){location.reload();});
        });
    }

    //整个service返回接口
    return {

        init : function(){

            if(!global.contacts.length){

                //自动加载数据，return 一个promise
                return getData( 0, CONFIG.dataLengthOnce, null );
            }

        },

        onchange : function(fun) {

            global.fun = fun;
            if (global.contacts.length) {

                //这里兼容之前loadmore的逻辑
                global.fun.call( me,global.contacts.slice( 0 , CONFIG.dataLengthOnce ) );
                global.fun.call( me,global.contacts.slice( CONFIG.dataLengthOnce + 1 ) );
            }
        },

        //取得当前已加载的数据
        getContacts : function() {
            return global.contacts;
        },

        getLoadStatus : function() {
            return global.dataFinish;
        },

        //根据query搜索联系人
        search : function(query) {
            query = query.toLocaleLowerCase();
            var list = [];

            //如果数据未加载完整，从后端搜索，数据完整从前端搜索
            // if( !global.dataFinish ) {

            // }else{

                _.each( global.contacts, function( value ) {

                    //首先查找名字
                    if( ( !!value[ 'display_name' ] && value[ 'display_name' ].toLocaleLowerCase().indexOf( query ) >= 0 ) ){
                        list.push( value );
                    }else{

                        //查找电话
                        _.each(value[ 'phone' ],function( v ) {
                            if( ( !!v[ 'number' ] && v[ 'number' ].toLocaleLowerCase().indexOf( query ) >= 0 ) ){
                                list.push( value );
                            }
                        });

                    }

                });

            // }

            return list;
        },

        //根据id取得信息
        getContactInfoById:function(id) {
            for (var i = 0; i < global.contacts.length; i+=1 ) {
                if( global.contacts[ i ][ 'id' ] === id ){
                    return global.contacts[ i ];
                }
            }
        },

        //传入id或者是数组
        delContacts:function(ids){
            switch(typeof ids){

                //删除一个
                case 'number':
                case 'string':

                break;

                //删除多个
                case 'array':

                break;
            }
        },

        newContact:function(news){

            //TODO:需要传入对应的account信息
            var newData = [];
            switch(typeof news){
                case 'array':
                    newData = news;
                break;
                case 'object':
                    newData.push(news);
                break;
            }
            return $http({
                method: 'post',
                url: '/resource/contacts/',
                data:newData,
                timeout:CONFIG.timeout
            }).success(function( data ) {

                // console.log(data);
                _.each(data,function(value) {
                    global.contacts.unshift(value);
                });
            }).error(function(){
                // wdAlert.alert('Failed to save new contact', '', 'OK').then(function(){showContacts(G_showingContact[id]);});
            });
        },

        editContact:function(editData){

            return $http({
                method: 'put',
                url: '/resource/contacts/' + editData.id,
                data:editData,
                timeout:CONFIG.timeout
            }).success(function(data) {

                // console.log(data);
                for(var i = 0 ; i < global.contacts.length ; i += 1 ) {
                    if( global.contacts[i]['id'] === editData.id ){
                        global.contacts[i] = editData;
                        return;
                    }
                }

            }).error(function(){
                // wdAlert.alert('Failed to save edits', '', 'OK').then(function(){showContacts($scope.contact.id);});
            });
        },

        //检查当前输入是否为空，为空返回true
        checkBlank : function(contact) {
            if(!!contact['name']['given_name'] ||!!contact['name']['middle_name']||!!contact['name']['family_name']  ){
                return false;
            }

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
                    }
                }
            }

            //用户没有输入，返回true
            return true;
        }


    };
}];
});
