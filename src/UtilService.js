var UtilService = {};

UtilService.checkUndefined = checkUndefined;
UtilService.checkURL = checkURL;
UtilService.checkString = checkString;

function checkUndefined(obj) {
  if (typeof obj === 'undefined') {
    throw 'Error: ' + obj + ' is undefined';
  }
}

function checkURL(url) {
  var urlExpression = /((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\&\.\/\?\:@\-_=#])*/;
  var urlRegex = new RegExp(urlExpression);

  return urlRegex.test(url);
}

function checkString(s) {
  return ((s.trim() === "") || (s.trim() === "null") || (s.trim() === "NULL"));
}


module.exports = UtilService;
