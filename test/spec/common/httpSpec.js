define([
        'services/common/http',
        'angular'
    ], function(
        http,
        angular
    ) {
'use strict';

var shouldPass = false;
angular.module('testCommonHttp', [])
    .provider('wdHttp', http)
    .config(function(wdHttpProvider) {
        wdHttpProvider.requestInterceptors.push(function() {
            return function(config) {
                return !!shouldPass;
            };
        });
    });

describe('http test', function() {
    var request, success, error, $httpBackend, wdHttp;

    beforeEach(function() {
        module('testCommonHttp');
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            wdHttp = $injector.get('wdHttp');
        });
        success = jasmine.createSpy('success');
        error = jasmine.createSpy('error');
    });
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should cancel the request if any requestInterceptor not pass', inject(function($browser) {
        shouldPass = false;
        request = wdHttp();

        expect(request.success(success)).toBe(request);
        expect(request.error(error)).toBe(request);

        expect(success.callCount).toBe(0);
        expect(error.callCount).toBe(0);

        $browser.defer.flush();

        expect(success.callCount).toBe(0);
        expect(error.callCount).toBe(1);
    }));

    it('should send the request if all requestInterceptors pass', inject(function(wdHttp) {
        shouldPass = true;

        $httpBackend.expectGET('/test.txt').respond('200', 'Hello World!');

        request = wdHttp({
            method: 'GET',
            url: '/test.txt'
        });

        $httpBackend.flush();
    }));
});

});
