'use strict';

/* Controllers */

var markdownSection = function (section) {
    if (section.paragraphs !== undefined) {
        var paragraphs = [];
        section.paragraphs.forEach(function (par) {
            paragraphs.push(markdown.toHTML(par));
        });

        section.paragraphs = paragraphs;
    }
};

var markdownSections = function (sections) {
    sections.forEach(function (section) {
        markdownSection(section);
    });

    return sections;
};

angular.module('ldp4j.controllers', []).value('version', '0.2')
    .controller('FooterController', ['$scope', '$json',
        function ($scope, $json) {

            $json.load('footer').then(function (response) {
                if (typeof response.data === 'object') {
                    $scope.rights = response.data.rights;
                    $scope.com = response.data.com;
                }
            }, function (error) {});

            angular.element(document).ready(function () {
                $scope.$parent.docReady = true;
            });
        }])
    .controller('HomeController', ['$scope', 'setup',
        function ($scope, setup) {

            $scope.texts = setup.data;

            $scope.$parent.ready = true;

        }])
    .controller('CommunityController', ['$scope', '$timeout', 'setup',
        function ($scope, $timeout, setup) {

            $scope.twShow = false;
            $scope.twButtonFocused = false;
            $scope.twFocused = false;
            $scope.inTimer = undefined;
            $scope.outTimer = undefined;

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

            $scope.texts = setup.data;
            /*$scope.texts.it.sections = markdownSections(setup.data.it.sections);
            $scope.texts.sr.sections = markdownSections(setup.data.sr.sections);
            $scope.texts.tw.sections = markdownSections(setup.data.tw.sections);
            $scope.texts.ml.sections = markdownSections(setup.data.ml.sections);
            $scope.texts.co.sections = markdownSections(setup.data.co.sections);*/
        }])
    .controller('AboutController', ['$scope', 'setup',
        function ($scope, setup) {
            $scope.texts = setup.data;
        }])
    .controller('StartController', ['$scope',
        function ($scope) {}])
    .controller('JavadocController', ['$scope',
        function ($scope) {
            var javadoc = $('#javadoc');
            $scope.ready = true;

            $scope.resizeJavadoc = function () {
                var w = $(window);
                var footer = $('#footer').outerHeight();
                var newH = w.innerHeight() - 150 - footer;

                javadoc.attr('height', newH + 'px');
            };

            $(window).resize(function () {
                $scope.resizeJavadoc();
            });

            $scope.resizeJavadoc();

        }])
    .controller('LDPController', ['$scope', 'setup',
        function ($scope, setup) {

            $scope.sections = [];
            $scope.iframe = {
                ready: false,
                title: '',
                url: ''
            };

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

            var cfg = setup.data;
            if (cfg.first !== undefined && cfg.first.sections !== undefined) {
                $scope.first = cfg.first.sections;
            }
            if (cfg.last !== undefined && cfg.last.sections !== undefined) {
                $scope.last = cfg.last.sections;
            }

            $scope.header = cfg.header;
            $scope.docs = cfg.docs;

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

            }, function (error) {});

            $scope.isActive = function (viewLocation) {
                var path = $location.path();

                return (viewLocation === '/' && path === viewLocation) || (viewLocation != '/' && path.indexOf(viewLocation) === 0);
            };


        }]);
