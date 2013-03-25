define([
    'underscore'
], function(
    _
) {
'use strict';
return ['$scope', '$resource', 'wdmConversationsCache', 'wdmMessagesCache', '$q', '$http',
        'wdpMessagePusher', '$timeout',
function($scope,   $resource,   wdmConversationsCache,   wdmMessagesCache,   $q,   $http,
         wdpMessagePusher,   $timeout) {


var Conversations = $resource('/resource/conversations/:id', {id: '@id'});
var ConversationMessages = $resource('/resource/conversations/:id/messages', {id: '@id'});
var Messages = $resource('/resource/messages/:id', {id: '@id'});

$scope.cvsCache = wdmConversationsCache;
$scope.msgCache = wdmMessagesCache;
$scope.conversations = [];
$scope.activeConversation = null;
$scope.newConversation = null;

$scope.cvsChanging = false;
$scope.cvsLoaded = true;

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

$scope.createConversation = createConversation;
$scope.showConversation = showConversation;
$scope.loadConversations = function() {
    return loadConversation(_.last($scope.conversations));
};
$scope.prevMessages = function(conversation) {
    return loadMessages(conversation).then(function success() {
        _.defer(function() {
            $scope.$broadcast('wdm:autoscroll:keep');
        });
    });
};
$scope.sendMessage = sendMessage;


// Startup
loadConversation().then(function() {
    active($scope.conversations[0]);
    showConversation($scope.conversations[0]);
});

wdpMessagePusher.channel('messages.add', function(msg) {
    var cid = msg.data.threadId;
    var mid = msg.data.messageId;
    var conversation = _($scope.conversations).find(function(conversation) { return conversation.id === cid; });
    var message;
    if (conversation) {
        insertMessage(conversation, mid).then(function() {
            if (conversation.id === $scope.activeConversation.id) {
                _.defer(function() {
                    $scope.$broadcast('wdm:autoscroll:bottom');
                });
            }
        });
    }
    else {
        insertConversation(cid);
    }
}).start();

var timer = $timeout(function update() {
   timer = $timeout(update, 60000 - Date.now() % 60000);
}, 60000 - Date.now() % 60000);

$scope.$on('$destroy', function() {
    deactiveAll();
    $timeout.cancel(timer);
    wdpMessagePusher.clear().stop();
});

//==========================================================================
function createConversation() {
    if ($scope.newConversation) { return; }
    $scope.newConversation = _(new Conversations()).extend({
        id: 'xxx',
        date: Date.now(),
        message_count: 0,
        snippet: '',
        addresses: [],
        contact_names: [],
        photo_path: '',
        unread_message_count: 0,
        has_error: false
    });
    mergeConversations($scope.newConversation);
    $scope.cvsCache.put($scope.newConversation);
}

function showConversation(conversation) {
    $scope.deactiveAll();
    $scope.active(conversation);
    if (conversation.id !== 'xxx') {
        $scope.cvsChanging = true;
        loadMessages(conversation).then(function success() {
            $scope.cvsChanging = false;
            _.defer(function() {
                $scope.$broadcast('wdm:autoscroll:bottom');
            });
        }, function error() {
            $scope.cvsChanging = false;
        });
    }
    else {
        $scope.cvsCache.put(conversation, {
            messages: []
        });
        $scope.activeConversation = conversation;
    }
}

function loadConversation(cursor) {
    var defer = $q.defer();
    var params = {
        length: 30
    };
    if (cursor) {
        params.offset = 0;
        params.cursor = cursor.id;
    }
    else {
        params.offset = 0;
    }
    Conversations.query(params, function success(conversations, getResponseHeader) {
        mergeConversations(conversations);
        $scope.cvsLoaded = getResponseHeader('WD-Need-More') === 'false';
        defer.resolve();
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}
function loadMessages(conversation) {
    var defer = $q.defer();
    var cursor = $scope.cvsCache.get(conversation, 'messages')[0];
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
    ConversationMessages.query(params, function success(messages, getResponseHeader) {
        mergeMessages(conversation, messages);
        $scope.cvsCache.put(conversation, {
            loaded: getResponseHeader('WD-Need-More') === 'false'
        });
        conversation.unread_message_count = 0;
        $scope.activeConversation = conversation;
        defer.resolve();
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}

function insertConversation(conversationId) {
    var defer = $q.defer();
    Conversations.get({ id: conversationId }, function success(conversation) {
        mergeConversations(conversation);
        defer.resolve();
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}

function insertMessage(conversation, messageId) {
    var defer = $q.defer();
    Messages.get({ id: messageId }, function success(message) {
        var old = _($scope.cvsCache.get(conversation, 'messages')).find(function(message) { return message.id === messageId; });
        if (old) {
            _(old).extend(message);
        }
        else {
            mergeMessages(conversation, message);
        }
        defer.resolve();
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}

function mergeConversations(conversations) {
    $scope.conversations = _(mergeCollection($scope.conversations, conversations)).sortBy(function(c) { return -c.date; });
    $scope.cvsCache.put(conversations);
}

function mergeMessages(conversation, newMessages) {
    var messages = $scope.cvsCache.get(conversation, 'messages');
    messages = mergeCollection(messages, newMessages);
    messages = _(messages).sortBy(function(m) { return m.date; });
    $scope.cvsCache.put(conversation, {
        messages: messages
    });
}

function mergeCollection(dist, source) {
    if (!_.isArray(source)) {
        source = [source];
    }
    return _(dist.concat(source)).uniq(function(item) {
        return item.id;
    });
}


function sendMessage(conversation, content) {
    $http({
        url: '/resource/messages/send',
        method: 'POST',
        data: {
            addresses: conversation.addresses,
            body: content
        }
    }).success(function success(messages) {
        $scope.cvsCache.put(conversation, {
            messages: mergeCollection($scope.cvsCache.get(conversation, 'messages'), messages)
        });
        _.defer(function() {
            $scope.$broadcast('wdm:autoscroll:bottom');
        });
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


function conversationExisted(conversationId) {
    return !!_($scope.conversations).find(function(conversation) {
        return conversation.id === conversationId;
    });
}

}];
});
