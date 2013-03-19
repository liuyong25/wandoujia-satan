define([
    'angular',
    'common/main',
    'messages/controllers/conversation'
], function(
    angular,
    common,
    conversationController
) {
'use strict';
// jshint unused:false
angular.module('wdMessages', ['wdCommon'])
    .controller('wdmConversationController', conversationController);

});
