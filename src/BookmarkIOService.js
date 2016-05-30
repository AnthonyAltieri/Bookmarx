var db = require('./db.js');
var fs = require('fs');
var path = require('path');

function bookmarkToRowString(bookmark) {
  var username = bookmark['username'];
  var title = bookmark['title'];
  var url = bookmark['url'];
  var description = bookmark['description'];
  var star = bookmark['star'];
  var tag1 = bookmark['tag1'];
  var tag2 = bookmark['tag2'];
  var tag3 = bookmark['tag3'];
  var tag4 = bookmark['tag4'];
  var creationDateObject = bookmark['creationDate'];
  var creationDate = (creationDateObject.getYear() + 1900) + '-' +
    ((creationDateObject.getMonth().toString().length === 1) ? '0' + creationDateObject.getMonth()
    : creationDateObject.getMonth()) + '-' + ((creationDateObject.getDay().toString().length === 1)
    ? '0' + creationDateObject.getDay() : creationDateObject.getDay());
  var lastVisitObject = bookmark['lastVisit'];
  var lastVisit = (lastVisitObject.getYear() + 1900) + '-' +
    ((lastVisitObject.getMonth().toString().length === 1) ? '0' + lastVisitObject.getMonth()
      : lastVisitObject.getMonth()) + '-' + ((lastVisitObject.getDay().toString().length === 1)
      ? '0' + lastVisitObject.getDay() : lastVisitObject.getDay());
  var counter = bookmark['counter'];
  var folder = bookmark['folder'];
  var rowString = '';
  rowString += 'username=' + username + '&';
  rowString += 'title=' + title + '&';
  rowString += 'url=' + url + '&';
  rowString += 'description=' + url + '&';
  rowString += 'star=' + star + '&';
  rowString += 'tag1=' + tag1 + '&';
  rowString += 'tag2=' + tag2 + '&';
  rowString += 'tag3=' + tag3 + '&';
  rowString += 'tag4=' + tag4 + '&';
  rowString += 'creationDate=' + creationDate + '&';
  rowString += 'lastVisit=' + lastVisit + '&';
  rowString += 'counter=' + counter + '&';
  rowString += 'folder=' + folder + '\n';
  return rowString;
}

function rowStringToBookmark(rowString) {
  var bookmark = {};
  var keyvalues = rowString.split('&');
  for (var i = 0 ; i < keyvalues.length ; i++) {
    var pair = keyvalues[i];
    var split = pair.split('=');
    bookmark[split[0]] = split[1];
  }
  return bookmark;
}



/**
 * Exports a bookmark object to a text file
 * @param bookmark - A bookmark object
 */
module.exports.exportBookmark = function(username, title, callback) {
  db.init();
  console.log('username = ' + username + ' title = ' + title);
  var selectQueryString = "SELECT * FROM bookmark WHERE username = '" + username + "' AND "
    + "title = '" + title + "';";
  console.log('selectQueryString = ' + selectQueryString);
  db.query(selectQueryString, function(error, bookmarks) {
    if (error) throw error;
    console.log('bookmarks');
    console.log(bookmarks);
    var bookmark = bookmarks[0];
    var filename = bookmark.username + ' ' + title + ' export';
    console.log('bookmarkToRowString');
    console.log(bookmarkToRowString(bookmark));
    var toWrite = 'BOOKMARK:' + bookmarkToRowString(bookmark);
    console.log('toWrite = ' + toWrite);
    fs.writeFile(filename, toWrite, function(err) {
      if (err) {
        console.log('ERROR');
        console.log(err);
        return;
      }
      callback();
    });
  });
}

/**
 * Imports a bookmark file into the MySQL database
 * @param filename - the name of the file with the bookmark rowString
 */
