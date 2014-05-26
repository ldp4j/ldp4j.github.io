'use strict';


// Declare app level module which depends on filters, and services
angular.module('ldp4j', [
    'ngRoute',
    'ngLocale',
    'ngAnimate',
    'ldp4j.filters',
    'ldp4j.services',
    'ldp4j.directives',
    'ldp4j.controllers'
]).
config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeController'
        });
        $routeProvider.when('/community', {
            templateUrl: 'partials/community.html',
            controller: 'CommunityController'
        });
        $routeProvider.when('/about', {
            templateUrl: 'partials/about.html',
            controller: 'AboutController'
        });
        $routeProvider.when('/learn/ldp', {
            templateUrl: 'partials/ldp.html',
            controller: 'LDPController'
        });
        $routeProvider.when('/learn/start', {
            templateUrl: 'partials/start.html',
            controller: 'StartController'
        });
        $routeProvider.when('/learn/javadoc', {
            templateUrl: 'partials/javadoc.html',
            controller: 'JavadocController'
        });
        $routeProvider.otherwise({
            redirectTo: '/'
        });
}]);