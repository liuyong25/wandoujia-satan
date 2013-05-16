define([
    'angular',
    'common/main',
    'contacts/controllers/ContactsCtrl',
    'contacts/services/contactsListSer'
], function(
    angular,
    common,
    contactsCtrl,
    contactsListSer
) {

'use strict';

//注册angular的模块和control
angular.module('wdContacts', ['wdCommon'])
    .controller('ContactsCtrl', contactsCtrl)
    .factory('wdcContacts',contactsListSer);
});
