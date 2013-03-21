define([
    'underscore'
], function(
    _
) {
'use strict';
return ['$scope', '$resource', 'wdmConversationsCache', 'wdmMessagesCache', '$q',
function($scope,   $resource,   wdmConversationsCache,   wdmMessagesCache,   $q) {


var Conversations = $resource('/resource/conversations/:id', {id: '@id'});
var Messages = $resource('/resource/conversations/:id/messages', {id: '@id'});

$scope.cvsCache = wdmConversationsCache;
$scope.msgCache = wdmMessagesCache;
$scope.conversations = [];
$scope.activeConversation = null;

$scope.cvsChanging = false;

$scope.removeSelected = removeSelected;
$scope.toggleSelected = toggleSelected;
$scope.toggleSelectedAll = toggleSelectedAll;
$scope.isSelected = isSelected;
$scope.isSelectedAll = isSelectedAll;
$scope.hasSelected = hasSelected;

$scope.active = active;
$scope.deactiveAll = deactiveAll;

$scope.hasPendingMsg = hasPendingMsg;
$scope.hasFailedMsg = hasFailedMsg;

$scope.showConversation = showConversation;
$scope.loadConversations = function() {
    return loadConversation(_.last($scope.conversations));
};
$scope.loadMessages = loadMessages;

loadConversation().then(function() {
    active($scope.conversations[0]);
    showConversation($scope.conversations[0]);
});


//==========================================================================
function showConversation(conversation) {
    $scope.cvsChanging = true;
    loadMessages(conversation).then(function success() {
        $scope.cvsChanging = false;
    }, function error() {
        $scope.cvsChanging = false;
    });
}

function loadConversation(cursor) {
    var defer = $q.defer();
    var params = {
        length: 10
    };
    if (cursor) {
        params.offset = 0;
        params.cursor = cursor.id;
    }
    else {
        params.offset = 0;
    }
    Conversations.query(params, function success(conversations) {
        $scope.conversations = mergeCollection($scope.conversations, conversations);
        $scope.cvsCache.put(conversations);
        defer.resolve();
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}
function loadMessages(conversation) {
    var defer = $q.defer();
    var cursor = _.last($scope.cvsCache.get(conversation, 'messages'));
    var params = {
        id: conversation.id,
        length: 30
    };
    if (cursor) {
        params.offset = 0;
        params.cursor = cursor.id;
    }
    else {
        params.offset = 0;
    }
    Messages.query(params, function success(messages, getResponseHeader) {
        var totalLength = getResponseHeader('WD-Total-Length');
        var existMessages = $scope.cvsCache.get(conversation, 'messages');
        $scope.cvsCache.put(conversation, {
            messages: mergeCollection(existMessages, messages)
        });
        conversation.unread_message_count = 0;
        $scope.activeConversation = conversation;
        defer.resolve();
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}

function mergeCollection(dist, source) {
    if (!_.isArray(source)) {
        source = [source];
    }
    return _(dist.concat(source)).uniq(function(item) {
        return item.id;
    });
}


function remove(conversation) {
    $scope.conversations.splice(_($scope.conversations).indexOf(conversation), 1);
    $scope.cvsCache.remove(conversation);
    conversation.$remove();
}
function removeSelected() {
    _.chain($scope.conversations).filter(isSelected).each(remove);
}


function toggleSelected(conversation, selected) {
    $scope.cvsCache.put(conversation, {
        selected: typeof selected !== 'undefined' ? selected : !isSelected(conversation)
    });
}
function select(conversation) {
    toggleSelected(conversation, true);
}
function deselect(conversation) {
    toggleSelected(conversation, false);
}
function toggleSelectedAll() {
    _($scope.conversations).each(isSelectedAll() ? deselect : select);
}
function selectAll() {
    _($scope.conversations).each(select);
}
function deselectAll() {
    _($scope.conversations).each(deselect);
}
function isSelected(conversation) {
    return $scope.cvsCache.get(conversation, 'selected');
}
function isSelectedAll() {
    return _($scope.conversations).all(isSelected);
}
function hasSelected() {
    return _($scope.conversations).any(isSelected);
}

function toggleActive(conversation, active) {
    $scope.cvsCache.put(conversation, {
        active: typeof active !== 'undefined' ? active : !isActive(conversation)
    });
}
function active(conversation) {
    toggleActive(conversation, true);
}
function deactive(conversation) {
    toggleActive(conversation, false);
}
function deactiveAll() {
    var conversation = _($scope.conversations).find(isActive);
    if (conversation) {
        deactive(conversation);
    }
}
function isActive(conversation) {
    return $scope.cvsCache.get(conversation, 'active');
}
function hasActive() {
    return _($scope.conversations).any(isActive);
}

function isPending(message) {
    return message.status === 32;
}
function isFailed(message) {
    return message.status === 64;
}
function hasPendingMsg(conversation) {
    return _($scope.cvsCache.get(conversation, 'messages')).any(isPending);
}
function hasFailedMsg(conversation) {
    return _($scope.cvsCache.get(conversation, 'messages')).any(isFailed);
}


}];
});
