'use strict';
var express = require('express');
var path = require('path');
var router = express.Router();
var db = require('./db.js');
var QueryService = require('./QueryService.js');
var utilService = require('./UtilService.js');
var qs = new QueryService(db, utilService);
var cryptService = require('./CryptService.js');
var BookmarkIOService = require('./BookmarkIOService.js');
var fs = require('fs');
var multer = require('multer');
var nodemailer = require('nodemailer');
const crypto = require('crypto');
var upload = multer({
  dest: './public/uploads/'
}).single('filename');

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

router.get('/forgot',function(req,res){
  res.sendFile(path.join(__dirname, '/static/templates/forgot.html'));
});

router.get('/reset', function(req,res){
  res.sendFile(path.join(__dirname, '/static/templates/reset.html'));
});

// API
router.post('/login', function(req, res) {
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
      res.cookie('username', req.session.username, {maxAge: 9000000 ,httpOnly: false});

      // Set persistent cookie for duration of user-agent
      req.session.cookie.exires = false;

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
  res.send({error:true});
});

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
        req.session.username = req.body.username;
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
    res.send({error:true});
    return;
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
    res.send(data);
  });
});

router.post('/user/bookmarks/get', function(req, res) {
  if (!req.session.username) {
    res.send({error:true});
    return;
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
    res.send({error:true});
    return;
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
      res.send(null);
      return;
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
      datestring += (date.getDate());

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
    res.send({error:true});
    return;
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
  //if (!req.session.username) {
  //  res.redirect("/");
  //}

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
  //if (!req.session.username) {
  //  res.send({error: true});
  //}

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
    res.send({error: true})
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
  console.log('cookiesEnabled: ' + cookiesEnabled);
  if (cookiesEnabled) {
    // Do nothing
  } else {
    // TODO: make this work
    res.sendFile(__dirname + '/static/templates/EnableCookies.html');
  }

});

router.post('/bookmark/use', function(req, res) {
  if (!req.session.username) {
    res.send({error: true})
  }
  var bookmark = req.body.bookmark;
  var username = req.session.username;
  var title = bookmark.title;
  var count = parseInt(bookmark.counter);
  console.log('count: ' + count);
  var newCount = (count + 1) + '';

  // Update bookmarks counter
  bookmark.counter = newCount;
  console.log('newCount: ' + newCount);


  var date = new Date();
  var dateString = (date.getYear() + 1900) + '-' + date.getMonth() + '-' + date.getDate();
  bookmark.lastVisit = dateString;


  var columnvalues = [];
  columnvalues.push(['counter', '=', newCount]);
  columnvalues.push(['lastVisit', '=', dateString]);

  var filters = [];
  filters.push(['username', '=', username]);
  filters.push('and');
  filters.push(['title', '=', title]);


  qs.update('bookmark', columnvalues, filters, function(err, result) {
    if (err) throw err;

    if (result.affectedRows === 1) {
      // Everything went according to plan

      var data = {
        bookmark: bookmark
      };
      res.send(data);
    }
  })


});

router.post('/bookmark/export', function(req, res) {
  if (!req.session) {
    //console.error('ERROR: No session');
    return;
  }
  var title = req.body.title;
  var username = req.session.username;
  BookmarkIOService.exportBookmark(username, title, function() {
    var filename = username + ' ' + title + ' export';
    console.log('filename : ' + filename);
    if (fs.existsSync(filename)) {
      console.log('it exists');
      res.sendFile(__dirname + '/' + filename)
      fs.unlinkSync(filename);
    }
    res.redirect('/#/dashboard');
  });
});

router.post('/bookmark/import', function(req, res) {
  upload(req, res, function(err) {
    if (err) throw err;
    if (!req.file) {
      res.redirect('/#/dashboard');
      return;
    }
    if (!req.session || !req.session.username) {
      res.redirect('/#/login');
      return;
    }
    var filename = req.file.filename;
    var username = req.session.username;
    BookmarkIOService.importBookmark(username, filename, function() {
      res.redirect('/#/dashboard');

    });
  });
  res.redirect('/#/dashboard');


});

router.post('/folder/export', function(req, res) {
  if (!req.session || !req.session.username) {
    //console.error('ERROR: No session');
    return;
  }
  var username = req.session.username;
  var name = req.body.name;
  var filename = username + name + ' export';
  var path = __dirname + '/public/exports/' + filename;
  BookmarkIOService.exportFolder(username, name, function() {
    //console.log('isValidFolder : ' + validFolder);
    //if (validFolder) {
      console.log('about to check if it exists');
      if (fs.existsSync(path)) {
        console.log('it does exist, about to send');
        res.sendFile(path);
        console.log('should have sended')
        console.log('unliked it')
      }
      //res.redirect('/#/dashboard');
    //fs.unlinkSync(path);
    //}
  });
  function del() {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);

    }
  }

});

