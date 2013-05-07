 require.config({
  shim: {
    'underscore': {
        exports: '_'
    }
  },
  locale: 'en_us',
  paths: {
    // lib
    jquery: 'vendor/jquery.wrapper',
    underscore: 'vendor/underscore',
    angular: 'vendor/angular/angular.wrapper',
    keymaster: 'vendor/keymaster.amd',
    bootstrap: 'vendor/bootstrap',
    fineuploader: 'vendor/fineuploader/fineuploader',
    moment: '../components/moment/moment',
    io: 'vendor/socket.io.wrapper',
    // requirejs plugins
    text: 'vendor/requirejs-plugins/text',
    cs: 'vendor/requirejs-plugins/cs',
    i18n: 'vendor/requirejs-plugins/i18n',
    // prefix
    templates: '../templates'
  }
});

require(['app'], function() {});
