define([
    'angular',
    'common/main',
    'contacts/controllers/ContactsCtrl',
    'contacts/directives/upload'
], function(
    angular,
    common,
    contactsCtrl,
    upload
) {

'use strict';

//注册angular的模块和control
angular.module('wdContacts', ['wdCommon'])
.controller('ContactsCtrl', contactsCtrl)
.directive('wdpUpload', upload);

});
