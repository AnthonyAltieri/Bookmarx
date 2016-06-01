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

router.get('/changePW',function(req,res){
  res.sendFile(path.join(__dirname, '/static/templates/changePW.html'));
});

router.get('/reset', function(req,res){
  res.sendFile(path.join(__dirname, '/static/templates/reset.html'));
});

router.get('/verify',function(req,res){
  res.sendFile(path.join(__dirname, '/static/templates/verify.html'));
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
  filter.push('and');
  filter.push(['verified', '=', '1']);
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

  var cryptedPassword = cryptService.hash(req.body.username, req.body.password);

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
        /**res.send({
          msg: ('Created account for user: ' + username),
          success: true,
          username: username
        });*/
        var mailTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'bookmarxapp@gmail.com',
            pass: 'cse136team10'
          }
        });

        var mailOptions = {
          from: 'Bookmarxapp@gmail.com',
          to: username,
          subject: 'Account Activation',
          text: 'Thank you for joining Bookmarx!\n\n' +
            'Please click on the following link to activate your account:\n\n' +
            'http://' + req.headers.host + '/verify/' + username + '\n\n'
        };

        mailTransport.sendMail(mailOptions,function(err,info){
          if(err){
            res.json({msg: 'error sending validation email'});
          }
          else{
            console.log('Account created');
            res.send({
              msg: 'Created account for user: ' + username,
              success: true,
              username: username,
              email: info.response
            });
          }
        });
      });
    }
  })
});

router.get('/verify/:username', function(req,res){
  var user = req.params.username;
  var columnvalues = [];
  var filter = [];
  columnvalues.push(['verified','=','1']);
  filter.push(['username','=',user]);
  qs.update('user', columnvalues, filter, function(err,result){
    if(err){
      res.send({
        msg: 'There was a problem verifying the account'
      });
      throw(err);
    }
    res.redirect('/verify');
  });
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
      /*
<<<<<<< HEAD
      datestring += (date.getMonth()+1 + '-');
      datestring += (date.getDate());
======= */
      datestring += ((((date.getMonth() + 1).toString().length === 1)
        ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-');
      datestring += (((date.getDate().toString().length === 1)
        ? '0' + date.getDate() : date.getDate()));

      values.push(datestring); // creationDate
      values.push(datestring); // lastVisit
      values.push(0); // counter
      values.push(bookmark.folder);


      qs.insert('bookmark', columns, values, function(err, result) {
        if (err) throw err;
        if (result.affectedRows === 1) {
          // Everything went according to plan
          var data = {bookmark: bookmark};
          res.send(data);
        } else {
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
  if (bookmark.star === '1') {
    columnvalues.push(['star', '=', '0'])
  } else {
    columnvalues.push(['star', '=', '1'])
  }
  var filter = [];
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
  var newCount = (count + 1) + '';

  // Update bookmarks counter
  bookmark.counter = newCount;


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
    if (fs.existsSync(filename)) {
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
      if (fs.existsSync(path)) {
        res.sendFile(path);
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


      qs.update('bookmark', columnvalues, filters, function(err, rows) {
        if (err) throw err;
        data.bookmark = bookmark;
        res.send(data);
      })
    }
  })

});

/*** Reset password ***/
router.post('/forgot',function(req,res){
    crypto.randomBytes(20, function (err, buf) {
      var token = buf.toString('hex');
      var filter = [];
      var user = req.body.username;
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

          qs.update('user', columnvalues, filters, function(err, result) {
            if(err) {
            }
            else {
              var mailTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                  user: 'bookmarxapp@gmail.com',
                  pass: 'cse136team10'
                }
              });
              var mailOptions = {
                from: 'Bookmarxapp@gmail.com',
                to: user,
                subject: 'Password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' +
                'Do not respond to this automated email'
              };
              mailTransport.sendMail(mailOptions, function (err, info) {
                if (err) {
                  res.json({msg: 'error sending email'});
                } else {
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
  console.log('user: ' + req.user);
  qs.select(['*'], 'user', filter,function(err, rows){
    if(err){
      return res.redirect('/#/login');
      throw(err);
    }
    else if(rows.length === 0 ){
      console.log('Link expired or password already reset');
      return res.redirect('/#/login');
    }
    else{
     res.render('reset',{
       user: req.user
     });
    }
  });
});

router.post('/reset/:token', function(req,res){
  console.log('RESETTING PASSWORD');

  var password = req.body.password;
  var token = req.params.token;
  var cryptedPassword;
  var filter = [];
  var columnValues =[];
  var user = req.body.username;

  cryptedPassword = cryptService.hash(user, password);

  filter.push(['resetpasswordtoken','=',token]);
  filter.push('and');
  filter.push(['resetpasswordtoken', '>', Date.now()]);
  filter.push('and');
  filter.push(['username', '=', user]);

  columnValues.push(['password','=',cryptedPassword]);
  columnValues.push(['resetpasswordtoken','=', 'NULL']);
  columnValues.push(['resetpasswordtimer','=','NULL']);

  qs.update('user',columnValues,filter,function(err,result){
    console.log('RESULT: ' + result);
    if(err){
      console.log('Error');
      console.log("result: " + result);
      res.redirect('/#/login');
    }
    else if(result.affectedRows != 1){
      res.send({msg:"Could not find user"});
    }
    else{
      var mailTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'bookmarxapp@gmail.com',
          pass: 'cse136team10'
        }
      });
      var mailOptions = {
        from: 'bookmarxapp@gmail.com',
        to: user,
        subject: 'Your password has been changed',
        text: 'Hello' + user + ', \n\n' +
          'This is a confirmation that your password for your account has been changed.\n\n' +
          'If you did not request a password reset, please contact an administrator immediately.\n\n'
      };
      mailTransport.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
          res.json({msg: 'error sending email'});
        } else {
          res.send({msg: 'Password succesfully changed'});
        }

      });

      /*console.log('Message sent;' );
      res.json({msg: 'password changed'});*/
    }
  });
});

router.post('/changePassword', function(req,res) {
  console.log('changing password')
  var newPassword = req.body.newPassword;
  var currentPassword = req.body.currentPassword;
  var user = req.body.username;
  console.log('current password is: ' + currentPassword);
  console.log('changing password to: ' + newPassword);
  console.log('usernae : ' + user);

  var cryptedPassword;
  var currentCrypted;

  var filter = [];
  var columnValues =[];
  currentCrypted = cryptService.hash(user, currentPassword);
  cryptedPassword = cryptService.hash(user, newPassword);
  console.log('current crypted: ' + currentCrypted);

  filter.push(['password','=',currentCrypted]);
  filter.push('and');
  filter.push(['username', '=', user]);

  columnValues.push(['password','=',cryptedPassword]);

  qs.update('user',columnValues,filter,function(err,result){
    if(err){
      console.log('error');
      res.send({msg:'error'});
    }
    else if(result.affectedRows != 1){
      console.log('could not find user');
      res.send({msg:"Could not find user"});
    }
    else{
      console.log('password changed!');
      res.send({msg: 'Password successfully changed'});
    }
  });
});

/*

=======
>>>>>>> master*/
function isValidTag(tag) {
  return !(!tag || tag.trim('').length === 0 || tag === 'null' || tag === 'NULL'
  || tag === null);

}

module.exports = router;

