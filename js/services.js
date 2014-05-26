'use strict';

/* Services */

var services = angular.module('ldp4j.services', []).value('version', '0.1');

services.service('$json', function ($http) {

    var jsonManager = {
        load: function (name) {
            var url = 'json/' + name + '.json';
            return $http.get(url);
        }
    };
    return jsonManager;
});