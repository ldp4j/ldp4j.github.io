'use strict';

/* Services */

var services = angular.module('ldp4j.services', []).value('version', '0.2');

services.service('$json', function ($http) {

    var manager = {
        load: function (name) {
            var url = 'json/' + name + '.json';
            return $http.get(url);
        }
    };
    return manager;
});

services.service('$text', function ($http) {

    var manager = {
        load: function (name) {
            var url = 'md/' + name + '.md';
            return $http.get(url);
        },
        html: function (text) {
            var html = markdown.toHTML(text);
            var find = '<code>';
            var re = new RegExp(find, 'g');

            return html.replace(re, '<code class="prettyprint">');
        }
    };
    return manager;
});
