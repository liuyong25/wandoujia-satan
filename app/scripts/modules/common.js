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
angular.module('wdCommon', [])
    .directive('wdStrip', strip)
    .directive('wdLoading', loading)
    .directive('wdAutoFocus', autofocus)
    .directive('wdAlert', alertDirecitve)
    .provider('wdHttp', http)
    .provider('wdDev', dev)
    .factory('wdViewport', viewport)
    .factory('wdSharing', sharing)
    .factory('wdKey', key)
    .factory('wdAlert', alert)
    .factory('wdKeeper', keeper)
    .factory('GA', ga);
});
