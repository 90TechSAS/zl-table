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

angular.module('90TechSAS.zl-table', []).directive('zlTable', ['$compile', function ($compile) {


    function getAvalaibleColumns(thead, tbody) {
        var row     = _.find(thead.children, function (ch) {
            return ch.tagName === 'TR'
        });
        var bodyRow = _.find(tbody.children, function (ch) {
            return ch.tagName === 'TR'
        });

        var available = [];
        _.each(row.children, function (c, i) {
            available.push({
                id          : c.attributes.getNamedItem('id').value,
                headTemplate: c.innerHTML,
                template    : bodyRow.children[i].innerHTML
            })
        });
        return available;
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
        transclude: 'element',
        replace   : true,
        scope     : {
            zlTable: '=',
            columns: '='
        },
        template  : '<table></table>',
        link      : function (scope, element, attrs, ctrl, transclude) {
            transclude(function (clone) {
                var elt = clone[0];
                if (!elt) {
                    return;
                }
                var head = _.find(elt.children, function (ch) {
                    return ch.tagName === 'THEAD'
                });
                var body = _.find(elt.children, function (ch) {
                    return ch.tagName === 'TBODY'
                });

                var availableColumns = getAvalaibleColumns(head, body);
                var headBuilt        = buildHeader(availableColumns);
                var bodyBuilt        = buildBody(availableColumns);
                element.append($compile(headBuilt)(scope));
                element.append($compile(bodyBuilt)(scope));
            })

        },

        controller: function ($scope, $element, $attrs) {
            $scope.order = function (name) {
                $scope.orderBy = name;
                $scope.reverse = !$scope.reverse;
            };

            $scope.display = function (name) {
                return _.contains($scope.columns, name);
            };

            $scope.dismiss = function(name){
                _.pull($scope.columns, name);
            }
        }
    };
}])
;