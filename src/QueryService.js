'use strict';
var INSERT = 'INSERT';
var SELECT = 'SELECT';
var DELETE = 'DELETE';
var AND = 'AND';
var OR = 'OR';

module.exports = function QueryService(database, utilService) {
  var qs = {};
  qs._db = database;
  qs._db.init();
  qs._utilService = utilService;
  qs.select = select;
  qs.insert = insert;
  qs.delete = deleteQuery;
  qs.update = update;


  /**
   * Performs a select on a MYSQL database
   * @param columns - An Array of strings that are the columns that will be selected
   * @param tableName - A string that is the table name
   * @param filters - An array starting with a 3 tupule of strings in an array that is [columnName, operator, value]
   *                  and then a boolean value, either 'and' or 'or', before another tupule. Any superfluous boolean
   *                  operators will be ignored
   * @param callback - The callback that is called when the query is compvared
   */
  function select(columns, tableName, filters, callback) {
    if (typeof columns === 'undefined') throw 'Error: Invalid column';
    if (typeof tableName === 'undefined') throw 'Error: Invalid table name(s)';
    if (typeof filters === 'undefined') throw 'Error: Invalid filter';
    var queryString = '';
    queryString += SELECT;
    queryString += ' ';
    // add column(s)
    for (var i = 0 ; i < columns.length ; i++) {
      queryString += columns[i];
      // Prepare for more variables if needed
      if (i < columns.length - 1) {
        queryString += ', ';
      }
    }
    queryString += ' ';
    // specify table
    queryString += 'FROM ' + tableName;
    if (filters != null) {
      queryString += ' WHERE ';
      for (var i = 0 ; i < filters.length ; i++) {
        // Every odd index will have a 3 tupule
        var isTupule = !(i % 2);
        if (isTupule) {
          var filter = filters[i];

          queryString += filter[0];
          queryString += ' ';
          queryString += filter[1];
          queryString += ' ';
          queryString += ("'" + filter[2] + "'");
        } else {
          // Never end with a boolean operator
          if (i != filters.length - 1){
            var booleanOperator = filters[i];
            queryString += (' ' + booleanOperator + ' ');
          }
        }
      }
    }
    queryString += ';';
    this._db.query(queryString, callback)
  }

  function deleteQuery(tableName, filters, callback) {
    if (typeof tableName === 'undefined') throw 'Error: Invalid table name(s)';
    if (typeof filters === 'undefined') throw 'Error: Invalid specifications';
    var queryString = 'DELETE FROM';
    queryString += ' ';
    queryString += tableName;
    queryString += ' ';
    queryString += 'WHERE';
    queryString += ' ';
    for (var i = 0 ; i < filters.length ; i++) {
      // Every odd index will have a 3 tupule
      var isTupule = !(i % 2);
      if (isTupule) {
        var filter = filters[i];

        queryString += filter[0];
        queryString += ' ';
        queryString += filter[1];
        queryString += ' ';
        queryString += ("'" + filter[2] + "'");
      } else {
        // Never end with a boolean operator
        if (i != filters.length - 1){
          var booleanOperator = filters[i];
          queryString += (' ' + booleanOperator + ' ');
        }
      }
    }
    queryString += ';';
    this._db.query(queryString, callback);
  }

  function insert(tableName, columns, values, callback) {
    if (typeof tableName === 'undefined') throw 'Error: Invalid table name(s)';
    if (typeof columns === 'undefined') throw 'Error: Invalid columns';
    if (typeof values === 'undefined') throw 'Error: Invalid values';
    var queryString = 'INSERT INTO';
    queryString += ' ';
    queryString += tableName;
    queryString += ' ';
    queryString += '(';
    for (var i = 0 ; i < columns.length ; i++) {
      queryString += columns[i];
      if (i < columns.length - 1) {
        queryString += ' ';
        queryString += ',';
      }
    }
    queryString += ')';
    queryString += ' ';
    queryString += 'VALUES';
    queryString += ' ';
    queryString += '(';
    for (var i = 0 ; i < values.length ; i++) {
      queryString += ("'" + values[i] + "'");
      if (i < values.length - 1) {
        queryString += ' ';
        queryString += ', ';
      }
    }
    queryString += ')';
    queryString += ';';
    this._db.query(queryString, callback);
  }

  function update(tableName, columnvalues, filters, callback) {
    var queryString = 'UPDATE';
    queryString += ' ';
    queryString += tableName;
    queryString += ' ';
    queryString += 'SET';
    queryString += ' ';
    for (var i = 0 ; i < columnvalues.length ; i++) {
      var columnvalue = columnvalues[i];

      queryString += columnvalue[0];
      queryString += ' ';
      queryString += columnvalue[1];
      queryString += ' ';
      queryString += ("'" + columnvalue[2] + "'");

      if (i < columnvalues.length - 1) {
        // not on last iteration
        queryString += ' , '
      }

    }
    queryString += ' ';
    queryString += 'WHERE';
    queryString += ' ';
    for (var i = 0 ; i < filters.length ; i++) {
      // Every odd index will have a 3 tupule
      var isTupule = !(i % 2);
      if (isTupule) {
        var filter = filters[i];

        queryString += filter[0];
        queryString += ' ';
        queryString += filter[1];
        queryString += ' ';
        queryString += ("'" + filter[2] + "'");
      } else {
        // Never end with a boolean operator
        if (i != filters.length - 1){
          var booleanOperator = filters[i];
          queryString += (' ' + booleanOperator + ' ');
        }
      }
    }
    queryString += ';';
    this._db.query(queryString, callback);
  }

  return qs;

}
