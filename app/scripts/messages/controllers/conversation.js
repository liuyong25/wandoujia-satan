define([
    'underscore'
], function(
    _
) {
'use strict';
return ['$scope', '$resource', 'wdmConversationsCache', 'wdmMessagesCache', '$q', '$http',
        'wdpMessagePusher', '$timeout', 'wdAlert',
function($scope,   $resource,   wdmConversationsCache,   wdmMessagesCache,   $q,   $http,
         wdpMessagePusher,   $timeout,   wdAlert) {


var Conversations = $resource('/resource/conversations/:id', {id: '@id'});
var ConversationMessages = $resource('/resource/conversations/:id/messages', {id: '@id'});
var Messages = $resource('/resource/messages/:id', {id: '@id'});

$scope.cvsCache = wdmConversationsCache;
$scope.msgCache = wdmMessagesCache;
$scope.conversations = [];
$scope.activeConversation = null;
$scope.sms = '';
$scope.editorEnable = true;

$scope.cvsChanging = false;
$scope.cvsLoaded = true;

$scope.removeSelected = function() {
    wdAlert.confirm(
        $scope.$root.DICT.messages.CONFIRM_DELETE_TITLE,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CONTENT,
        $scope.$root.DICT.messages.CONFIRM_DELETE_OK,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CANCEL
    ).then(function() {
        removeSelected();
        if (!hasActive()) {
            activeConversation($scope.conversations[0]);
        }
    });
};
$scope.toggleSelected = toggleSelected;
$scope.toggleSelectedAll = toggleSelectedAll;
$scope.selectAll = selectAll;
$scope.deselectAll = deselectAll;
$scope.isSelected = isSelected;
$scope.isSelectedAll = isSelectedAll;
$scope.hasSelected = hasSelected;

$scope.active = active;
$scope.deactiveAll = deactiveAll;
$scope.hasActive = hasActive;

$scope.hasPendingMsg = hasPendingMsg;
$scope.hasFailedMsg = hasFailedMsg;

$scope.createConversation = createConversation;
$scope.showConversation = function(conversation) {
    var promise = activeConversation(conversation);
    promise.then(scrollIntoView);
    return promise;
};
$scope.prevConversations = function() {
    return loadConversations(_.last($scope.conversations));
};
$scope.prevMessages = function(conversation) {
    return loadMessages(conversation).then(function success() {
        _.defer(function() {
            $scope.$broadcast('wdm:autoscroll:keep');
        });
    });
};
$scope.sendMessage = function(conversation, content) {
    if (!$scope.editorEnable || !$scope.sms) { return; }
    $scope.editorEnable = false;
    sendMessage(conversation, content).then(function(c) {
        // Conversation existed and is the current active one.
        if (same(conversation, c)) {
            scrollIntoView();
        }
        // The current active one is a temporary one.
        else {
            $scope.showConversation(c).then(function() {
                drop(conversation);
            });
        }
        $scope.sms = '';
        $scope.editorEnable = true;
    }, function() {
        $scope.editorEnable = true;
    });
};
$scope.resendMessage = resendMessage;

wdpMessagePusher.channel('messages.add', function(msg) {
    var cid = msg.data.threadId;
    var mid = msg.data.messageId;
    var c = findConversation(cid);
    if (c) {
        pullMessage(mid).then(function() {
            if (isActive(c)) {
                markConversationAsRead(c);
                scrollIntoView();
            }
            else {
                pullConversation(cid);
            }
        });
    }
    else {
        pullConversation(cid);
    }
});

// Startup
loadConversations().then(function() {
    if ($scope.conversations.length) {
        $scope.showConversation($scope.conversations[0]);
    }
});

wdpMessagePusher.start();

var timer = $timeout(function update() {
   timer = $timeout(update, 60000 - Date.now() % 60000);
}, 60000 - Date.now() % 60000);

// Shutdown
$scope.$on('$destroy', function() {
    $scope.cvsCache.reset();
    $timeout.cancel(timer);
    wdpMessagePusher.clear().stop();
});

//==========================================================================
function scrollIntoView() {
    _.defer(function() {
        $scope.$broadcast('wdm:autoscroll:bottom');
    });
}

function createConversation() {
    var c = _(new Conversations()).extend({
        id: _.uniqueId('wdmConversation_'),
        date: Date.now(),
        message_count: 0,
        snippet: '',
        addresses: ['10010'],
        contact_names: [],
        photo_path: '',
        unread_message_count: 0,
        has_error: false
    });
    mergeConversations(c);
    $scope.cvsCache.put(c, {
        loaded: true
    });
    activeConversation(c);
}

/**
 * Return promise resolving with the conversation which messages located in.
 */
function sendMessage(conversation, content) {
    return $http({
        url: '/resource/messages/send',
        method: 'POST',
        data: {
            addresses: conversation.addresses,
            body: content
        }
    }).then(function success(response) {
        var messages = response.data;
        var existedConversation = mergeMessages(messages);
        if (!existedConversation) {
            var cid = toArray(messages)[0].thread_id;
            return pullConversation(cid);
        }
        else {
            return existedConversation;
        }
    });
}

function resendMessage(m) {
    return $http({
        url: '/resource/messages/' + m.id + '/resend',
        method: 'GET'
    }).then(function success(response) {
        return mergeMessages(response.data);
    });
}

function activeConversation(conversation) {
    var defer = $q.defer();
    if (isActive(conversation)) {
        defer.reject();
    }
    else {
        deactiveAll();
        active(conversation);
        // If already read any message, just active it.
        // Or load messages.
        if ($scope.cvsCache.get(conversation, 'messages').length ||
            $scope.cvsCache.get(conversation, 'loaded')) {
            $scope.activeConversation = conversation;
            defer.resolve(conversation);
        }
        else {
            $scope.cvsChanging = true;
            loadMessages(conversation, true).then(function success() {
                $scope.cvsChanging = false;
                $scope.activeConversation = conversation;
                defer.resolve(conversation);
            }, function error() {
                $scope.cvsChanging = false;
                defer.reject();
            });
        }
        if (conversation.unread_message_count) {
            markConversationAsRead(conversation);
        }
    }
    return defer.promise;
}

function markConversationAsRead(conversation) {
    return updateConversation(conversation, { read: 1 });
}

function updateConversation(conversation, message) {
    var cid = conversation.id;
    return $http({
        url: '/resource/conversations/' + cid + '/messages/update',
        method: 'POST',
        data: message
    }).then(function() {
        return pullConversation(cid);
    });
}

function loadConversations(cursor) {
    var defer = $q.defer();
    var params = {
        length: 30
    };
    if (cursor) {
        params.offset = 1;
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
function loadMessages(conversation, ignoreCursor) {
    var defer = $q.defer();
    var cursor = !ignoreCursor && $scope.cvsCache.get(conversation, 'messages')[0];
    var params = {
        id: conversation.id,
        length: 30
    };
    if (cursor) {
        params.offset = 1;
        params.cursor = cursor.id;
    }
    else {
        params.offset = 0;
    }
    ConversationMessages.query(params, function success(messages, getResponseHeader) {
        mergeMessages(messages);
        $scope.cvsCache.put(conversation, {
            loaded: getResponseHeader('WD-Need-More') === 'false'
        });
        defer.resolve();
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}


/**
 * Returns promise resolving with inserted conversation.
 */
function pullConversation(cid) {
    var defer = $q.defer();
    Conversations.get({ id: cid }, function success(c) {
        mergeConversations(c);
        defer.resolve(findConversation(c.id));
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}

/**
 * Returns promise resolving with inserted message.
 */
function pullMessage(mid) {
    var defer = $q.defer();
    Messages.get({ id: mid }, function success(m) {
        mergeMessages(m);
        defer.resolve(findMessage(m.thread_id, m.id));
    }, function error() {
        defer.reject();
    });
    return defer.promise;
}

function mergeConversations(conversations) {
    conversations = toArray(conversations);
    _(conversations).each(function(c) {
        var old = _($scope.conversations).find(function(oc) { return same(oc, c); });
        if (old) {
            _(old).extend(c);
        }
        else {
            $scope.conversations.push(c);
            $scope.cvsCache.put(c, {
                selected: false,
                active: false,
                loaded: false,
                messages: [],
                groups: [],
                date: function() {
                    var lastMessageDate = this.messages.length ? this.messages[this.messages.length - 1].date : 0;
                    return Math.max(this.model.date, lastMessageDate);
                },
                displayName: function() {
                    var result = [];
                    for (var i = 0; i < this.model.addresses.length; i += 1) {
                        result.push(this.model.contact_names[i] || this.model.addresses[i]);
                    }
                    return result.join(', ');
                },
                editorPlaceholder: function() {
                    var hasRecieved = _(this.messages).any(function(m) {
                        return m.type !== 2;
                    });
                    return (hasRecieved ? $scope.$root.DICT.messages.EDITOR_REPLY_PLACEHOLDER : $scope.$root.DICT.messages.EDITOR_SEND_PLACEHOLDER) + this.displayName() + '...';
                }
            });
        }
    });
    $scope.conversations = _($scope.conversations).sortBy(dateDesc);
}

function mergeMessages(messages) {
    messages = toArray(messages);
    var cid = messages[0].thread_id;
    var conversation = findConversation(cid);
    var existedMessages = $scope.cvsCache.get(conversation, 'messages');
    if (conversation) {
        _(messages).each(function(m) {
            var old = _(existedMessages).find(function(om) { return same(om, m); });
            if (old) {
                _(old).extend(m);
            }
            else {
                existedMessages.push(m);
            }
        });
        var sortedMessages = _(existedMessages).sortBy(dateAsc);
        var groups = _(sortedMessages).groupBy(function(m) {
            return Math.floor(m.date / 3600 / 1000 / 24) * 3600 * 1000 * 24;
        });
        $scope.cvsCache.put(conversation, {
            messages: sortedMessages,
            groups: groups
        });
    }
    return conversation;
}

function drop(conversation) {
    $scope.conversations.splice(_($scope.conversations).indexOf(conversation), 1);
    $scope.cvsCache.remove(conversation);
}
function remove(conversation) {
    drop(conversation);
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



function findConversation(cid) {
    return _($scope.conversations).find(function(c) {
        return c.id === cid;
    });
}

function findMessage(cid, mid) {
    var messages = $scope.cvsCache.get(cid, 'messages');
    return _(messages).find(function(m) {
        return m.id === mid;
    });
}

function dateAsc(item) {
    return item.date;
}
function dateDesc(item) {
    return -item.date;
}

function toArray() {
    var ret = [];
    return ret.concat.apply(ret, arguments);
}

function same(a, b) {
    return a.id === b.id;
}

}];
});
