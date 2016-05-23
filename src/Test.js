'use strict';

var QueryService = require('./QueryService.js');
var db = require('./db.js');

var qs = new QueryService(db);

console.log('Insert TEST');
qs.insert('user', ['name', 'username'], ['trump', 'imbad'], function(error, rows) {
  console.log('error');
  console.log(error);
  console.log('rows');
  console.log(JSON.stringify(rows));
});


//console.log('selct TEST');
//qs.select(['*'], 'user', null, function(error, rows) {
//  console.log('error');
//  console.log(error);
//  console.log('rows');
//  console.log(rows);
//});
//
//console.log('Delete TEST');
//qs.delete('user', [['name', '=', 'trump'], 'and', ['username', '=', 'imbad']], function(error, rows) {
//  console.log('error');
//  console.log(error);
//  console.log('rows');
//  console.log(JSON.stringify(rows));
//});
