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

    var ID_FIELDS = ['id', '_id', 'uid', 'uuid', '$uid'];

    function getAvailableColumns(thead, tbody) {
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
        var elt = '<thead><tr><th><input type="checkbox" ng-model="selectAll" ng-click="ctrl.selectAll(selectAll)"/></th>';
        _.each(columns, function (child) {
            elt += '<th ng-click="ctrl.order(\'' + child.id + '\')" ng-if="ctrl.display(\'' + child.id + '\')">';
            elt += child.headTemplate;
            elt += '<button ng-click="ctrl.dismiss(\'' + child.id + '\')">x</button>';
            elt += '</th>';
        });
        return elt;
    }

    function buildBody(columns) {
        var elt = '<tbody>' +
            '<tr class="noselect" ng-repeat="elt in ctrl.zlTable | orderBy:ctrl.orderBy:ctrl.reverse" ng-click="ctrl.rowClick($event, elt)" ng-class="{\'zl-row-selected\': ctrl.isSelected(elt)}">' +
            '<td  ng-click="ctrl.selectClick($event, elt)"><input ng-click="ctrl.selectClick($event, elt); $event.stopImmediatePropagation()" type="checkbox" ng-checked="ctrl.isSelected(elt)"/></td>';
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
            zlTable         : '=',
            columns         : '=',
            update          : '&',
            pagination      : '=',
            selectedData    : '=',
            selectionChanged: '&',
            idField         : '@'
        },
        compile         : function (elt) {
            var head             = _.find(elt.children(), 'tagName', 'THEAD');
            var body             = _.find(elt.children(), 'tagName', 'TBODY');
            var availableColumns = getAvailableColumns(head, body);
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
                }
            }
        },
        controller      : function () {
            var self = this;

            function selectAll(bool) {
                console.info('select all: ', bool);
                if (bool) {
                    self.selectedData = _.map(self.zlTable, function (el) {
                        return el[self.idField];
                    });
                } else {
                    self.selectedData = [];
                }
            }

            function selectClick(event, elt) {
                if (event.shiftKey && !isSelected(elt)) {
                    rowClick(event, elt);
                } else {
                    if (isSelected(elt)) {
                        _.remove(self.selectedData, function (selectedId) {
                            return selectedId === getIdValue(elt);
                        });
                    } else {
                        self.selectedData.push(getIdValue(elt));
                    }
                    self.selectionChanged({$selectedData: self.selectedData});
                }
            }

            function rowClick(event, elt) {
                if (event.shiftKey) {
                    if (isSelected(elt)){
                        return;
                    }
                    var lastClicked = self.selectedData[self.selectedData.length - 1] || getIdValue(self.zlTable[0]);
                    var inside      = false;
                    _.each(self.zlTable, function (currentObj) {
                        if (getIdValue(currentObj) === lastClicked || currentObj === elt) {
                            inside = !inside;
                        }
                        if (inside && !isSelected(currentObj)) {
                            self.selectedData.push(getIdValue(currentObj));
                        }
                    });
                    if (!isSelected(elt)) {
                        self.selectedData.push(getIdValue(elt));
                    }
                    self.selectionChanged({$selectedData: self.selectedData});
                }
            }

            function isSelected(elt) {
                return _.includes(self.selectedData, getIdValue(elt));
            }

            function getIdValue(obj) {
                if (!self.idField) {
                    var found = _.find(ID_FIELDS, function (f) {
                        return obj[f];
                    });
                    if (found) {
                        self.idField = found;
                    }
                }
                return self.idField ? obj[self.idField] : undefined;
            }

            function updateCall() {
                self.update({$pagination: self.pagination});
            }

            function init() {
                self.pagination             = self.pagination || {};
                self.pagination.currentPage = self.pagination.currentPage || 0;
                self.pagination.perPage     = self.pagination.perPage || 10;
                self.selectedData           = self.selectedData || [];
                updateCall();
            }

            function order(name) {
                self.pagination.orderBy = name;
                self.pagination.reverse = !this.reverse;
                updateCall();
            }

            function display(name) {
                return _.contains(self.columns, name);
            }

            function dismiss(name) {
                _.pull(self.columns, name);
            }

            _.extend(self, {
                order      : order,
                display    : display,
                dismiss    : dismiss,
                rowClick   : rowClick,
                isSelected : isSelected,
                selectClick: selectClick,
                selectAll  : selectAll
            });

            init();

        }
    };
}]);


angular.module('90TechSAS.zl-table').directive('zlPaginate', ['$compile', '$timeout', function ($compile, $timeout) {

    return {
        restrict        : 'E',
        controllerAs    : 'paginationCtrl',
        scope           : {},
        template        : '<button ng-if="paginationCtrl.pagination.currentPage != 0" ng-click="paginationCtrl.previousPage()">&lt;</button>' +
        '<button ng-repeat="elt in paginationCtrl.paginateArray() track by $index" ng-click="paginationCtrl.page($index)">{{$index +1}}</button>' +
        '<button ng-if="paginationCtrl.pagination.currentPage != paginationCtrl.pagination.totalElements" ng-click="paginationCtrl.nextPage()">&gt;</button>',
        bindToController: {
            update    : '&',
            pagination: '='
        },
        controller      : function () {

            var self = this;

            function updateCall() {
                self.update({$pagination: self.pagination});
            }

            function nextPage() {
                self.page(self.pagination.currentPage + 1);
            }

            function previousPage() {
                self.page(self.pagination.currentPage - 1);
            }

            function page(pageNumber) {
                self.pagination.currentPage = pageNumber;
                updateCall();
            }

            function paginateArray() {
                var pageNumber = Math.ceil(self.pagination.totalElements / self.pagination.perPage);
                return new Array(isNaN(pageNumber) ? 0 : pageNumber);
            }

            _.extend(self, {
                paginateArray: paginateArray,
                page         : page,
                previousPage : previousPage,
                nextPage     : nextPage
            });
        }
    }
}]);
