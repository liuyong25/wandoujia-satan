require.config({
  shim: {
    'underscore': {
        exports: '_'
    }
  },

  paths: {
    // lib
    jquery: 'vendor/jquery.wrapper',
    underscore: 'vendor/underscore',
    angular: 'vendor/angular/angular.wrapper',
    // requirejs plugins
    text: 'vendor/requirejs-plugins/text',
    cs: 'vendor/requirejs-plugins/cs',
    i18n: 'vendor/requirejs-plugins/i18n',
    // prefix
    templates: '../templates'
  }
});

require(['app'], function(app) {
    'use strict';
    // use app here
    console.log(app);
});
