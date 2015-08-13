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

var module = angular.module('90TechSAS.zl-table', []);

module.directive('zlTable', ['$compile', '$timeout', '$templateCache', function($compile, $timeout, $templateCache){

    var ID_FIELDS = ['id', '_id', 'uid', 'uuid', '$uid'];

    var availableColumns;
    var rootElement;
    var tHeadAttrs, tBodyAttrs, headRowAttrs, bodyRowAttrs;

    function compile(elt){
        rootElement      = elt;
        var head         = _.find(elt.children(), 'tagName', 'THEAD');
        tHeadAttrs       = head.attributes;
        var body         = _.find(elt.children(), 'tagName', 'TBODY');
        tBodyAttrs       = body.attributes;
        availableColumns = getAvailableColumns(head, body);
        var headBuilt    = buildHeader(availableColumns);
        var bodyBuilt    = buildBody(availableColumns);
        var bodyGrid;


        return {
            pre: function(scope, element){
                $timeout(function(){
                    head.remove();
                    body.remove();
                });
                element.append($compile(headBuilt)(scope));

                element.append($compile(bodyBuilt)(scope));
                $timeout(function(){
                    bodyGrid = '<div ng-if="ctrl.gridMode">' +
                        '<div class="noselect" style="max-width:400px; float:left;margin:1%;" ng-repeat="elt in ctrl.zlTable | orderBy:ctrl.orderBy:ctrl.reverse"' +
                        'ng-class="{\'zl-row-selected\': ctrl.isSelected(elt)}"' +
                        'ng-click="ctrl.selectClick($event, elt)">' +
                        '<zl-template-compiler ' +
                        'template="' + escapeQuotes($templateCache.get(rootElement[0].attributes.getNamedItem('grid-template').value)) + '"></zl-template-compiler>' +
                        '</div>'+
                        '</div>' +
                        '<div style="clear:both;"></div>';
                    element.after($compile(bodyGrid)(scope));
                });

            }
        }
    }

    function escapeQuotes(str){
        return str.replace(/"/g, '&quot;');
    }

    function getAvailableColumns(thead, tbody){
        var row      = _.find(thead.children, 'tagName', 'TR');
        headRowAttrs = row.attributes;
        var bodyRow  = _.find(tbody.children, 'tagName', 'TR');
        bodyRowAttrs = bodyRow.attributes;
        return _.compact(_.map(row.children, function(c, i){
            if (!c.attributes.getNamedItem('id')) return;
            return {
                id          : c.attributes.getNamedItem('id').value,
                headTemplate: c.innerHTML,
                template    : bodyRow.children[i].innerHTML
            };
        }));
    }

    function buildAttributes(attrs){
        return _.reduce(attrs, function(result, attr){
            if (attr.name && attr.value){
                result += attr.name + '=' + attr.value + ' ';
            }
            return result;
        }, '');
    }

    function buildHeader(){
        var elt = '<thead ng-if="!ctrl.gridMode"' + buildAttributes(tHeadAttrs) + '>' +
            '<tr ' + buildAttributes(headRowAttrs) + '>' +
            '<th><input type="checkbox" ng-model="selectAll" ng-click="ctrl.selectAll(selectAll)"/></th>' +
            '<th ng-repeat="col in ctrl.availableColumns | zlColumnFilter:ctrl.columns" id="{{col.id}}" ng-click="ctrl.order(col.id)" zl-drag-drop drag="col.id" drop="ctrl.dropColumn($data, col.id)">' +
            '<zl-template-compiler template="{{col.headTemplate}}"></zl-template-compiler>' +
            '&nbsp;<button ng-click="ctrl.dismiss(col.id)" class="zl-table-del-btn"></button>' +
            '</th>' +
            '</tr></thead>';
        return elt;
    }

    function buildBody(){
        var elt = '<tbody ng-if="!ctrl.gridMode"' + buildAttributes(tBodyAttrs) + '>' +
            '<tr ' + buildAttributes(bodyRowAttrs) + 'class="noselect" ng-repeat="elt in ctrl.zlTable | orderBy:ctrl.orderBy:ctrl.reverse" ng-click="ctrl.rowClick($event, elt)" ng-class="{\'zl-row-selected\': ctrl.isSelected(elt)}">' +
            '<td  ng-click="ctrl.selectClick($event, elt)"><input ng-click="ctrl.selectClick($event, elt); $event.stopImmediatePropagation()" type="checkbox" ng-checked="ctrl.isSelected(elt)"/></td>' +
            '<td ng-repeat="col in ctrl.availableColumns | zlColumnFilter:ctrl.columns"><zl-template-compiler template="{{col.template}}"></zl-template-compiler></td>' +
            '</tr></tbody>';
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
            gridMode        : '=',
            gridTemplate    : '=',
            idField         : '@'
        },
        compile         : compile,
        controller      : function($scope){
            var self = this;

            function dropColumn(source, target){
                var new_index = self.columns.indexOf(target);
                var old_index = self.columns.indexOf(source);
                self.columns.splice(new_index, 0, self.columns.splice(old_index, 1)[0]);
                $scope.$apply();
            }

            function selectAll(bool){
                if (bool){
                    self.selectedData = _.map(self.zlTable, function(el){
                        return el[self.idField];
                    });
                } else{
                    self.selectedData = [];
                }
            }

            function selectClick(event, elt){
                if (event.shiftKey && !isSelected(elt)){
                    rowClick(event, elt);
                } else{
                    if (isSelected(elt)){
                        _.remove(self.selectedData, function(selectedId){
                            return selectedId === getIdValue(elt);
                        });
                    } else{
                        self.selectedData.push(getIdValue(elt));
                    }
                    self.selectionChanged({$selectedData: self.selectedData});
                }
            }

            function rowClick(event, elt){
                if (event.shiftKey){
                    if (isSelected(elt)){
                        return;
                    }
                    var lastClicked = self.selectedData[self.selectedData.length - 1] || getIdValue(self.zlTable[0]);
                    var inside      = false;
                    _.each(self.zlTable, function(currentObj){
                        if (getIdValue(currentObj) === lastClicked || currentObj === elt){
                            inside = !inside;
                        }
                        if (inside && !isSelected(currentObj)){
                            self.selectedData.push(getIdValue(currentObj));
                        }
                    });
                    if (!isSelected(elt)){
                        self.selectedData.push(getIdValue(elt));
                    }
                    self.selectionChanged({$selectedData: self.selectedData});
                }
            }

            function isSelected(elt){
                return _.includes(self.selectedData, getIdValue(elt));
            }

            function getIdValue(obj){
                if (!self.idField){
                    var found = _.find(ID_FIELDS, function(f){
                        return obj[f];
                    });
                    if (found){
                        self.idField = found;
                    }
                }
                return self.idField ? obj[self.idField] : undefined;
            }

            function updateCall(){
                self.update({$pagination: self.pagination});
            }

            function init(){
                self.pagination             = self.pagination || {};
                self.pagination.currentPage = self.pagination.currentPage || 0;
                self.pagination.perPage     = self.pagination.perPage || 10;
                self.selectedData           = self.selectedData || [];
                updateCall();
            }

            function order(name){
                self.pagination.orderBy = name;
                self.pagination.reverse = !this.reverse;
                updateCall();
            }

            function display(name){
                return _.contains(self.columns, name);
            }

            function dismiss(name){
                _.pull(self.columns, name);
            }

            _.extend(self, {
                order           : order,
                display         : display,
                dismiss         : dismiss,
                rowClick        : rowClick,
                isSelected      : isSelected,
                selectClick     : selectClick,
                selectAll       : selectAll,
                dropColumn      : dropColumn,
                availableColumns: availableColumns
            });

            init();

        }
    };
}]);


