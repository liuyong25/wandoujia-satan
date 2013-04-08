define([
    'angular',
    'underscore'
], function(
    angular,
    _
) {
'use strict';
return ['wdDev', '$rootScope', function(wdDev, $rootScope) {
return {

link: function(scope, element) {
    var itemManager = {
        stringToItem: function(str)
        {
            var parts = str.split(':');
            return {
                display_name: parts[1] || '',
                number: parts[0]
            };
        },

        itemToString: function(item)
        {
            return item.number + ':' + item.display_name;
        },

        compareItems: function(item1, item2)
        {
            return item1.number === item2.number && item1.display_name === item2.display_name;
        }
    };



    scope.$watch('activeConversation.addresses', function(addresses, old) {
        var items = [];
        var i;
        for (i = 0; i < addresses.length; i += 1) {
            var a = addresses[i];
            var n = scope.activeConversation.contact_names[i] || '';
            items.push({
                display_name: n,
                number: a
            });
        }
        if (addresses === old) {
            element.textext({
                plugins : 'tags prompt autocomplete ajax',
                // prompt : 'Add one...',
                ext: {
                    itemManager: itemManager
                },
                html : {
                    tag  : '<div class="text-tag"><div class="text-button"><span class="text-label"/><span class="text-remove">&times;</span></div></div>'
                },
                tags: {
                    items: items
                },
                autocomplete: {
                    dropdown: {
                        maxHeight: '200px'
                    },
                    render: function(suggestion) {
                        return '<span>' + suggestion.display_name + '</span>&nbsp;' + suggestion.number;
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

            element.on('setFormData', function(e) {
                var textext = angular.element(e.target).textext()[0];
                var items = JSON.parse(textext.hiddenInput().val());
                var addresses = _(items).map(function(item) {
                    return item.number;
                });
                var names = _(items).map(function(item) {
                    return item.display_name;
                });

                scope.$apply(function() {
                    scope.activeConversation.addresses = addresses;
                    scope.activeConversation.contact_names = names;
                });
            });
            element.on('blur', function() {
                element.textext()[0].tags().onBlur();
                element.val('');
            });
        }
    });
}

};
}];
});
