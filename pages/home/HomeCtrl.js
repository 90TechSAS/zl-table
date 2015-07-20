/**
*/

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {

    //$scope .data = $q.defer();

    $http.get('http://beta.json-generator.com/api/json/get/Nkgq9efF').success(function(data){
        console.info(data);
        $scope.data = data;
        //$scope.data.resolve(data);
    });
}]);