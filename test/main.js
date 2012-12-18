
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
    underscore: 'vendor/underscore',
    // requirejs plugins
    text: 'vendor/requirejs-plugins/text',
    cs: 'vendor/requirejs-plugins/cs',
    i18n: 'vendor/requirejs-plugins/i18n',
    // test
    test: '../../test',
    spec: '../../test/spec'
  }
});

// bootstrap - require, once loaded, kick off test run
require([
  // you gotta list all spec that you wanna test...
  'spec/exampleSpec'
], function() {
  'use strict';
  window.__testacular__.start();
});
