'use strict';

/* Controllers */

var gotoFn = function ($location, addr) {
    if (addr.indexOf('http') !== 0) {
        $location.path(addr);
    } else {
        $(location).attr('about', 'blank_');
        $(location).attr('href', addr);
    }
};

angular.module('ldp4j.controllers', [])
    .controller('FooterController', ['$scope', '$json', '$location',
        function ($scope, $json, $location) {

            $scope.ready = false;

            $json.load('footer').then(function (response) {
                if (typeof response.data === 'object') {
                    $scope.rights = response.data.rights;
                    $scope.com = response.data.com;
                }

                $scope.ready = true;

            }, function (response) {});
        }])
    .controller('HomeController', ['$scope', '$json', '$location',
        function ($scope, $json, $location) {

            $scope.ready = false;

            $scope.goto = function (addr) {
                gotoFn($location, addr);
            };

            $json.load('home').then(function (response) {
                if (typeof response.data === 'object') {
                    $scope.ldp = response.data.ldp;
                    $scope.involved = response.data.involved;
                    $scope.who = response.data.who;
                    $scope.jumbo = response.data.jumbo;
                }

                $scope.ready = true;

            }, function (response) {});
        }])
    .controller('CommunityController', ['$scope', '$json', '$location', '$timeout',
        function ($scope, $json, $location, $timeout) {

            $scope.ready = false;
            $scope.twShow = false;
            $scope.twButtonFocused = false;
            $scope.twFocused = false;
            $scope.inTimer = undefined;
            $scope.outTimer = undefined;

            function Section() {
                this.content = [];
                this.style = {};
                this.focused = false;
            }

            $scope.it = new Section();
            $scope.sr = new Section();
            $scope.tw = new Section();
            $scope.ml = new Section();

            $scope.goto = function (addr) {
                gotoFn($location, addr);
            };

            $scope.showTwitter = function () {
                if ($scope.twButtonFocused) {
                    $scope.updateTwitter();
                    $scope.twShow = true;
                }
            };

            $scope.checkFocus = function () {
                if (!$scope.twFocused) {
                    $scope.twShow = false;
                }
            };

            var btn = $('#panel-tw-btn');
            btn.mouseenter(function () {
                if (!$scope.twShow) {
                    $scope.twButtonFocused = true;
                    $scope.timer = $timeout($scope.showTwitter, 500);
                }
            });

            btn.mouseleave(function () {
                $timeout.cancel($scope.inTimer);
                $scope.twButtonFocused = false;
                $timeout($scope.checkFocus, 500);
            });

            $scope.updateTwitter = function () {
                var btn = $('#panel-tw-btn');
                var twitter = $('#twitter');

                twitter.css('top', btn.offset().top - 320);
                twitter.css('left', btn.offset().left - 80);
            };

            $(window).resize(function () {
                $scope.updateTwitter();
            });


            $scope.inTwButton = function () {
                $scope.twButtonFocused = true;
            };

            $scope.outTwButton = function () {
                $scope.twButtonFocused = false;
            };

            $scope.inTwPanel = function () {
                $scope.twFocused = true;
            };

            $scope.outTwPanel = function () {
                $scope.twFocused = false;
                $scope.twShow = false;
            };

            $scope.cancelTimers = function () {
                $timeout.cancel($scope.inTimer);
                $timeout.cancel($scope.outTimer);
            };

            $scope.$on('$destroy', function () {
                $scope.cancelTimers();
                $(window).off('resize');
            });

            $json.load('community').then(function (response) {

                var cfg = response.data;
                if (typeof cfg === 'object') {
                    // Issue tracker content
                    if (cfg.it !== undefined && cfg.it.sections !== undefined) {
                        $scope.it.content = cfg.it.sections;
                    }

                    // Source repository content
                    if (cfg.sr !== undefined && cfg.sr.sections !== undefined) {
                        $scope.sr.content = cfg.sr.sections;
                    }

                    // Twitter content
                    if (cfg.tw !== undefined && cfg.tw.sections !== undefined) {
                        $scope.tw.content = cfg.tw.sections;
                    }

                    // Mailing lists content
                    if (cfg.ml !== undefined && cfg.ml.sections !== undefined) {
                        $scope.ml.content = cfg.ml.sections;
                    }

                    $scope.intro = cfg.intro;
                }

                $scope.ready = true;

            }, function (response) {});
        }])
    .controller('AboutController', ['$scope', '$json',
        function ($scope, $json) {
            $scope.ready = false;

            $json.load('about').then(function (response) {

                var cfg = response.data;
                if (typeof cfg === 'object') {
                    $scope.texts = response.data;
                }

                $scope.ready = true;

            }, function (response) {});

        }])
    .controller('StartController', ['$scope',
        function ($scope) {
            $scope.ready = true;
            prettyPrint();

        }])
    .controller('JavadocController', ['$scope',
        function ($scope) {
            var javadoc = $('#javadoc');
            $scope.ready = true;

            $scope.resizeJavadoc = function () {
                var w = $(window);
                var footer = $('#footer').outerHeight();
                //var top = javadoc.offset().top;
                var newH = w.innerHeight() - 150 - footer;

                javadoc.attr('height', newH + 'px');
            };

            $(window).resize(function () {
                $scope.resizeJavadoc();
            });

            $scope.resizeJavadoc();

        }])
    .controller('LDPController', ['$scope', '$json', '$sce',
        function ($scope, $json, $sce) {

            $scope.sections = [];
            $scope.iframe = {
                ready: false,
                title: '',
                url: ''
            };
            $scope.contentReady = false;

            $scope.updateSizes = function () {
                var descHeight = $('#ldp-description').height();
                var titleHeight = $('#ldp-wrapper-title').outerHeight(true);
                $('#ldp-wrapper-container').height(descHeight - titleHeight);
                $('#ldp-wrapper').height(descHeight);
            };

            $scope.updateWrapper = function () {
                $scope.iframe.ready = true;
                $scope.$apply();
                $scope.updateSizes();
            };

            $json.load('ldp').then(function (response) {

                var cfg = response.data;
                if (typeof cfg === 'object') {
                    if (cfg.first !== undefined && cfg.first.sections !== undefined) {
                        $scope.first = cfg.first.sections;
                    }
                    if (cfg.last !== undefined && cfg.last.sections !== undefined) {
                        $scope.last = cfg.last.sections;
                    }

                    $scope.header = cfg.header;
                    $scope.docs = cfg.docs;
                }

                $scope.contentReady = true;

            }, function (response) {});

            $(window).resize(function () {
                $scope.updateSizes();
            });

            $scope.$on('$destroy', function () {
                $(window).off('resize');
            });

        }])
    .controller('NavbarController', ['$scope', '$location', '$json',
    function ($scope, $location, $json) {

            $scope.title = undefined;
            $scope.texts = undefined;
            $scope.ready = false;

            $json.load('navbar').then(function (response) {
                if (typeof response.data === 'object') {
                    $scope.title = response.data.title;
                    $scope.menus = response.data.menus;
                }

                $scope.ready = true;

            }, function (response) {});

            $scope.isActive = function (viewLocation) {
                var path = $location.path();

                return (viewLocation === '/' && path === viewLocation) || (viewLocation != '/' && path.indexOf(viewLocation) === 0);
            };


        }]);
