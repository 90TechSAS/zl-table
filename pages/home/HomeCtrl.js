/**
 */

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', '$http', '$q', function ($scope, $http) {
    var self    = this;
    self.columns = ['greeting', 'favoriteFruit',  'friends', 'tags', 'name.first', 'name.last'];
    self.update = function (pagination) {
        console.info(pagination);
        $http.get('http://beta.json-generator.com/api/json/get/EkdQWJIt' /*'http://www.json-generator.com/api/json/get/bTqDEPaTsi?indent=2'*/).success(function (data) {
            // Simulate server side pagination
            var begin = pagination.currentPage * pagination.perPage;
            var end =  (pagination.currentPage+1)*pagination.perPage;
            self.data = data.slice(begin, end);
            self.pagination = _.extend(pagination, {totalElements : 20});
        });
    };
}]);