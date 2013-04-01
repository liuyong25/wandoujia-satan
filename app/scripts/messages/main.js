define([
    'angular',
    'common/main',
    'messages/controllers/conversation',
    'messages/services/conversations-cache',
    'messages/services/messages-cache',
    'messages/directives/autoscroll',
    'messages/filters/group',
    'messages/directives/loadmore',
    'messages/filters/ms',
    'messages/filters/message-date',
    'messages/directives/realtime',
    'messages/directives/conversation',
    'messages/directives/textarea',
    'messages/directives/receiver'
], function(
    angular,
    common,
    conversationController,
    conversationsCache,
    messagesCache,
    autoscroll,
    groupFilter,
    loadmore,
    msFilter,
    messageDateFilter,
    realtime,
    conversation,
    textarea,
    receiver
) {
'use strict';
// jshint unused:false
angular.module('wdMessages', ['wdCommon'])
    .controller('wdmConversationController', conversationController)
    .factory('wdmConversationsCache', conversationsCache)
    .factory('wdmMessagesCache', messagesCache)
    .directive('wdmAutoScroll', autoscroll)
    .directive('wdmLoadMore', loadmore)
    .directive('wdmRealtime', realtime)
    .directive('wdmConversation', conversation)
    .directive('wdmTextarea', textarea)
    .directive('wdmReceiver', receiver)
    .filter('ms', msFilter)
    .filter('group', groupFilter)
    .filter('messageDate', messageDateFilter);
});
