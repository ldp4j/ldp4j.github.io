'use strict';

var directives = angular.module('ldp4j.directives', []).value('version', '0.2');

directives.
directive('appVersion', ['version',
    function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]).
directive('postRepeat', ['$text',
    function ($text) {
        return {
            restrict: 'A',
            compile: function (tElem, attrs) {
                return function (scope, element, attrs) {
                    if (scope.$last) {
                        // iteration is complete, do whatever post-processing
                        // is necessary
                        var md = element.find('#md-cand');
                        var html = md.html();
                        html = $text.html(html);
                        md.html(html);
                        prettyPrint();

                    }
                };
            }
        }
    }]).directive('md', ['$text',
    function ($text) {
        return {
            restrict: 'A',
            compile: function (tElem, attrs) {

                tElem.css('display', 'block');
                tElem.css('overflow', 'hidden');

                var html = tElem.html();
                html = $text.html(html);
                tElem.html(html);

                return function (scope, elem, attrs) {
                    prettyPrint();
                };
            }
        };
    }]).directive('column', ['$text',
    function ($text) {
        return {
            restrict: 'E',
            compile: function (tElem, attrs) {

                tElem.append('<div ng-repeat="s in ' + attrs.sections + '"><h3 ng-if="s.title != undefined">{{s.title}}</h3><div ng-if="s.paragraphs != undefined" ng-repeat="par in s.paragraphs"><div md id="md-cand">{{par}}</div></div></div>');

                tElem.css('display', 'block');

                return function (scope, elem, attrs) {
                    /*var md = elem.find('#md-cand');

                    var html = md.html();
                    html = $text.html(html);
                    elem.html(html);
                    prettyPrint();
                    console.log(html);*/
                };
            }
        };
    }]).directive('contact',
    function () {
        return {
            restrict: 'E',
            compile: function (tElem, attrs) {

                tElem.append('<div style="float:left; padding-bottom:0.1em"><img style="max-width: 25px" src="' + attrs.logo + '"></div><div><a style="padding-left:0.5em;padding-top:2px" ng-href="' + attrs.link + '" target="_blank">' + attrs.user + '</a></div>');

                tElem.css('display', 'block');
                tElem.css('overflow', 'hidden');

                return function (scope, elem, attrs) {};
            }
        };
    }).directive('markdown', ['$text',
    function ($text) {
        return {
            restrict: 'E',
            compile: function (tElem, attrs) {

                tElem.css('display', 'block');
                tElem.css('overflow', 'hidden');

                return function (scope, elem, attrs) {
                    $text.load(attrs.text).then(function (response) {
                        elem.append($text.html(response.data));
                        prettyPrint();
                    }, function (error) {});

                };
            }
        };
    }]).directive('panel', ['$window', '$location',
    function ($window, $location) {

        var updateButton = function (button) {
            var parent = button.parent();

            var left = 1.0 - (button.outerWidth() / parent.width());
            left = Math.max(0.0, left);
            button.css('left', (left * 50.0) + '%');
        };

        var extend = function (scope, elem, attrs) {
            var btn = elem.find('#' + attrs.id + '-btn');
            updateButton(btn);
            if (attrs.padding === undefined)
                attrs.padding = '5em';

            elem.css('padding-bottom', attrs.padding);
            var sub = elem.find("[id$='-sub']");
            sub.css('opacity', 1.0);
        };

        var restore = function (scope, elem, attrs) {
            var sub = elem.find("[id$='-sub']");
            if (attrs.fixed === undefined) {
                elem.css('padding-bottom', '0em');
                sub.css('opacity', 0.0);
            } else {
                sub.css('opacity', 0.65);
            }

        };

        return {
            restrict: 'E',
            compile: function (tElem, attrs) {
                tElem.append('<div id="' + attrs.id + '-w" class="col-md-12"></div>');

                var wrapper = tElem.find('div#' + attrs.id + '-w');

                wrapper.append('<div class="row"><column id="' + attrs.id + '-col" sections="' + attrs.sections + '"></column></div>');
                wrapper.append('<div class="row"><div id="' + attrs.id + '-sub" style="position:relative" class="col-md-12 col-sm-12 col-xs-12 animated"></div></div>');

                var sub = wrapper.find('#' + attrs.id + '-sub');
                if (attrs.button !== undefined) {
                    sub.append('<button id="' + attrs.id + '-btn" style="position:absolute; top: 0.5em;" type="button" class="btn btn-primary btn-lg">' + attrs.button + '</button>');
                }

                if (attrs.inject !== undefined) {
                    var previous = $('#' + attrs.inject);
                    sub.append(previous.html());
                }

                tElem.css('display', 'block');
                tElem.css('overflow', 'hidden');
                if (attrs.fixed === undefined) {
                    tElem.css('padding-bottom', '0em');
                } else {
                    if (attrs.padding !== undefined) {
                        tElem.css('padding-bottom', attrs.padding);
                    } else {
                        tElem.css('padding-bottom', '5em');
                    }
                }

                tElem.addClass('animated');

                return function (scope, elem, attrs) {

                    var sub = elem.find('#' + attrs.id + '-sub');

                    if (attrs.fixed === undefined) {
                        sub.css('opacity', 0.0);
                    } else {
                        sub.css('opacity', 0.65);
                    }

                    elem.mouseenter(function () {
                        extend(scope, elem, attrs);
                    });

                    elem.mouseleave(function () {
                        restore(scope, elem, attrs);
                    });

                    if (attrs.button !== undefined) {
                        var btn = elem.find('#' + attrs.id + '-btn');

                        btn.focusout(function () {
                            restore(scope, elem, attrs);
                        });

                        btn.focusin(function () {
                            extend(scope, elem, attrs);
                        });

                        btn.click(function () {
                            if (attrs.url !== undefined) {
                                if (attrs.url.indexOf('http') !== 0) {
                                    $location.path(attrs.url);
                                    scope.$apply();
                                } else {
                                    $window.open(attrs.url);
                                }
                            }
                        });

                        if (attrs.fixed !== undefined) {
                            updateButton(btn);
                        }

                        $(window).resize(function () {
                            updateButton(btn);
                        });
                    }
                };
            }
        };
    }]);
