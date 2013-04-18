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

        //全局
        //应用数据列表
        G_appList = [];

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

        //删除应用
        function delApp(){
            $http({
                method: 'delete',
                url: ''
            }).success(function(data) {

            }).error(function(){
                //wdAlert.alert('Lost connection to phone','Please refresh your browser','Refresh').then(function(){location.reload();});
            });
        };

        //上传
        var uploader = new fineuploader.FineUploaderBasic({
            button: $('.installApp')[0],
            request: {
                endpoint: wdDev.wrapURL('/resource/apps/upload')
            },
            validation: {
                acceptFiles: ''
            },
            cors: {
                expected: true,
                sendCredentials: true
            },
            autoUpload: true,
            callbacks: {
                onSubmit: function() {

                }
            }
        });

        //显示对应的应用
        function showAppInfo(package_name){
            console.log(package_name);
            $('.mask').show();
            $scope.info = getAppInfo(G_appList,package_name);
        };

        function closeAppInfo(){
            $('.mask').hide();
        };

        function selectAll(){
            if($scope.isSelectAll){
                $scope.isSelectAll = false;
                for(var i = 0, l = $scope.list.length; i < l ; i ++ ){
                    $scope.list[i]['checked'] = false;
                };
            }else{
                $scope.isSelectAll = true;
                for(var i = 0, l = $scope.list.length; i < l ; i ++ ){
                    $scope.list[i]['checked'] = true;
                };
            };
        };

        function checkedApp(e){
            if($(e.target).prop('checked')){
                $(e.target.parentNode.parentNode).css('opacity',1);
            }else{
                $(e.target.parentNode.parentNode).css('opacity','');
            };
        };

        //改变应用的宽度和高度
        function changeAppsBlock(){
            var docWidth = $(document).width()-10;
            var n = Math.floor(docWidth/170);
            var w = docWidth/n - 10;
            setTimeout(function(){
                $(".apps-list dl").width(w).height(w);
            },100);
            $(window).one("resize",changeAppsBlock);
        };

        //主程序
        getAppListData();
        $scope.showAppInfo = showAppInfo;
        $scope.closeAppInfo = closeAppInfo;
        $scope.selectAll = selectAll;
        $scope.checkedApp = checkedApp;

//最后的括号
    }];
});
