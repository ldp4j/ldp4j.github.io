'use strict';

angular.module('ldp4j', [
    'ngRoute',
    'ngLocale',
    'ngAnimate',
    'ngSanitize',
    'ldp4j.filters',
    'ldp4j.services',
    'ldp4j.directives',
    'ldp4j.controllers'
]).
config(['$routeProvider',
    function ($routeProvider) {

        function Resolve($json, name) {
            this.setup = function () {
                return $json.load(name);
            };
        }

        var setupRoute = function (path, html, ctrl, setup) {
            $routeProvider.when(path, {
                templateUrl: 'partials/' + html + '.html',
                controller: ctrl,
                resolve: {
                    setup: function ($json) {
                        if (setup !== undefined) {
                            var resolve = new Resolve($json, setup);
                            return resolve.setup();
                        }

                        return undefined;
                    }
                }
            });
        };

        setupRoute('/', 'home', 'HomeController', 'home');
        setupRoute('/community', 'community', 'CommunityController', 'community');
        setupRoute('/learn/ldp', 'ldp', 'LDPController', 'ldp');
        setupRoute('/about', 'about', 'AboutController', 'about');
        setupRoute('/learn/start', 'start', 'StartController');
        setupRoute('/learn/javadoc', 'javadoc', 'JavadocController');

        $routeProvider.otherwise({
            redirectTo: '/'
        });
    }]).
run(['$rootScope',
    function ($root) {
        $root.$on('$routeChangeStart', function (e, curr, prev) {
            if (curr.$$route && curr.$$route.resolve) {
                // Don't show the view until promises are not resolved
                $root.ready = false;
            }
        });
        $root.$on('$routeChangeSuccess', function (e, curr, prev) {
            // Ready to show
            $root.ready = true;
        });
    }]);