module.exports.importBookmark = function(username, filename, callback) {
  console.log('inside importBookmark, filename = ' + filename);
  var pathToFile = __dirname + '/public/uploads/' + filename;
  fs.readFile(pathToFile, function(err, data) {
    if (err) {
      if (fs.existsSync(pathToFile)){
        fs.unlink(pathToFile);
      }
      throw err;
    }

    // Parse the data into an object
    var content = data.toString();
    var splitContent = content.split(':');
    // Check to see if this is a valid file
    if (splitContent.length != 2 || splitContent[0] != 'BOOKMARK') {
      console.error('ERROR: not a valid file!');
      callback();
      return;
    }
    var bookmark = rowStringToBookmark(splitContent[1].split('\n')[0]);
    console.log('bookmark');
    console.log(bookmark);

    // Initialize database and create query string
    db.init();
    console.log('bookmark.username = ' + bookmark.username);
    var selectQueryString = "SELECT * FROM user WHERE username = '" + bookmark.username + "';";
    // Query
    db.query(selectQueryString, function(err, rows) {
      if (err){
        if (fs.existsSync(pathToFile)) {
          fs.unlink(pathToFile);
        }
        throw err;
      }
      if (rows === null) {
        console.error('ERROR: INVALID FILE, There is no user with username ' + bookmark.username);
        return;
      }
      // The user exists, so delete any other bookmark with the same title that this user has stored
      var deleteQueryString = "Delete FROM bookmark WHERE username = '" + bookmark.username + "' AND "
        + "title = '" + bookmark.title + "';";
      console.log('deleteQueryString = ' + deleteQueryString);
      db.query(deleteQueryString, function(err, result) {
        if (err) {
          if (fs.existsSync(pathToFile)) {
            fs.unlink(pathToFile);
          }
          throw err;
        }
        console.log('Deleted ' + result.affectedRows + 'rows');

        var insertQueryString = 'INSERT INTO bookmark (username, title, url, description, star, tag1, tag2, tag3, '
          + 'tag4' + ', creationDate, lastVisit, counter, folder) VALUES (';
        insertQueryString += "'" + bookmark.username + "',";
        insertQueryString += " '" + bookmark.title + "',";
        insertQueryString += " '" + bookmark.url + "',";
        insertQueryString += " '" + bookmark.description + "',";
        insertQueryString += " '" + bookmark.star + "',";
        insertQueryString += " '" + bookmark.tag1 + "',";
        insertQueryString += " '" + bookmark.tag2 + "',";
        insertQueryString += " '" + bookmark.tag3 + "',";
        insertQueryString += " '" + bookmark.tag4 + "',";
        insertQueryString += " '" + bookmark.creationDate + "',";
        insertQueryString += " '" + bookmark.lastVisit + "',";
        insertQueryString += " '" + bookmark.counter + "',";
        insertQueryString += " '" + bookmark.folder + "');";
        db.query(insertQueryString, function(err, result) {
          if (err) {
            if (fs.existsSync(pathToFile)) {
              fs.unlink(pathToFile);
            }
            throw err;
          }
          if (result) {
            console.log('Inserted ID: ' + result.insertId);
          }
          if (fs.existsSync(pathToFile)) {
            fs.unlink(pathToFile);
          }
        });
      });
    });
  })
};

module.exports.exportFolder = function(username, folder, callback) {
  db.init();
  if (!folder || folder === '') {
    callback();
  }
  console.log('in exportFolder()');
  var selectQueryString = "SELECT * FROM bookmark WHERE username = '" + username + "' AND "
    + "folder = '" + folder + "';";
  console.log('selectQueryString = ' + selectQueryString);
  db.query(selectQueryString, function(err, rows) {
    if (err) {
      console.log('err');
      console.log(err);
      throw err;
    }
    if (rows.length === 0) {
      console.error('ERROR: there is nothing in this folder!');
      return;
    }
    var filename = username + folder + ' export';
    var pathToFile = __dirname + '/public/exports/' + filename;
    console.log('pathToFile = ' + pathToFile);
    // Delete file if it already exists
    if (fs.existsSync(pathToFile)) {
      fs.unlinkSync(pathToFile);
    }
    fs.writeFileSync(pathToFile, 'FOLDER:[' + folder + ']:');
    console.log('about to write file at path = ' + pathToFile);
    for (var i = 0 ; i < rows.length ; i++) {
      var bookmark = rows[i];
      fs.appendFileSync(pathToFile, bookmarkToRowString(bookmark));
    }
    console.log('done writing the file');
    callback();
  });
};

