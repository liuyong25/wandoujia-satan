define([
        'services/common/http',
        'angular',
        'underscore'
    ], function(
        http,
        angular,
        _
    ) {
'use strict';

var shouldPass = false;
angular.module('testCommonHttp', [])
    .provider('wdHttp', http)
    .config(function(wdHttpProvider, $provide) {
        wdHttpProvider.requestInterceptors.push(function() {
            return function(config) {
                return !!shouldPass;
            };
        });

        $provide.decorator('$http', wdHttpProvider.httpDecorator);
    });

describe('http test', function() {
    var request, success, error, $httpBackend, $http;

    beforeEach(function() {
        module('testCommonHttp', 'ngResource');
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $http = $injector.get('$http');
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
        request = $http();

        expect(request.success(success)).toBe(request);
        expect(request.error(error)).toBe(request);

        expect(success.callCount).toBe(0);
        expect(error.callCount).toBe(0);

        $browser.defer.flush();

        expect(success.callCount).toBe(0);
        expect(error.callCount).toBe(1);
    }));

    it('should send the request if all requestInterceptors pass', inject(function() {
        shouldPass = true;

        $httpBackend.expectGET('/test.txt').respond('200', 'Hello World!');

        request = $http({
            method: 'GET',
            url: '/test.txt'
        });

        $httpBackend.flush();
    }));
});

});
