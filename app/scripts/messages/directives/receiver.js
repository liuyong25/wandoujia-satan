define([], function() {
'use strict';
return ['wdDev', function(wdDev) {
return {

link: function(scope, element) {
    element.textext({
        plugins : 'tags prompt focus autocomplete ajax',
        prompt : 'Add one...',
        ext: {
            itemManager: {
                stringToItem: function(str)
                {
                    return { number: str };
                },

                itemToString: function(item)
                {
                    return item.number;
                },

                compareItems: function(item1, item2)
                {
                    return item1.number === item2.number;
                }
            }
        },
        ajax : {
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            url : wdDev.wrapURL('/resource/contacts/search?offset=0&length=10'),
            dataType : 'json',
            xhrFields: {
                withCredentials: true
            },
            processData: false,
            dataCallback: function(query) {
                var data = [{
                    field: 'keyword',
                    keyword: query
                }];
                return JSON.stringify(data);
            }
        }
    });

    element.bind('setFormData', function(e, data, isEmpty) {
        var textext = $(e.target).textext()[0];
        console.log(textext.hiddenInput().val());
        var addresses = JSON.parse(textext.hiddenInput().val()).map(function(item) {
            return item.number;
        });
        scope.$apply(function() {
            scope.activeConversation.addresses = addresses;
        });
    });
}

};
}];
});
