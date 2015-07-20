/**
 @toc

 @param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
 TODO

 @param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'
 TODO

 @dependencies
 TODO

 @usage
 partial / html:
 TODO

 controller / js:
 TODO

 //end: usage
 */

'use strict';

angular.module('90TechSAS.zl-table', []).directive('zlTable', ['$compile', '$timeout', function ($compile, $timeout) {


    function getAvalaibleColumns(thead, tbody) {
        var row     = _.find(thead.children, 'tagName', 'TR');
        var bodyRow = _.find(tbody.children, 'tagName', 'TR');
        return _.map(row.children, function (c, i) {
            return {
                id          : c.attributes.getNamedItem('id').value,
                headTemplate: c.innerHTML,
                template    : bodyRow.children[i].innerHTML
            };
        });
    }

    function buildHeader(columns) {
        var elt = '<thead><tr>';
        _.each(columns, function (child) {
            elt += '<th ng-click="order(\'' + child.id + '\')" ng-if="display(\'' + child.id + '\')">';
            elt += child.headTemplate;
            elt += '<button ng-click="dismiss(\'' + child.id + '\')">x</button>';
            elt += '</th>';
        });
        return elt;
    }

    function buildBody(columns) {
        var elt = '<tbody><tr ng-repeat="elt in zlTable | orderBy:orderBy:reverse">';
        _.each(columns, function (c) {
            elt += '<td ng-if="display(\'' + c.id + '\')">' + c.template + '</td>';
        });
        elt += '</tr></tbody>';
        return elt;
    }

    return {
        restrict  : 'A',
        scope     : {
            zlTable: '=',
            columns: '='
        },
        compile   : function (elt) {
            var head             = _.find(elt.children(), 'tagName', 'THEAD');
            var body             = _.find(elt.children(), 'tagName', 'TBODY');
            var availableColumns = getAvalaibleColumns(head, body);
            var headBuilt        = buildHeader(availableColumns);
            var bodyBuilt        = buildBody(availableColumns);

            return {
                pre: function (scope, element) {
                    $timeout(function(){
                        head.remove();
                        body.remove();
                    });
                    element.append($compile(headBuilt)(scope));
                    element.append($compile(bodyBuilt)(scope));
                }
            }
        },
        controller: function ($scope) {
            $scope.order = function (name) {
                $scope.orderBy = name;
                $scope.reverse = !$scope.reverse;
            };

            $scope.display = function (name) {
                return _.contains($scope.columns, name);
            };

            $scope.dismiss = function (name) {
                _.pull($scope.columns, name);
            }
        }
    };
}]);