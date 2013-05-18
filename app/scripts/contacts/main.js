define([
    'angular',
    'common/main',
    'contacts/controllers/ContactsCtrl',
    'contacts/services/contactsListSer',
    'contacts/directives/autoScroll'
], function(
    angular,
    common,
    contactsCtrl,
    contactsListSer,
    autoScroll
) {

'use strict';

//注册angular的模块和control
angular.module('wdContacts', ['wdCommon'])
    .controller('ContactsCtrl', contactsCtrl)
    .factory('wdcContacts',contactsListSer)
    .directive('wdcAutoScroll', autoScroll);
});
