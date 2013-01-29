 require.config({
  shim: {
    'vendor/plupload/plupload.html5': ['vendor/plupload/plupload'],
    'vendor/plupload/plupload.html4': ['vendor/plupload/plupload'],
    'plupload': ['vendor/plupload/plupload', 'vendor/plupload/plupload.html5', 'vendor/plupload/plupload.html4'],
    'underscore': {
        exports: '_'
    }
  },

  paths: {
    // lib
    jquery: 'vendor/jquery.wrapper',
    underscore: 'vendor/underscore',
    angular: 'vendor/angular/angular.wrapper',
    plupload: 'vendor/plupload/plupload.wrapper',
    keymaster: 'vendor/keymaster.amd',
    bootstrap: 'vendor/bootstrap',
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