module.exports.importFolder = function(username, filename, callback, errorCallback) {
  db.init();
  // check to see if the user exists
  var selectQueryString = "SELECT * FROM user WHERE username = '" + username + "';";
  var pathToFile = __dirname + '/public/uploads/' + filename;
  console.log('in importFolder');
  console.log('pathToFile = ' + pathToFile);
  console.log('about to query datbase with qs: ' + selectQueryString);
  db.query(selectQueryString, function(err, rows) {
    if (err) {
      if (fs.existsSync(pathToFile)) {
        fs.unlink(pathToFile);
      }
      console.error('ERROR: ' + err.toSTring());
      return;
    }
    if (rows.length === 0) {
      if (fs.existsSync(pathToFile)) {
        fs.unlink(pathToFile);
      }
      console.error('ERROR: this user does not exist');
      errorCallback();
      return;
    }
    var content = fs.readFileSync(pathToFile).toString();
    var splitContent = content.split(':');
    if (splitContent.length != 3 || splitContent[0] != 'FOLDER') {
      console.error('Error: this is an invalid file');
      if (fs.existsSync(pathToFile)) {
        fs.unlinkSync(pathToFile);
      }
      return;
    }
    var folderName = splitContent[1].split('[')[1].split(']')[0];
    if (typeof folderName === 'undefined') {
      console.error('ERROR: file incorrect');
      if (fs.existsSync(pathToFile)) {
        fs.unlinkSync(pathToFile);
      }
      return;
    }
    var bookmarkRowStringsWithNewlines = splitContent[2];
    var bookmarkRowStrings = bookmarkRowStringsWithNewlines.split('\n');
    var counter = 0;
    for (var i = 0 ; i < bookmarkRowStrings.length - 1 ; i++) {
      var bookmark = rowStringToBookmark(bookmarkRowStrings[i]);
      var deleteQueryString = "DELETE FROM bookmark WHERE username = '" + username + "' AND "
        + "title = '" + bookmark.title + "';";
      console.log('deleting row with title = ' + bookmark.title);
      db.query(deleteQueryString, function(err, result) {
        if (err){
          console.error('ERROR: ' + err.toSTring());
          return;
        }
        counter++;
        if (result) console.log('Deleted ' + result.affectedRows + 'rows');
        if (counter === bookmarkRowStrings.length - 1) {
          var addFolderQuery = "INSERT INTO folder (username, name) VALUES ('" + username + "', '" + folderName
            + "');";
          console.log('addFolderQuery: ' + addFolderQuery);
          db.query(addFolderQuery, function(err, result) {
            if (err) {
              console.log('err');
              console.log(err);
              console.error('ERROR: failed to add folder');
              return;
            }
          });
          for (var x = 0 ; x < bookmarkRowStrings.length - 1 ; x++) {
            bookmark = rowStringToBookmark(bookmarkRowStrings[x]);
            console.log('bookmark about to be inserted');
            console.log(bookmark);
            var insertQueryString = 'INSERT INTO bookmark (username, title, url, description, star, tag1, tag2, tag3, '
              + 'tag4' + ', creationDate, lastVisit, counter, folder) VALUES (';
            insertQueryString += "'" + bookmark.username + "',";
            insertQueryString += " '" + bookmark.title + "',";
            insertQueryString += " '" + bookmark.url + "',";
            insertQueryString += " '" + bookmark.description + "',";
            insertQueryString += " '" + bookmark.star + "',";
            insertQueryString += " '" + bookmark.tag1 + "',";
            insertQueryString += " '" + bookmark.tag2 + "',";
            insertQueryString += " '" + bookmark.tag3 + "',";
            insertQueryString += " '" + bookmark.tag4 + "',";
            insertQueryString += " '" + bookmark.creationDate + "',";
            insertQueryString += " '" + bookmark.lastVisit + "',";
            insertQueryString += " '" + bookmark.counter + "',";
            insertQueryString += " '" + bookmark.folder + "');";
            console.log('insertQueryString: ' + insertQueryString);
            db.query(insertQueryString, function(err, result) {
              if (err){
                if (fs.existsSync(pathToFile)) {
                  fs.unlinkSync(pathToFile);
                }
                console.log('ERROR: ' + err.toString());
                callback();
                return;
              }
              if (i === bookmarkRowStrings.length - 1) {
                callback();
              }
            });
          }
        }
      });
    }
  })
};
