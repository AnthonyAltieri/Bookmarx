var UtilService = {};

UtilService.checkUndefined = checkUndefined;
UtilService.isInt = isInt;
UtilService.checkURL = checkURL;
UtilService.checkString = checkString;

function checkUndefined(obj) {
  if (typeof obj === 'undefined') {
    throw 'Error: ' + obj + ' is undefined';
  }
}

function isInt(value) {
  if (isNaN(value)) {
    return false;
  }
  var x = parseFloat(value);
  return (x | 0) === x;
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
