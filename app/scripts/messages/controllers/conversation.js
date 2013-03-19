define([], function() {
'use strict';
return ['$scope', '$resource', function($scope, $resource) {
    var Conversations = $resource('/resource/conversations/:id', {id: '@id'});

    $scope.conversations = [];
    Conversations.query({offset: 0, length: 10}, function(conversations) {
        $scope.conversations = conversations;
        console.log(conversations);
    });
}];
});