router.post('/folder/import', function(req, res) {
  upload(req, res, function(err) {
    if (err) throw err;
    if (!req.session || !req.session.username || !req.file) {
      res.redirect('/#/dashboard');
      return;
    }
    var filename = req.file.filename;
    var username = req.session.username;
    console.log('filename');
    console.log(filename);
    BookmarkIOService.importFolder(username, filename, function() {
      if (fs.existsSync(path.join(__dirname, 'public/uploads/' + filename))) {
        fs.unlinkSync(path.join(__dirname, 'public/uploads/' + filename));
      }
      res.redirect('/#/dashboard');

    });
  });

});


router.post('/session/check', function(req, res) {
  if (req.body.username && !req.session.username) {
    req.session.username = req.body.username;
  } else if (!req.body.username) {
    res.send({shouldLogOut: true});
  } else {
    // do nothing
  }
});

router.post('/bookmark/update', function(req, res) {
  if (!req.session) {
    // TODO: something meaningful here with session management
    return;
  }
  var bookmark = req.body.bookmark;
  var username = req.session.username;

  var data = {};
  // Check to see if this title is taken
  var filter = [];
  filter.push(['username', '=', username]);
  filter.push('and');
  filter.push(['title', '=',  bookmark.title]);
  qs.select(['*'], 'bookmark', filter, function(err, rows) {
    if (err) throw err;
    if (rows.length > 0 && bookmark.title != bookmark.oldTitle) {
      res.send(null);
      return;
    } else {
      if (!bookmark.title || bookmark.title.trim('').length === 0) {
        res.send(null);
        return;
      }
      var columnvalues = [];
      columnvalues.push(['title', '=', bookmark.title]);
      if (bookmark.url && bookmark.url != 'undefined') {
        columnvalues.push(['url', '=', bookmark.url]);
      }
      if (bookmark.description) {
        columnvalues.push(['description', '=', bookmark.description]);
      }
      if (isValidTag(bookmark.tag1)) {
        columnvalues.push(['tag1', '=', bookmark.tag1]);
      }
      if (isValidTag(bookmark.tag2)) {
        columnvalues.push(['tag2', '=', bookmark.tag2]);
      }
      if (isValidTag(bookmark.tag3)) {
        columnvalues.push(['tag3', '=', bookmark.tag3]);
      }
      if (isValidTag(bookmark.tag4)) {
        columnvalues.push(['tag4', '=', bookmark.tag4]);
      }
      if (bookmark.folder === 'No move' || bookmark.folder === '') {
        // do nothing
      } else {
        columnvalues.push(['folder', '=', bookmark.folder]);
      }

      var filters = [];
      filters.push(['username', '=', username]);
      filters.push('and');
      filters.push(['title', '=', bookmark.oldTitle]);

      console.log('about to update bookmark with');
      console.log('columnvalues');
      console.log(columnvalues);
      console.log('filters');
      console.log(filters);

      qs.update('bookmark', columnvalues, filters, function(err, rows) {
        if (err) throw err;
        data.bookmark = bookmark;
        res.send(data);
      })
    }
  })

});

router.post('/reset',function(req,res){
    crypto.randomBytes(20, function (err, buf) {
      var token = buf.toString('hex');
      var filter = [];
      var user = req.body.username
      filter.push(['username','=', user]);

      qs.select(['*'], 'user', filter, function(err, rows) {
        if (rows.length != 1) {
          res.send({
            user: {},
            msg: "Couldn't find user",
            success: false
          });
        }
        else{

          var columnvalues = [];
          columnvalues.push(['resetpasswordtoken', '=', token]);
          columnvalues.push(['resetpasswordtimer', '=', Date.now() + 3600000]);

          var filters = [];
          filters.push(['username', '=', user]);
          console.log("rows in update pw: " + user + " row length: " + rows.length);

          qs.update('user', columnvalues, filters, function(err, result) {
            if(err) console.log('EROOOOOOOR');
            console.log("result: " + result);
            if (true) {
              console.log("everything went according to plan in sending email");
              var mailTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                  user: 'bookmarxapp@gmail.com',
                  pass: 'cse136team10'
                }
              });
              var mailOptions = {
                from: 'passwordreset@bookmarx.com',
                to: user,
                subject: 'Password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
              mailTransport.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log(error);
                  res.json({msg: 'errooor sending emial'});
                } else {
                  console.log('Message sent; ' + info.response);
                  res.json({msg: info.response});
                }

              });
            }
          });
          }
      });
  });
});

router.get('/reset/:token', function(req,res){
  var filter = [];
  filter.push(['resetpasswordtoken' , '=', req.params.token]);
  filter.push(['resetpasswordtimer', '>', Date.now()]);
  qs.select(['*'], 'user', filter,function(err, rows){
    if(err){
      res.json({msg:'Link expired :('});
      throw(err);
    }
    else{
      res.json({
        user: rows[0]
      });
    }
  });
});

function isValidTag(tag) {
  return !(!tag || tag.trim('').length === 0 || tag === 'null' || tag === 'NULL'
  || tag === null);

}


module.exports = router;

