define([
    'fineuploader'
    ],function(fineuploader){
    return ['$scope','$http','wdDev',function($scope,$http,wdDev){

        //$scope相关
        //展示应用列表
        $scope.list = [];

        //当前显示的应用详情
        $scope.info = {};

        //是否selectAll
        $scope.isSelectAll = false;

        //新安装的应用列表
        $scope.newList = [];

        //全局
        //应用数据列表
        var G_appList = [];

        //权限显示对照表
        var G_permissionWord = {

        };

        function getAppListData(){
            $http({
                method: 'get',
                url: '/resource/apps?length=9999'
            }).success(function(data) {
                console.log(data);
                for( var i = 0,l = data.length ; i<l; i++ ){
                    G_appList.push(changeInfo(data[i]));
                };
                $scope.list = G_appList;
                changeAppsBlock();
            }).error(function(){
                //wdAlert.alert('Lost connection to phone','Please refresh your browser','Refresh').then(function(){location.reload();});
            });
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
            data['checked'] = false;
            return data;
        };

        //取得具体应用的数据信息
        function getAppInfo(data,package_name){
            for(var i = 0 , l = data.length; i<l;i++ ){
                if(data[i]['package_name'] == package_name){
                    return data[i];
                };
            };
        };

        //删除单个应用
        function delApp(package_name){
            $http({
                method: 'delete',
                url: '/resource/apps/'+package_name
            }).success(function(data) {

            }).error(function(){
                //wdAlert.alert('Lost connection to phone','Please refresh your browser','Refresh').then(function(){location.reload();});
            });
        };

        //删除多个
        function delMoreApps(){
            var dels = [];
            for(var i = 0 , l = $scope.list.length ; i<l ; i++ ){
                if( $scope.list[i]['checked'] == true ){
                    dels.push($scope.list[i]['package_name']);
                };
            };
            for(var i = 0 , l = dels.length;i<l;i++ ){
                for(var m = 0 , n = $scope.list.length ; m<n ; m++ ){
                    if( $scope.list[m]['checked'] == true ){
                        $scope.list.splice(m,1);
                        break;
                    };
                };
            };

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
                    //wdAlert.alert('Lost connection to phone','Please refresh your browser','Refresh').then(function(){location.reload();});
                });
            };
            $('.header button.delete-all').hide();
        };

        //上传APK
        var uploader = new fineuploader.FineUploaderBasic({
            button: $('.installApp')[0],
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
            autoUpload: false,
            callbacks: {
                onSubmit: function(id,name) {
                    showUploadApp(name);
                }
            }
        });

        //上传安装应用时，显示对应的应用
        function showUploadApp(package_name){
            var item = {
                package_name:package_name
            };
            $scope.newList.push(item);
            $scope.$apply();
            changeAppsBlock();
        };

        //显示对应的应用
        function showAppInfo(package_name){
            var mask = $('.mask');
            var top = $(document).height()*0.2;
            mask.children('.info').css({
                'top':top
            });
            mask.find('.detail-info').css('top',top+15+105);
            $scope.info = getAppInfo(G_appList,package_name);
            setTimeout(function(){
                mask.show();
            },100);
        };

        function closeAppInfo(){
            $('.mask').hide();
        };

        function selectAll(){
            var eles = $('.apps-list dl dd.toolbar');
            if($scope.isSelectAll){
                $scope.isSelectAll = false;
                for(var i = 0, l = $scope.list.length; i < l ; i ++ ){
                    $scope.list[i]['checked'] = false;
                    eles.eq(i).css('opacity','');
                };
                $('.header button.delete-all').hide();
            }else{
                $scope.isSelectAll = true;
                for(var i = 0, l = $scope.list.length; i < l ; i ++ ){
                    $scope.list[i]['checked'] = true;
                    eles.eq(i).css('opacity',1);
                };
                $('.header button.delete-all').show();
            };
        };

        function checkedApp(e){
            if($(e.target).prop('checked')){
                $('.header button.delete-all').show();
                $(e.target.parentNode.parentNode).css('opacity',1);
            }else{
                $(e.target.parentNode.parentNode).css('opacity','');
                for(var i = 0, l = $scope.list.length; i < l ; i ++ ){
                    if($scope.list[i]['checked']){
                        return;
                    }else{
                        $('.header button.delete-all').hide();
                    };
                };
            };
        };

        //改变应用的宽度和高度
        function changeAppsBlock(){
            var docWidth = $(document).width()-40;
            var n = Math.floor(docWidth/170);
            var w = docWidth/n - 10;
            setTimeout(function(){
                $(".apps-list dl").width(w).height(w);
            },100);
            $(window).one("resize",changeAppsBlock);
        };

        //主程序
        getAppListData();

        //需要挂载到socpe上面的方法
        $scope.showAppInfo = showAppInfo;
        $scope.closeAppInfo = closeAppInfo;
        $scope.selectAll = selectAll;
        $scope.checkedApp = checkedApp;
        $scope.delApp = delApp;
        $scope.delMoreApps = delMoreApps;

//最后的括号
    }];
});
