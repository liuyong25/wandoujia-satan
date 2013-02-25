define([
        'angular',
        'directives/common/loading',
        'directives/common/strip',
        'services/common/sharing',
        'services/common/dev',
        'services/common/viewport',
        'services/common/http',
        'directives/common/autofocus',
        'services/common/key',
        'services/common/alert',
        'directives/common/alert',
        'services/common/keeper',
        'services/common/ga'
    ], function(
        angular,
        loading,
        strip,
        sharing,
        dev,
        viewport,
        http,
        autofocus,
        key,
        alert,
        alertDirecitve,
        keeper,
        ga
    ) {
'use strict';
// Common Module is the collection of most used or global functions.
angular.module('wdCommon', [])
    // Directives
    .directive('wdStrip', strip)
    .directive('wdLoading', loading)
    .directive('wdAutoFocus', autofocus)
    .directive('wdAlert', alertDirecitve)
    // Services
    .provider('wdHttp', http)
    .provider('wdDev', dev)
    .factory('wdViewport', viewport)
    .factory('wdSharing', sharing)
    .factory('wdKey', key)
    .factory('wdAlert', alert)
    .factory('wdKeeper', keeper)
    .factory('GA', ga)
    // Configuration
    .config(['$provide', 'wdHttpProvider', function($provide, wdHttpProvider) {
        $provide.decorator('$http', wdHttpProvider.httpDecorator);
    }]);
});
