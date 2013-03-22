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
    'messages/filters/display-name',
    'messages/filters/message-date'
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
    displayNameFilter,
    messageDateFilter
) {
'use strict';
// jshint unused:false
angular.module('wdMessages', ['wdCommon'])
    .controller('wdmConversationController', conversationController)
    .factory('wdmConversationsCache', conversationsCache)
    .factory('wdmMessagesCache', messagesCache)
    .directive('wdmAutoScroll', autoscroll)
    .directive('wdmLoadMore', loadmore)
    .filter('ms', msFilter)
    .filter('group', groupFilter)
    .filter('displayName', displayNameFilter)
    .filter('messageDate', messageDateFilter);
});
