var CryptService = [];
var md5 = require('./md5');

CryptService.hash = hash;

function hash(username, password) {
  return md5(password, username);
}
module.exports = CryptService;
