'use strict';
var express = require('express');
var path = require('path');
var router = express.Router();
var db = require('./db.js');
var QueryService = require('./QueryService.js');
var utilService = require('./UtilService.js');
var qs = new QueryService(db, utilService);
var cryptService = require('./CryptService.js');

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// API
router.post('/login', function(req, res) {
  // if (req.session) req.session.destroy();

  utilService.checkUndefined(req.body);
  utilService.checkUndefined(req.body.username);
  utilService.checkUndefined(req.body.password);
  
  var cryptedPassword = cryptService.hash(req.body.username, req.body.password);
  var filter = [];
  filter.push(['username', '=', req.body.username]);
  filter.push('and');
  filter.push(['password', '=', cryptedPassword]);
  qs.select(['*'], ['user'], filter, function(err, rows) {
    if (err) throw err;

    // If there was not just 1 person found, this attempt has been unsuccessful
    if (rows.length != 1) {
      res.send({
        user: {},
        msg: "Couldn't find one user",
        success: false
      })
    } else {
      // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      // res.header('Expires', '-1');
      // res.header('Pragma', 'no-cache');
      req.session.username = req.body.username;
      res.send({
        user: rows[0],
        msg: "Found the user",
        success: true
      })
    }
  });
});

router.post('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
})

router.post('/signUp', function(req, res) {
  // if (req.session) req.session.destroy();
  
  utilService.checkUndefined(req.body);
  var username = req.body.username;
  utilService.checkUndefined(username);
  var password = req.body.password;
  utilService.checkUndefined(password);
  var name = req.body.name;
  utilService.checkUndefined(name);
  var lastname = req.body.lastname;
  utilService.checkUndefined(lastname);

  var filter = [];
  filter.push(['username', '=', req.body.username]);

  console.log('about to hash');
  var cryptedPassword = cryptService.hash(req.body.username, req.body.password);
  console.log('cryptedPassword: ' + cryptedPassword);

  qs.select(['*'], ['user'], filter, function(err, rows) {
    if (err) throw rows;
    // This username is taken
    if (rows.length > 0) {
      res.send({
        msg: 'This username is taken',
        success: true
      })
    } else {
      // username is available
      var columns = ['username', 'password', 'name', 'lastname'];
      var values = [username, cryptedPassword, name, lastname];
      qs.insert('user', columns, values, function(err, rows) {
        if (err) throw err;
        req.user.session = req.body.username;
        res.send({
          msg: ('Created account for user: ' + username),
          success: true,
          username: username
        })

      })
    }
  })
});

router.post('/folder/get', function(req, res) {

  if (!req.session.username) {
    res.redirect("/");
  }

  utilService.checkUndefined(req.body);
  var username = req.body.username;
  utilService.checkUndefined(username);

  var filter = [];
  filter.push(['username', '=', username]);

  qs.select(['*'], ['folder'], filter, function(err, rows) {
    if (err) throw err;

    console.log('just got the folders for user: ' + username);
    console.log(rows);

    var data = { rows: rows };
    // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    //   res.header('Expires', '-1');
    //   res.header('Pragma', 'no-cache');
    res.send(data);
  });
});

router.post('/user/bookmarks/get', function(req, res) {
  if (!req.session.username) {
    res.redirect("/");
  }

  utilService.checkUndefined(req.body);
  var username = req.body.username;
  utilService.checkUndefined(username);

  var filter = [];
  filter.push(['username', '=', username]);

  qs.select(['*'], ['bookmark'], filter, function(err, rows) {
    if (err) throw err;

    console.log('just got the bookmarks for user: ' + username);
    console.log(rows);

    var data = { rows: rows };
    // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    //   res.header('Expires', '-1');
    //   res.header('Pragma', 'no-cache');
    res.send(data);
  });
});

