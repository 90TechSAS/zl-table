# Angular zlTable, play now with tables

This module allows you to display tables and play with multiple datasources and filters.

[Demo](http://90techsas.github.io/zl-table/)

## Requirements
- AngularJS 1.3

## Features
- Line selection (with multi-select and alt key support)
- Live columns adding, deleting, and reordering via drag and drop
- Grid mode display

## Usage
Directly from [Bower](http://bower.io/).

 **Care with current version! Still WIP...**

```sh
bower install zl-table
```

```html
<table zl-table="myData" 
    update="updateFunction($pagination)" 
    selected-data="selected"
    zl-pagination="pagination" 
    columns="columns" 
    grid-template="gridTemplate" 
    grid-mode="gridMode"
    zl-row-click="click($event, $elt)"
    >
        <thead>
        <tr>
            <th id="favoriteFruit">Favorite Fruit</th>
            <th id="greeting">Greeting</th>
            <th id="friends">Friends</th>
            <th id="tags">Tags</th>
           
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>{{elt.favoriteFruit}}</td>
            <td>{{elt.greeting}}</td>
            <td>{{elt.friends.length}}</td>
            <td>
                <span ng-repeat="tag in elt.tags track by $index" class="label label-info" style="margin:0 1% 0 1%">
                    {{tag}}
                 </span>
            </td>
           
        </tr>
        </tbody>
</table>
```

## Parameters
- **zl-table**
Main attribute. Contains the data you wish to display.
- **update**
Function to be called when pagination changes. This function is responsible for the data updates
Param: 
	**$pagination**: the pagination object you passed to the directive
- **zl-pagination**
two-way bound object to communicate the pagination to the directive.
	* **currentPage** (int) 0 indexed
	* **perPage** (int) number of elements per page
	* **totalElements** (int) the update function is responsible for updating the totalElements count since the directive has no way to figure it out
- **columns**
A sorted array containing the columns you want to display in order. Columns are identified by the id you have set in the <th> elements. This array is two-way bound so that if the user drags and drops a column, you will be notified.
- **selected-data**
An array containing the ids of the elements the user has selected. Two-way bound, so you can pre-select data. And get the selected data anytime.
- **selection-changed**
Callback function called when the user selects an element.
Params: $selectedData, the selected-data array
- **grid-mode**
boolean. Should the table display in grid mode instead
- **grid-template**
string. The id of the angular template used for displaying the grid.
- **row-click-fn**
Callback for when the user clicks on a row.
- **id-field**
The key of the field to be used as an id for the selection of elements.
    
 
            
    


