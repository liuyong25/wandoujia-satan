define( [
    'underscore'
], function(
    _
) {
    'use strict';

//$q是promise
return [ '$http', '$q','$rootScope', function ( $http, $q, $rootScope ) {

    //配置项
    var CONFIG = {

        //每次拉取联系人列表数据的长度
        'dataLengthOnce' : 150,

        //搜索时需要的长度
        'searchLength' : 30,

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

            //数据未取完
            if ( data.length === length ) {

                //如果支持cursor打开这个接口，但是速度不如没有cursor的快
                //getData(1,CONFIG.dataLengthOnce,data[l-1].id);
                //不支持cursor取数据
                getData( global.contacts.length, CONFIG.dataLengthOnce, null );

            } else {

                global.dataFinish = true;

            }

            if(!!global.fun){
                global.fun.call(me,data);
            }

        });
    }

    $rootScope.$on('signout', function() {
        global.contacts = [];
    });

    function deselectAll(){
        for(var i = 0 , l = global.contacts.length ; i < l ; i ++ ){
            global.contacts[i]['checked'] = false;
        }
    }

    //整个service返回接口
    return {

        init : function(){

            if(!global.contacts.length){

                //自动加载数据，return 一个promise
                getData( 0, CONFIG.dataLengthOnce, null );
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

        getContactSuggestions: function(query) {
            return this.searchContacts(query, { sms: true });
        },

        //根据query搜索联系人
        searchContacts : function( query ,options ) {

            //是否查找email数据
            options = options || {};
            options.sms = options.sms || false;
            var defer = $q.defer();

            //如果没有加载过联系人数据，则自动启动启动加载
            if(!global.contacts.length){

                //自动加载数据，return 一个promise
                getData( 0, CONFIG.dataLengthOnce, null );
            }

            query = query.toLocaleLowerCase();

            var search = function( query , offset , length ) {

                //如果数据未加载完整，从后端搜索，数据完整从前端搜索
                if( !global.dataFinish ) {
                    $http({
                        method: 'get',
                        url: '/resource/contacts/search',
                        params: {
                            'keyword':query,
                            'length':length,
                            'offset':offset
                        }
                    }).success(function(data){
                        var list = [];
                        if ( options.sms ) {
                            _.each( data, function( value ) {
                                if( value[ 'phone' ][0] ){

                                    //给简版的逻辑
                                    _.each(value[ 'phone' ],function(v){
                                        list.push({
                                            name:value['name'][ 'display_name' ],
                                            phone:v['number']
                                        });
                                    });
                                }
                            });
                        }else{
                            list = data ;
                        }
                        defer.resolve(list);
                    });

                }else{

                    var list = [];

                    //返回的简版数据
                    var smsList = [];
                    _.each( global.contacts, function( value ) {

                        //首先查找名字
                        if( ( !!value['name'][ 'display_name' ] && value['name'][ 'display_name' ].toLocaleLowerCase().replace(/\s/g,'').indexOf( query ) >= 0 ) ){
                            list.push( value );

                            //给简版的逻辑
                            if(options.sms){
                                _.each(value[ 'phone' ],function(v){
                                    smsList.push({
                                        name:value['name'][ 'display_name' ],
                                        phone:v['number']
                                    });
                                });
                            }

                        }else{

                            //查找电话
                            for(var i = 0 , l = value[ 'phone' ].length ; i < l ; i += 1) {
                                var v = value[ 'phone' ][i];
                                if( ( !!v[ 'number' ] && v[ 'number' ].toLocaleLowerCase().replace(/\s/g,'').indexOf( query ) >= 0 ) ){
                                    list.push( value );

                                    //给简版的逻辑
                                    if(options.sms){
                                        smsList.push({
                                            name:value['name'][ 'display_name' ],
                                            phone:v[ 'number' ]
                                        });
                                    }

                                    return;
                                }
                            }

                            if ( !options.sms ) {
                                //查找email
                                for(var m = 0 , n = value[ 'email' ].length ; m < n ; m += 1) {
                                    var val = value[ 'email' ][m];
                                    if( ( !!val[ 'address' ] && val[ 'address' ].toLocaleLowerCase().replace(/\s/g,'').indexOf( query ) >= 0 ) ){
                                        list.push( value );
                                        return;
                                    }
                                }
                            }

                        }

                    });

                    //TODO:这块可以根据query是否一致来做些缓存
                    if(options.sms){
                        defer.resolve( smsList );
                    }else{
                        defer.resolve( list );
                    }

                }
            };

            //执行search
            search(query ,0 ,CONFIG.searchLength );

            defer.promise.query = query;

            //搜索更多
            defer.promise.loadMore = function( offset ){
                search( query ,offset ,CONFIG.dataLengthOnce );
                return defer.promise;
            };

            return defer.promise;
        },

        //根据id取得信息
        getContactInfoById:function(id) {
            for (var i = 0; i < global.contacts.length; i+=1 ) {
                if( global.contacts[ i ][ 'id' ] === id ){
                    return global.contacts[ i ];
                }
            }
        },

        //取得账号
        getAccount : function() {
            return $http({
                method: 'get',
                url: '/resource/accounts'
            }).success(function(data) {
            });
        },

        //传入id或者是数组
        delContacts:function(ids){
            var list = [];
            switch(typeof ids){

                //删除一个
                case 'number':
                case 'string':
                    list.push(ids);
                break;

                //删除多个
                default:
                    list = ids;
                break;
            }

            return $http({
                method: 'post',
                url: '/resource/contacts/delete',
                data: {'ids':list},
                timeout:CONFIG.timeout
            }).success(function(){
                for( var m = 0 , n = list.length ; m < n ; m += 1 ){
                    for (var i = 0 , l = global.contacts.length ; i < l ; i += 1 ){
                        if(list[m] === global.contacts[i]['id']){
                            global.contacts.splice(i,1);
                            return;
                        }
                    }
                }
            }).error(function(){
            });
        },

        //新建联系人
        newContact:function(news){

            //TODO:需要传入对应的account信息
            var newData = [];
            if(Object.prototype.toString.call(news) === '[object Array]'){
                newData = news;
            }else{
                newData.push(news);
            }

            return $http({
                method: 'post',
                url: '/resource/contacts/',
                data:newData,
                timeout:CONFIG.timeout
            }).success(function( data ) {
                _.each(data,function(value) {
                    global.contacts.unshift(value);
                });
            }).error(function(){
            });
        },

        //编辑联系人
        editContact:function(editData){

            return $http({
                method: 'put',
                url: '/resource/contacts/' + editData.id,
                data:editData,
                timeout:CONFIG.timeout
            }).success(function(data) {
                for(var i = 0 ; i < global.contacts.length ; i += 1 ) {
                    if( global.contacts[i]['id'] === editData.id ){
                        global.contacts[i] = editData;
                        return;
                    }
                }
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
