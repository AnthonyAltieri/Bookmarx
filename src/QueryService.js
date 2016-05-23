'use strict';

const INSERT = 'INSERT';
const SELECT = 'SELECT';
const DELETE = 'DELETE';
const AND = 'AND';
const OR = 'OR';

module.exports = class QueryService {
  /**
   * The constructor to create a Query object which acts as a decorator
   * between you and the MySQL database that we have set up in db.js
   * @param db - A MYSQL database instance from db.js
   */
  constructor(database) {
    if(typeof database === 'undefined' || typeof database.query === 'undefined'){
      throw 'Error: Invalid Database';
    }
    this._db = database;
    this._db.init();
  }

  /**
   * Performs a select on a MYSQL database
   * @param columns - An Array of strings that are the columns that will be selected
   * @param tableName - A string that is the table name
   * @param filters - An array starting with a 3 tupule of strings in an array that is [columnName, operator, value]
   *                  and then a boolean value, either 'and' or 'or', before another tupule. Any superfluous boolean
   *                  operators will be ignored
   * @param callback - The callback that is called when the query is completed
   */
  select(columns, tableName, filters, callback) {
    if (typeof columns === 'undefined') throw 'Error: Invalid column';
    if (typeof tableName === 'undefined') throw 'Error: Invalid table name(s)';
    if (typeof filters === 'undefined') throw 'Error: Invalid filter';
    let queryString = '';
    queryString += SELECT;
    queryString += ' ';
    // add column(s)
    for (let i = 0 ; i < columns.length ; i++) {
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
      for (let i = 0 ; i < filters.length ; i++) {
        // Every odd index will have a 3 tupule
        let isTupule = !(i % 2);
        if (isTupule) {
          const filter = filters[i];
          console.log(filter);

          queryString += filter[0];
          queryString += ' ';
          queryString += filter[1];
          queryString += ' ';
          queryString += ("'" + filter[2] + "'");
        } else {
          // Never end with a boolean operator
          if (i != filters.length - 1){
            let booleanOperator = filters[i];
            queryString += (' ' + booleanOperator + ' ');
          }
        }
      }
    }
    queryString += ';';
    console.log('select qs: ' + queryString);
    this._db.query(queryString, callback)
  }

  delete(tableName, filters, callback) {
    if (typeof tableName === 'undefined') throw 'Error: Invalid table name(s)';
    if (typeof filters === 'undefined') throw 'Error: Invalid specifications';
    let queryString = 'DELETE FROM';
    queryString += ' ';
    queryString += tableName;
    queryString += ' ';
    queryString += 'WHERE';
    queryString += ' ';
    for (let i = 0 ; i < filters.length ; i++) {
      // Every odd index will have a 3 tupule
      let isTupule = !(i % 2);
      if (isTupule) {
        const filter = filters[i];
        console.log(filter);

        queryString += filter[0];
        queryString += ' ';
        queryString += filter[1];
        queryString += ' ';
        queryString += ("'" + filter[2] + "'");
      } else {
        // Never end with a boolean operator
        if (i != filters.length - 1){
          let booleanOperator = filters[i];
          queryString += (' ' + booleanOperator + ' ');
        }
      }
    }
    queryString += ';';
    console.log('delete qs: ' + queryString);
    this._db.query(queryString, callback);
  }

  insert(tableName, columns, values, callback) {
    if (typeof tableName === 'undefined') throw 'Error: Invalid table name(s)';
    if (typeof columns === 'undefined') throw 'Error: Invalid columns';
    if (typeof values === 'undefined') throw 'Error: Invalid values';
    let queryString = 'INSERT INTO';
    queryString += ' ';
    queryString += tableName;
    queryString += ' ';
    queryString += '(';
    for (let i = 0 ; i < columns.length ; i++) {
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
    for (let i = 0 ; i < values.length ; i++) {
      queryString += ("'" + values[i] + "'");
      if (i < values.length - 1) {
        queryString += ' ';
        queryString += ', ';
      }
    }
    queryString += ')';
    queryString += ';';
    console.log('insert qs: ' + queryString);
    this._db.query(queryString, callback);
  }

  update(tableName, columnvalues, filters, callback) {
    let queryString = 'UPDATE';
    queryString += ' ';
    queryString += tableName;
    queryString += ' ';
    queryString += 'SET';
    queryString += ' ';
    for (let i = 0 ; i < columnvalues.length ; i++) {
      // Every odd index will have a 3 tupule
      let isTupule = i % 2;
      if (isTupule) {
        const columnvalue = columnvalues[i];
        queryString += columnvalue[0];
        queryString += ' ';
        queryString += columnvalue[1];
        queryString += ' ';
        queryString += ("'" + columnvalue[2] + "'");
      } else {
        // Never end with a boolean operator
        if (i != columnvalues.length - 1){
          let booleanOperator = columnvalues[i];
          queryString += (' ' + booleanOperator + ' ');
        }
      }
    }
    queryString += ' ';
    queryString += 'WHERE';
    queryString += ' ';
    for (let i = 0 ; i < filters.length ; i++) {
      // Every odd index will have a 3 tupule
      let isTupule = i % 2;
      if (isTupule) {
        const filter = filters[i];
        queryString += filter[0];
        queryString += ' ';
        queryString += fiter[1];
        queryString += ' ';
        queryString += ("'" + filter[2] + "'");
      } else {
        // Never end with a boolean operator
        if (i != filters.length - 1){
          let booleanOperator = filters[i];
          queryString += (' ' + booleanOperator + ' ');
        }
      }
    }
    console.log('Insert qs: ' + queryString);
    this._db.query(querystring, callback);
  }



  /**
   * Static helper method to check an object against a type
   * @param object - the object being checked
   * @param type - the type that the object is being checked for
   * @returns - true if the item matches the type and false otherwise
   */
  static typeCheck(object, type) {
    return (typeof object === type);
  }

  /**
   * Static helper method to check if an object is undefined
   * @param object - the object being checked
   * @returns - true if object is undefined and false otherwise
   */
  static isUndefined(object) {
    return this.typeCheck(object, 'undefined')
  }
}



