define([
    'fineuploader'
    ],function(fineuploader){
    return ['$scope','$http','wdDev','wdSocket','wdAlert','$route','GA','wdcApplications',function($scope,$http,wdDev,wdSocket,wdAlert,$route,GA,wdcApplications){

        //$scope相关
        //展示应用列表
        $scope.list = [];

        //当前显示的应用详情
        $scope.info = {};

        //是否selectAll
        $scope.isSelectAll = false;

        //新安装的应用列表
        $scope.newList = [];

        //版本监测
        $scope.serverMatchRequirement = $route.current.locals.versionSupport;

        //数据是否加载完毕
        $scope.dataLoaded = false;

        //全局
        //应用数据列表
        var G_appList = [];

        //上传进度相关
        var G_uploadingList = [];

        //当前的手机是否开启未知来源提示，false当前用户未开启，true开启
        var G_unknownTips = false;

        function getAppListData(data){
            $scope.isLoadShow = false;
            $scope.dataLoaded = true;
            for( var i = 0,l = data.length ; i<l; i++ ){
                G_appList.push(changeInfo(data[i]));
            };
            $scope.list = G_appList;
            setTimeout(function(){
                uploadApk($('.installApp'));
            },300);
        };

        //改变某些字段的值
        function changeInfo(data){

            //将字节换算为兆
            data['apk_size'] = Number(data['apk_size']/1024/1024).toFixed(2);
            switch(data['installed_location']){
                case 1:
                    data['installed_location'] = "Phone memory";
                break;
                case 2:
                    data['installed_location'] = "SD card";
                break;
            };

            //是否显示提示
            data['confirmTipShow'] = false;

            //是否显示安装成功
            data['doneTipShow'] = false;

            data['checked'] = false;
            return data;
        };

        //取得具体应用的数据信息
        function getAppInfo(data,package_name){
            for(var i = 0 , l = data.length; i<l;i++ ){
                if(data[i]['package_name'] == package_name){
                    for(var m = 0 , n = data[i]['requested_permission'].length; m < n; m++ ){
                        data[i]['requested_permission'][m] = $scope.$root.DICT.applications.PERMISSIONS[data[i]['requested_permission'][m]] || data[i]['requested_permission'][m];
                    };

                    return data[i];
                };
            };
        };

        //删除单个应用
        function delApp(package_name){
            wdAlert.confirm(
                $scope.$root.DICT.applications.DEL_ONE_APP.TITLE,
                $scope.$root.DICT.applications.DEL_ONE_APP.CONTENT,
                $scope.$root.DICT.applications.DEL_ONE_APP.AGREE,
                $scope.$root.DICT.applications.DEL_ONE_APP.CANCEL
            ).then(function(){
                $http({
                    method: 'delete',
                    url: '/resource/apps/'+package_name
                }).success(function(data) {
                }).error(function(){
                });
                for(var i = 0 , l = $scope.list.length;i < l ; i++ ){
                    if($scope.list[i]['package_name'] == package_name ){
                        $scope.list[i]['confirmTipShow'] = true;
                        break;
                    };
                };
                var mask = $('.mask').css('opacity',0);
                setTimeout(function(){
                    mask.hide().find('.info').hide();
                    $('dd.confirm').css('opacity',0.8);
                },500);
            },function(){

            });
        };

        //删除多个
        function delMoreApps(){
            GA('Web applications : click the top uninstall button');
            wdAlert.confirm(
                $scope.$root.DICT.applications.DEL_MORE_APPS.TITLE,
                $scope.$root.DICT.applications.DEL_MORE_APPS.CONTENT,
                $scope.$root.DICT.applications.DEL_MORE_APPS.AGREE,
                $scope.$root.DICT.applications.DEL_MORE_APPS.CANCEL
            ).then(function(){
                var dels = [];
                for(var i = 0 , l = $scope.list.length ; i<l ; i++ ){
                    if( $scope.list[i]['checked'] == true ){
                        dels.push($scope.list[i]['package_name']);
                        $scope.list[i]['confirmTipShow'] = true;
                        $scope.list[i]['checked'] = false;
                    };
                };
                setTimeout(function(){
                    $('.header button.delete-all').hide();
                    $('dd.toolbar').css('opacity','');
                    $('dd.confirm').css('opacity',0.8);
                },500);

                var i = 0;
                del(dels[i]);
                function del(package_name){
                    $http({
                        method: 'delete',
                        url: '/resource/apps/'+ package_name
                    }).success(function(data) {
                        if(!!dels[i]){
                            del(dels[i]);
                            i++;
                        };
                    }).error(function(){
                    });
                };
            },function(){

            });
        };

        //上传APK
        function uploadApk(btnEles){
            for(var i = 0,l = btnEles.length;i<l;i++ ){

                var uploader = new fineuploader.FineUploaderBasic({
                    button: btnEles[i],
                    request: {
                        endpoint: wdDev.wrapURL('/resource/apps/upload')
                    },
                    validation: {
                        allowedExtensions:['apk']
                    },
                    cors: {
                        expected: true,
                        sendCredentials: true
                    },
                    message:{
                        typeError:"The file's type is error!"
                    },
                    autoUpload: true,
                    callbacks: {
                        onSubmit: function(id,name) {
                            showUploadApp(name);
                            $('.wd-blank').hide();
                        },
                        onProgress: function(id,name,progress,total){
                            updateUpload(name,Math.floor(progress/total*100));
                        },
                        onComplete: function(id, name, data){
                            var result = data.result[0];
                            for(var i = 0, l = $scope.newList.length; i < l ; i++ ){
                                if($scope.newList[i]['file_name'] == name){
                                    $scope.newList[i]['package_name'] = result['package_name'];
                                    $scope.newList[i]['apk_path'] =  result['apk_path'];
                                    $scope.newList[i]['unknown_sources'] = result['unknown_sources'];
                                    if(!G_unknownTips){
                                        G_unknownTips = result['unknown_sources'];
                                    };
                                    if(!G_unknownTips){
                                        showUnknowTips();
                                    };
                                };
                            };
                        },
                        onerror:function(){
                            //console.log();
                        }
                    }
                });
            };
        };

        //上传安装应用时，显示对应的应用
        function showUploadApp(file_name){
            var item = {
                file_name:file_name,
                progress:'1%',
                progressShow:true,
                doneTipShow: false
            };
            $scope.newList.unshift(item);
            $scope.$apply();
        };

        //更新上传进度
        function updateUpload(name,progress){
            for(var i = 0 , l = $scope.newList.length; i < l ; i++ ){
                if( $scope.newList[i]['file_name'] == name ){
                    if( progress == 100 ){
                        $scope.newList[i]['confirmTipShow'] = true;
                        $scope.newList[i]['progressShow'] = false;
                        $('dd.confirm').css('opacity',0.8);
                        $scope.$apply();
                    }else{
                        $scope.newList[i]['progress'] = ""+progress+"%";
                        $scope.$apply();
                    };
                    break;
                };
            };
        };

        //显示未知来源应用提示
        function showUnknowTips(){
            var mask = $('.mask');
            var top = $(document).height()*0.2;
            mask.children('.unknowApkTips').show().css({
                'top':top
            });
            setTimeout(function(){
                mask.show();
                setTimeout(function(){
                    mask.css('opacity',1);
                },30);
            },200);
        };

        function reinstall(item){
            var apk_paths = [];
            if(!!item){
                GA('Web applications : click reinstall button');
                apk_paths.push({'apk_path':item['apk_path']});
            }else{
                GA('Web applications : click the complete button of unknown sources tips page');
                for(var i = 0,l = $scope.newList.length; i<l; i++ ){
                    apk_paths.push({'apk_path':$scope.newList[i]['apk_path']});
                };
                $('.mask').hide().children('.unknowApkTips').hide();
            };

            $http({
                method: 'post',
                url: '/resource/apps/install',
                data:apk_paths
            }).success(function(data) {

            }).error(function(){

            });
        };

        //上传之后或者过程中关闭那个应用
        function closeUploadApp(item){
            GA('Web applications : click cancel install button');
            for(var i = 0,l = $scope.newList.length;i<l;i++ ){
                if($scope.newList[i]['file_name'] == item['file_name']){
                    $scope.newList.splice(i,1);
                    break;
                };
            };
            if($scope.list.length == 0 && $scope.newList.length == 0){
                $('.wd-blank').show();
            };
        };

        //删除confirm提示
        function closeConfirm(item,e){
            $(e.target.parentNode.parentNode).find('.toolbar').css('opacity','');
            item['confirmTipShow'] = false;
            GA('Web applications : click cancel uninstall button');
        };

        //显示对应的应用
        function showAppInfo(package_name){
            GA('Web applications : show the app detail informations');
            var mask = $('.mask');
            $scope.info = getAppInfo(G_appList,package_name);
            setTimeout(function(){
                mask.show().children('.info').show();
                setTimeout(function(){
                    mask.css('opacity',1);
                },30);
            },200);
        };

        function closeMask(){
            var mask = $('.mask').css('opacity',0);
             setTimeout(function(){
                mask.hide();
                mask.find('.info').hide();
                mask.find('.unknowApkTips').hide();
            },500);
        };

        function selectAll(){
            var eles = $('.apps-list dl dd.toolbar');
            if($scope.isSelectAll){
                GA('Web applications : click deselect all button');
                $scope.isSelectAll = false;
                for(var i = 0, l = $scope.list.length; i < l ; i ++ ){
                    $scope.list[i]['checked'] = false;
                    eles.eq(i).css('opacity','');
                };
                $('.header button.select-all p').text($scope.$root.DICT.applications.BUTTONS.SELECT_ALL);
                $('.header button.delete-all').hide();
            }else{
                $scope.isSelectAll = true;
                GA('Web applications : click select all button');
                for(var i = 0, l = $scope.list.length; i < l ; i ++ ){
                    if(!$scope.list[i]['confirmTipShow']){
                        $scope.list[i]['checked'] = true;
                        eles.eq(i).css('opacity',1);
                    };
                };
                $('.header button.select-all p').text($scope.$root.DICT.applications.BUTTONS.DESELECT_ALL);
                $('.header button.delete-all').show();
            };
        };

        function checkedApp(e){
            GA('Web applications : click Checkbox');
            if($(e.target).prop('checked')){
                $('.header button.delete-all').show();
                $(e.target.parentNode.parentNode).css('opacity',1);
            }else{
                $(e.target.parentNode.parentNode).css('opacity','');
                for(var i = 0, l = $scope.list.length; i < l ; i ++ ){
                    if($scope.list[i]['checked']){
                        return;
                    };
                };
                $('.header button.delete-all').hide();
            };
        };

        function clickInstallApk(){
            GA('Web applications :click install apk button');
        };

        function clickHoverUninstall(){
            GA('Web applications : click the hover uninstall button');
        };

        function clickInfoUninstall(){
            GA('Web applications : click the uninstall button of detail info page');
        };

        function clickRetryUninstall(){
            GA('Web applications : click retry uninstall button');
        };

        //webSocket处理
        wdSocket
            .on('app_install', function(e, message) {
                var name = message.data.packageName;
                $http({
                    method: 'get',
                    url: '/resource/apps/'+name
                }).success(function(data){
                    for(var i = 0,l = $scope.newList.length;i<l; i++ ){
                        if( $scope.newList[i]['package_name'] == data['package_name'] ){
                            $scope.newList.splice(i,1);
                            break;
                        };
                    };

                    //如果已经安装，移除掉之前版本
                    for(var i = 0,l = $scope.list.length; i<l; i++ ){
                        if($scope.list[i]['package_name'] == data['package_name'] ){
                            $scope.list.splice(i,1);
                            break;
                        };
                    };
                    data['doneTipShow'] = true;
                    $scope.list.unshift(changeInfo(data));
                    setTimeout(function(){
                        data['doneTipShow'] = false;
                        $scope.$apply();
                    },4000);
                }).error(function(){
                });
            })
            .on('app_uninstall', function(e, message) {
                var name = message.data.packageName;
                for(var i = 0,l = $scope.list.length;i<l;i++ ){
                    if($scope.list[i]['package_name']==name){
                        $scope.list.splice(i,1);
                        $scope.$apply();
                        break;
                    };
                };
                if( ($scope.list.length == 0) && ($scope.newList.length == 0) ){
                    setTimeout(function(){
                        uploadApk($('.installApp'));
                    },300);
                };
            });

        //主程序
        $scope.isLoadShow = true;
        wdcApplications.onchange(getAppListData);

        //需要挂载到socpe上面的方法
        $scope.showAppInfo = showAppInfo;
        $scope.closeMask = closeMask;
        $scope.closeConfirm = closeConfirm;
        $scope.selectAll = selectAll;
        $scope.checkedApp = checkedApp;
        $scope.delApp = delApp;
        $scope.delMoreApps = delMoreApps;
        $scope.closeUploadApp = closeUploadApp;
        $scope.reinstall = reinstall;
        $scope.clickInstallApk = clickInstallApk;
        $scope.clickHoverUninstall = clickHoverUninstall;
        $scope.clickInfoUninstall = clickInfoUninstall;
        $scope.clickRetryUninstall = clickRetryUninstall;

//最后的括号
    }];
});
