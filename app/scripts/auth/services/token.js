define([], function() {
'use strict';
return function() {
    var self = this;
    self.$get = ['$window', '$location', 'wdDev', '$rootScope',
        function($window, $location, wdDev, $rootScope) {
        var valid = false;
        var signoutDetectionTimer = null;
        return {
            valid: function() {
                return valid;
            },
            getToken: function() {
                return $window.localStorage.getItem('token');
            },
            setToken: function(newToken) {
                $window.localStorage.setItem('token', newToken);
                valid = true;
            },
            clearToken: function() {
                $window.localStorage.removeItem('token');
                valid = false;
            },
            signout: function() {
                this.clearToken();
                if (wdDev.query('ac')) {
                    $window.location = $window.location.pathname + '#/portal';
                }
                else {
                    $location.url('/portal');
                }
                $rootScope.$broadcast('signout');
                this.stopSignoutDetection();
            },
            startSignoutDetection: function() {
                var self = this;
                signoutDetectionTimer = setInterval(function() {
                    if (!self.getToken()) {
                        self.stopSignoutDetection();
                        $rootScope.$apply(function() {
                            self.signout();
                        });
                    }
                }, 1000);
            },
            stopSignoutDetection: function() {
                clearInterval(signoutDetectionTimer);
            },
            parse: getIp
            // function (input) {
            //     var type = parseInt(input.slice(0, 1), 10);
            //     var encryptedIp = parseInt(input.slice(3, input.length), 10);
            //     var ip;
            //     switch (type) {
            //     case 2:
            //         ip = '192.168.' + [
            //             Math.floor(encryptedIp / 256),
            //             encryptedIp % 256
            //         ].join('.');
            //         break;
            //     case 3:
            //         ip = '172.' + [
            //             Math.floor(encryptedIp / Math.pow(256, 2)),
            //             Math.floor((encryptedIp % Math.pow(256, 2)) / 256),
            //             encryptedIp % 256
            //         ].join('.');
            //         break;
            //     case 4:
            //         ip = [
            //             Math.floor(encryptedIp / Math.pow(256, 3)),
            //             Math.floor((encryptedIp % Math.pow(256, 3)) / Math.pow(256, 2)),
            //             Math.floor((encryptedIp % Math.pow(256, 2)) / 256),
            //             encryptedIp % 256
            //         ].join('.');
            //         break;
            //     }

            //     return ip;
            // }
        };
    }];
    var getIp = function(num){
      num = String(num);

      //类型
      var type = num.substr(0,1);

      //验证信息
      // var check = num.substr(1,2);

      //ip地址码
      var ipNum = num.substr(3);

      //真实ip
      var ip = '';

      switch(type){
        case '1':
          //1 ：预留出来做扩展用
        break;
        case '2':
          //2 ：由本地生成的验证码，IP地址是C类地址
          if(ipNum.length<5){return;}
          ipNum = ipNum.substr(0,5);
          ip = '192.168.'+ Math.floor(ipNum/256) +  '.' + (ipNum%256);

        break;
        case '3':
          //3 ：由本地生成的验证码，IP地址是B类地址
          if(ipNum.length<8){return;}
          ipNum = ipNum.substr(0,8);
          ip = '172.' + Math.floor(ipNum/Math.pow(256,2)) + '.' + Math.floor((ipNum%Math.pow(256,2))/256) + '.' + ipNum%256;

        break;
        case '4':
          //4 ：由本地生成的验证码，IP地址是全地址
          if(ipNum.length<10){return;}
          ipNum = ipNum.substr(0,10);
          ip = '' + Math.floor(ipNum/Math.pow(256,3)) + '.' + Math.floor((ipNum%Math.pow(256,3))/Math.pow(256,2)) + '.' + Math.floor((ipNum%Math.pow(256,2))/256)+ '.' + (ipNum%256);

        break;
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          //5~9 ：由服务器生成的验证码，需要去服务器端取IP

        break;
        case '0':
        break;
      }
      return ip;
    };
};
});
