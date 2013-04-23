define([
    'angular',
    'common/main',
    'messages/controllers/conversation',
    'messages/directives/autoscroll',
    'messages/filters/group',
    'messages/directives/loadmore',
    'messages/filters/ms',
    'messages/filters/message-date',
    'messages/directives/realtime',
    'messages/directives/conversation',
    'messages/directives/textarea',
    'messages/directives/receiver',
    'messages/services/conversations',
    'messages/services/messages'
], function(
    angular,
    common,
    conversationController,
    autoscroll,
    groupFilter,
    loadmore,
    msFilter,
    messageDateFilter,
    realtime,
    conversation,
    textarea,
    receiver,
    conversations,
    messages
) {
'use strict';
// jshint unused:false
angular.module('wdMessages', ['wdCommon'])
    .controller('wdmConversationController', conversationController)
    .factory('wdmMessages', messages)
    .factory('wdmConversations', conversations)
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
