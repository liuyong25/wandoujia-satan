define([
    'angular',
    'common/main',
    'contacts/controllers/ContactsCtrl'
], function(
    angular,
    common,
    contactsCtrl
) {

'use strict';

//注册angular的模块和control
angular.module('wdContacts', ['wdCommon'],['searchFilter']).controller('ContactsCtrl', contactsCtrl);

});
