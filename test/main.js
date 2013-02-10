require.config({
  baseUrl: '/base/app/scripts',

  shim: {
    'underscore': {
        exports: '_'
    }
  },

  paths: {
    // lib
    jquery: 'vendor/jquery.wrapper',
    bootstrap: 'vendor/bootstrap',
    underscore: 'vendor/underscore',
    angular: 'vendor/angular/angular.wrapper',
    templates: '../templates',
    // requirejs plugins
    text: 'vendor/requirejs-plugins/text',
    // test
    spec: '../../test/spec'
  },
  urlArgs: 'bust=' +  (new Date()).getTime()
});

// bootstrap - require, once loaded, kick off test run
require([
  // you gotta list all spec that you wanna test...
  'spec/common/httpSpec',
], function() {
  'use strict';
  window.__testacular__.start();
});