router.post('/user/bookmarks/add', function(req, res) {
  if (!req.session.username) {
    res.redirect("/");
  }

  utilService.checkUndefined(req.body);
  var username = req.body.username;
  utilService.checkUndefined(username);
  var bookmark = req.body.bookmark;
  utilService.checkUndefined(bookmark);

  // If a bookmark with this title already exists for this user
  // return null
  var filter = [];
  filter.push(['username', '=', username]);
  filter.push('and');
  filter.push(['title', '=', bookmark.title]);
  qs.select(['*'], 'bookmark', filter, function(err, rows) {
    if (err) throw err;
    console.log('rows select');
    console.log(rows);
    if (rows.length > 0) {
      // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      // res.header('Expires', '-1');
      // res.header('Pragma', 'no-cache');
      res.send(null);
    } else {
      var columns = ['username', 'title', 'url', 'description', 'star', 'tag1', 'tag2',
                    'tag3', 'tag4', 'creationDate', 'lastVisit', 'counter', 'folder'];

      var values = [username, bookmark.title, bookmark.url, bookmark.description, 0];

      values.push(bookmark.tag1);
      values.push(bookmark.tag2);
      values.push(bookmark.tag3);
      values.push(bookmark.tag4);

      var date = new Date();
      var datestring = '';
      datestring += ((date.getYear() + 1900) + '-');
      datestring += (date.getMonth() + '-');
      datestring += (date.getDay());

      values.push(datestring); // creationDate
      values.push(datestring); // lastVisit
      values.push(0); // counter
      values.push(bookmark.folder);

      console.log('bookmark');
      console.log(bookmark);

      qs.insert('bookmark', columns, values, function(err, result) {
        if (err) throw err;
        if (result.affectedRows === 1) {
          // Everything went according to plan
          var data = {bookmark: bookmark};
          console.log('trying to send data bookmark add');
          console.log(data);
          res.send(data);
        } else {
          console.log('something went wrong affectedRows should have been 1');
        }
      });

    }
  })

});

router.post('/folder/add', function(req, res) {
  if (!req.session.username) {
    res.redirect("/");
  }

  var username = req.body.username;
  var name = req.body.name;

  var columns = ['name', 'username'];
  var values = [name, username];
  qs.insert('folder', columns, values, function(err, result) {
    if (err) throw err;
    if (result.affectedRows === 1) {
      // Everything went according to plan
      var folder = {
        name: name,
        username: username,
        bookmarks: [],
      };
      var data = {folder: folder};
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      res.send(data);
    } else {
      console.log('something went wrong affectedRows should have been 1');
    }

  });

});

router.post('/folder/delete', function(req, res) {
  if (!req.session.username) {
    res.redirect("/");
  }

  utilService.checkUndefined(req.body);
  utilService.checkUndefined(req.body.username);
  utilService.checkUndefined(req.body.name);
  var username = req.body.username;
  var name = req.body.name;

  var filter = [];
  filter.push(['username', '=', username]);
  filter.push('and');
  filter.push(['name', '=', name]);
  qs.delete('folder', filter, function(err, result) {
    if (err) throw err;
    if (result.affectedRows === 1) {
      // Everything went according to plan
      filter = [];
      filter.push(['username', '=', username]);
      filter.push('and');
      filter.push(['folder', '=', name]);
      qs.delete('bookmark', filter, function(err, result) {
        if (err) throw err;
        var folderDeleted = {
          name: name,
          username: username
        };
        var data = {folder: folderDeleted};
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
        res.send(data);
      });
    } else {
      console.log('something went wrong there should have only been'
        + 'one folder deleted');
    }

  })

});

router.post('/bookmark/delete', function(req, res) {
  if (!req.session.username) {
    res.redirect("/");
  }

  utilService.checkUndefined(req.body);
  utilService.checkUndefined(req.body.bookmark);
  utilService.checkUndefined(req.body.username);
  var bookmark = req.body.bookmark;
  var username = req.body.username;

  var filter = [];
  filter.push(['username', '=', username]);
  filter.push('and');
  filter.push(['title', '=', bookmark.title]);
  qs.delete('bookmark', filter, function(err, result) {
    if (err) throw err;

    if (result.affectedRows === 1) {
      // Everything went according to plan

      var data = {bookmark: bookmark};
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      res.send(data);
    }
  })

});

router.post('/bookmark/star', function(req, res) {
  if (!req.session.username) {
    res.redirect("/");
  }

  utilService.checkUndefined(req.body);
  utilService.checkUndefined(req.body.bookmark);
  utilService.checkUndefined(req.body.username);
  var bookmark = req.body.bookmark;
  var username = req.body.username;

  var columnvalues = [];
  console.log('in bookmark/star');
  console.log(bookmark);
  if (bookmark.star === '1') {
    columnvalues.push(['star', '=', '0'])
  } else {
    columnvalues.push(['star', '=', '1'])
  }
  var filter = [];
  console.log('columnvalues');
  console.log(columnvalues);
  filter.push(['username', '=', username]);
  filter.push('and');
  filter.push(['title', '=', bookmark.title]);
  qs.update('bookmark', columnvalues, filter, function(err, result) {
    if (err) throw err;

    if (result.affectedRows === 1) {
      // Everything went according to plan

      var data = {bookmark: bookmark};
      // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      // res.header('Expires', '-1');
      // res.header('Pragma', 'no-cache');
      res.send(data);
    }
  });
});

router.post('/cookie/enableit', function(req, res) {
  var cookiesEnabled = req.body.cookiesEnabled;
  if (cookiesEnabled) {
    // Do nothing
  } else {
    res.sendFile(path.join(__dirname, '/static/templates/EnableCookies.html'))
  }

});





module.exports = router;

