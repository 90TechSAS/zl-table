/**
 */

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', '$http', '$q', function ($scope, $http) {
    var self    = this;

    self.columns = [
        {id: 'favoriteFruit', visible:true, sortable:false},
        {id: 'greeting', visible:true},
        {id: 'friends', visible:true},
        {id: 'tags', visible:true},
        {id: 'name.first', visible:true},
        {id: 'name.last', visible:true}
    ];

    $scope.$watch(function(){return self.columns;}, function(val){console.info(val);});
    self.pagination = {};
    self.click= function(event, elt){
        console.info(event, elt);
    };
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