var UtilService = {};

UtilService.checkUndefined = checkUndefined;

function checkUndefined(obj) {
  if (typeof obj === 'undefined') {
    throw 'Error: ' + obj + ' is undefined';
  }
}

module.exports = UtilService;
