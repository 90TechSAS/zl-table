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

    var paginationTemplate = '<button ng-if=""></button><button ng-repeat="elt in ctrl.paginateArray() track by $index" ng-click="ctrl.page($index)">{{$index +1}}</button>';


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
            elt += '<th ng-click="ctrl.order(\'' + child.id + '\')" ng-if="ctrl.display(\'' + child.id + '\')">';
            elt += child.headTemplate;
            elt += '<button ng-click="ctrl.dismiss(\'' + child.id + '\')">x</button>';
            elt += '</th>';
        });
        return elt;
    }

    function buildBody(columns) {
        var elt = '<tbody><tr ng-repeat="elt in ctrl.zlTable | orderBy:ctrl.orderBy:ctrl.reverse">';
        _.each(columns, function (c) {
            elt += '<td ng-if="ctrl.display(\'' + c.id + '\')">' + c.template + '</td>';
        });
        elt += '</tr></tbody>';
        return elt;
    }

    return {
        restrict        : 'A',
        controllerAs    : 'ctrl',
        scope           : {},
        bindToController: {
            zlTable   : '=',
            columns   : '=',
            update    : '&',
            pagination: '='

        },
        compile         : function (elt) {
            var head             = _.find(elt.children(), 'tagName', 'THEAD');
            var body             = _.find(elt.children(), 'tagName', 'TBODY');
            var availableColumns = getAvalaibleColumns(head, body);
            var headBuilt        = buildHeader(availableColumns);
            var bodyBuilt        = buildBody(availableColumns);

            return {
                pre: function (scope, element) {
                    $timeout(function () {
                        head.remove();
                        body.remove();
                    });
                    element.append($compile(headBuilt)(scope));
                    element.append($compile(bodyBuilt)(scope));
                    element.append($compile(paginationTemplate)(scope));
                }
            }
        },
        controller      : function () {
            var self = this;

            function updateCall() {
                console.info('updateCall');
                self.update({$pagination: self.pagination});
            }

            function init() {
                self.pagination             = self.pagination || {};
                self.pagination.currentPage = self.pagination.currentPage || 0;
                self.pagination.perPage     = self.pagination.perPage || 2;
                updateCall();
            }


            function page(pageNumber) {
                self.pagination.currentPage = pageNumber;
                updateCall();
            }

            function paginateArray() {
                var pageNumber = Math.ceil(self.pagination.totalElements / self.pagination.perPage);
                if (isNaN(pageNumber)) {
                    pageNumber = 0;
                }
                return new Array(pageNumber);
            }

            function order(name) {
                self.orderBy = name;
                self.reverse = !this.reverse;
            }

            function display(name) {
                return _.contains(self.columns, name);
            }

            function dismiss(name) {
                _.pull(self.columns, name);
            }

            _.extend(self, {
                order        : order,
                display      : display,
                dismiss      : dismiss,
                paginateArray: paginateArray,
                page         : page
            });

            init();

        }
    };
}]);