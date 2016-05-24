var UtilService = {};

UtilService.checkUndefined = checkUndefined;
UtilService.isInt = isInt;

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

module.exports = UtilService;
