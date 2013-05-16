define([
    'underscore'
], function(
    _
) {
'use strict';
return ['$scope', '$resource', '$q', '$http', 'wdpMessagePusher', '$timeout', 'wdAlert',
        'GA', '$route', 'wdmConversations', '$location', 'wdKey',
function($scope,   $resource,   $q,   $http,   wdpMessagePusher,   $timeout,   wdAlert,
         GA,   $route,   wdmConversations,   $location,   wdKey) {

$scope.serverMatchRequirement = $route.current.locals.versionSupport;
$scope.conversationsCache = wdmConversations.conversations;
$scope.conversations = $scope.conversationsCache;
$scope.activeConversation = null;
$scope.cvsChanging = false;
$scope.cvsLoaded = true;
$scope.cvsListFirstLoading = true;

$scope.searchQuery = '';
$scope.resultsList = [];
$scope.searchLoading = false;
$scope.contentResultsList = [];

$scope.cvs = function() {
    if ($scope.isSearching()) {
        return $scope.resultsList.map(function(id) {
            return $scope.conversationsCache.getById(id);
        }).concat($scope.contentResultsList);
    }
    else {
        return $scope.conversationsCache.collection;
    }
};

$scope.selectedCount = function() {
    return $scope.cvs().filter(function(c) { return c.selected; }).length;
};

$scope.deselectAll = function() {
    $scope.cvs().forEach(function(c) {
        c.selected = false;
    });
};

$scope.isSearching = function() {
    return !!$scope.searchQuery;
};

$scope.clearSearch = function() {
    $scope.searchQuery = '';
};

var searchConversationsFromServer = _.debounce(function(keyword) {
    wdmConversations.searchConversationsFromServer(keyword).then(function done(list) {
        if ($scope.searchQuery !== keyword) { return; }
        $scope.resultsList = _.uniq($scope.resultsList.concat(list));
        $scope.searchLoading = false;
        if ($scope.cvs()) {
            $scope.showConversation($scope.cvs()[0]);
        }

    });
    $scope.$apply();
}, 500);
// searchConversationsFromServer = _.debounce(searchConversationsFromServer, 500);

$scope.$watch('searchQuery', function(keyword) {
    if (keyword) {
        $scope.searchLoading = true;
        $scope.resultsList = wdmConversations.searchConversationsFromCache(keyword);
        $scope.contentResultsList = [];
        searchConversationsFromServer(keyword);
    }
    else {
        // kill search results
        $scope.resultsList = [];
        $scope.searchLoading = false;
    }

    if ($scope.cvs()) {
        $scope.showConversation($scope.cvs()[0]);
    }
});

$scope.searchContent = function() {
    var keyword = $scope.searchQuery;
    return wdmConversations.searchMessagesFromServer(keyword).then(function done(cvs) {
        if ($scope.searchQuery !== keyword) { return; }
        $scope.contentResultsList = cvs;
        if ($scope.cvs()) {
            $scope.showConversation($scope.cvs()[0]);
        }
    });
};

$scope.prevResults = function(c) {
    $scope.cvsChanging = true;
    c.previous().then(function() {
        $scope.cvsChanging = false;
    });
};
$scope.nextResults = function(c) {
    $scope.cvsChanging = true;
    c.next().then(function() {
        $scope.cvsChanging = false;
    });
};

// A very temp way
$scope.jumpToContacts = function(c) {
    if (c.multiple) { return; }
    var contactId;
    if (c.messages.length) {
        contactId = c.messages.collection[0].person;
    }
    else {
        contactId = c.messages.fetch().then(function(messages) {
            return messages[0].person;
        });
    }
    $q.when(contactId).then(function(id) {
        if (!id) { return; }
        $location.path('/contacts').search({
            contact_id: id
        });
    });
};

$scope.conversations.on('update.wdm', function(e, c) {
    if (c === $scope.activeConversation) {
        scrollIntoView();
    }
});

$scope.selectTip = function(c) {
    return c.selected ? $scope.$root.DICT.messages.ACTION_DESELECT : $scope.$root.DICT.messages.ACTION_SELECT;
};

$scope.editorPlaceholder = function(c) {
    if (!c || !c.messages) { return; }
    var hasRecieved = c.messages.collection.some(function(m) {
        return m.type !== 2;
    });
    return (hasRecieved ? $scope.$root.DICT.messages.EDITOR_REPLY_PLACEHOLDER + c.displayNames.join(', ') : $scope.$root.DICT.messages.EDITOR_SEND_PLACEHOLDER) + '...';
};

$scope.createConversation = function() {
    var c = _($scope.conversations.collection).find(function(c) {
        return c.isNew;
    });
    if (!c) {
        c = $scope.conversations.create();
        $scope.conversations.add(c);
    }
    $scope.clearSearch();
    activeConversation(c);
    return c;
};

$scope.showConversation = function(c) {
    if (!c) { return; }
    var promise = activeConversation(c);
    $scope.$broadcast('wdm:conversations:intoView');
    promise.then(function() {
        _.defer(function() {
            $scope.$broadcast('wdm:autoscroll:flip');
        });
    });
    return promise;
};

$scope.sendMessage = function(c) {
    if (!c.draft) { return; }
    var draft = c.draft;
    c = $scope.conversationsCache.getById(c.id);
    c.draft = draft;
    // Broadcast beforeMessageSend to assure all necessary data that should be prepared and merge into scope
    $scope.$broadcast('wdm:beforeMessageSend', c);
    $scope.conversations.sendMessages(c).then(function(cc) {
        if (cc !== $scope.activeConversation) {
            $scope.showConversation(cc);
        }
    }, function() {
        GA('messages:send_failed');
    });
    scrollIntoView();
    $scope.clearSearch();
};

$scope.resendMessage = function(c, m) {
    $scope.conversations.sendMessages(c, m).then(function(cc) {
        if (cc !== $scope.activeConversation) {
            $scope.showConversation(cc);
        }
    });
};


$scope.removeSelected = function() {
    wdAlert.confirm(
        $scope.$root.DICT.messages.CONFIRM_DELETE_TITLE,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CONTENT,
        $scope.$root.DICT.messages.CONFIRM_DELETE_OK,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CANCEL
    ).then(function() {
        $scope.conversations.removeSelected();
        if (!$scope.conversations.contains($scope.activeConversation)) {
            $scope.showConversation($scope.conversations.collection[0]);
        }
    });
};

$scope.removeMessage = function(c, m) {
    wdAlert.confirm(
        $scope.$root.DICT.messages.CONFIRM_DELETE_TITLE,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CONTENT,
        $scope.$root.DICT.messages.CONFIRM_DELETE_OK,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CANCEL
    ).then(function() {
        $scope.conversations.removeMessages(c, m);
        if (!$scope.conversations.contains($scope.activeConversation)) {
            $scope.showConversation($scope.conversations.collection[0]);
        }
    });
};


// Startup
var timer;
if ($scope.serverMatchRequirement) {
    $q.when($scope.conversations.length || $scope.conversations.fetch()).then(function() {
        $scope.showConversation($scope.conversations.collection[0]);
        $scope.cvsListFirstLoading = false;
    });

    timer = $timeout(function update() {
       timer = $timeout(update, 60000 - Date.now() % 60000);
    }, 60000 - Date.now() % 60000);

    if ($route.current.params.create) {
        var parts = $route.current.params.create.split(',');
        var c = $scope.createConversation();
        c.extend({
            addresses: [decodeURIComponent(parts[0])],
            contact_names: [decodeURIComponent(parts[1])]
        });
    }
}

var keyboardScope = wdKey.push('messages');

wdKey.$apply('up', 'messages', function() {
    var index = $scope.cvs().indexOf($scope.activeConversation);
    if (index === -1) { return; }
    if (index > 0) {
        $scope.showConversation($scope.cvs()[index - 1]);
    }
});
wdKey.$apply('down', 'messages', function() {
    var index = $scope.cvs().indexOf($scope.activeConversation);
    if (index === -1) { return; }
    if (index < $scope.cvs().length - 1) {
        $scope.showConversation($scope.cvs()[index + 1]);
    }
});

// Shutdown
$scope.$on('$destroy', function() {
    $timeout.cancel(timer);
    $scope.conversations.off('.wdm');
    keyboardScope.done();
    wdKey.deleteScope('messages');
});

function scrollIntoView() {
    _.defer(function() {
        $scope.$broadcast('wdm:autoscroll:bottom');
    });
}
function activeConversation(c) {
    var defer = $q.defer();
    if ($scope.activeConversation === c) {
        defer.reject();
    }
    else {
        var curActiveCvs = $scope.activeConversation;
        if ($scope.conversations.contains(curActiveCvs)) {
            curActiveCvs.allRead();
        }
        // Change c content right now.
        $scope.activeConversation = c;

        // If already read any message, just active it.
        // Or load messages.
        if (c.messages.length || c.loaded) {
            defer.resolve(c);
        }
        else {
            $scope.cvsChanging = true;

            var promise = c;
            if (c.isSearchResult && !$scope.conversations.contains(c)) {
                var rc = $scope.conversationsCache.create(c.rawData);
                $scope.conversationsCache.add(rc);
                promise = rc.fetch().then(function() {
                    return rc;
                }, function() {
                    return rc;
                });
            }
            $q.when(promise).then(function() {
                return c.messages.fetch();
            }).then(function success() {
                $scope.cvsChanging = false;
                defer.resolve(c);
            }, function error() {
                $scope.cvsChanging = false;
                defer.reject();
            });
        }

    }
    return defer.promise;
}

}];
});