module.directive('zlPaginate', ['$compile', '$timeout', function($compile, $timeout){

    return {
        restrict        : 'E',
        controllerAs    : 'paginationCtrl',
        scope           : {},
        template        : '<button ng-if="paginationCtrl.pagination.currentPage != 0" ng-click="paginationCtrl.previousPage()">&lt;</button>' +
        '<button ng-repeat="elt in paginationCtrl.paginateArray() track by $index" ng-click="paginationCtrl.page($index)">{{$index +1}}</button>' +
        '<button ng-if="paginationCtrl.pagination.currentPage < paginationCtrl.paginateArray().length -1" ng-click="paginationCtrl.nextPage()">&gt;</button>',
        bindToController: {
            update    : '&',
            pagination: '='
        },
        controller      : function(){

            var self = this;

            function updateCall(){
                self.update({$pagination: self.pagination});
            }

            function nextPage(){
                self.page(self.pagination.currentPage + 1);
            }

            function previousPage(){
                self.page(self.pagination.currentPage - 1);
            }

            function page(pageNumber){
                self.pagination.currentPage = pageNumber;
                updateCall();
            }

            function paginateArray(){
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

module.directive('zlDragDrop', function(){
    return {

        controller      : function(){
        },
        scope           : {},
        controllerAs    : 'dragDropCtrl',
        bindToController: {
            drag: '=',
            drop: '&'
        },
        link            : function(scope, element){
            var el = element[0];

            if (scope.dragDropCtrl.drag){

                el.draggable = true;

                el.addEventListener(
                    'dragstart',
                    function(e){
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('Text', scope.dragDropCtrl.drag);
                        this.classList.add('drag');
                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragend',
                    function(e){
                        this.classList.remove('drag');
                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragover',
                    function(e){
                        e.dataTransfer.dropEffect = 'move';
                        if (e.preventDefault) e.preventDefault();
                        this.classList.add('over');
                        return false;
                    },
                    false
                );
            }

            if (scope.dragDropCtrl.drop){

                el.addEventListener(
                    'drop',
                    function(e){
                        if (e.stopPropagation) e.stopPropagation();
                        this.classList.remove('over');
                        scope.dragDropCtrl.drop({$data: e.dataTransfer.getData('Text'), $event: e});
                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragenter',
                    function(e){
                        this.classList.add('over');
                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragleave',
                    function(e){
                        this.classList.remove('over');
                        return false;
                    },
                    false
                );
            }
        }
    }
});

module.directive('zlTemplateCompiler', function($compile){
    return {
        restrict: 'E',
        link    : function(scope, tElement, tAttrs){
            var template = '<div style="display:inline;">' + tAttrs.template + '</div>';
            tElement.replaceWith($compile(template)(scope));
        }
    }

});

module.filter('zlColumnFilter', function(){
    return function(allColumns, columnList){
        return _.sortBy(_.reject(allColumns, function(col){
            return !_.includes(columnList, col.id);
        }), function(col){
            return columnList.indexOf(col.id);
        });
    }
});
