var CryptService = [];

var bcrypt = require('bcryptjs');

CryptService.hash = hash;
CryptService.comparePassword = comparePassword;

var salt = "ourSalt";

function hash(username, password) {
  return bcrypt.hashSync(password + username + salt);
}

function comparePassword(username, password, hash) {
  return bcrypt.compareSync(password + username + salt, hash);
}

module.exports = CryptService;
