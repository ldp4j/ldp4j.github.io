'use strict';

/* Filters */

angular.module('ldp4j.filters', []).
filter('interpolate', ['version',
    function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        };
  }]).
filter('highlight', [
    function () {
        return function (input, query) {
            return input.replace(RegExp('(' + query + ')', 'g'),
                '<strong>$1</strong>');
        };
}]);