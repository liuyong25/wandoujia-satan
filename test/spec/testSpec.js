define([
        'services/common/alert',
        'angular'
    ], function(
        alert,
        angular
    ) {
    'use strict';

  // jasmine

  angular.module('exampleTest', [])
    .factory('wdAlert', alert);

  beforeEach(function() {
    module('exampleTest');
  });

  describe('something', function() {
    it('should pass', inject(function(wdAlert) {
      expect(wdAlert.registerModal).not.toBe(undefined);
    }));
  });
});
