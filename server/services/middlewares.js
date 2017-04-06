/**
 * Created by JP on 2016/12/21.
 */

'use strict';

var crypto = require('crypto');
var config = require('../configs/config');

function checkToken(req, res, next) {
  var token = req.headers['token'];
  var text = decodeURIComponent(req.originalUrl).toLowerCase() + config.apiKey;
  var MD5 = crypto.createHash('md5');
  MD5.update(text);
  var encrypted = MD5.digest("hex");

  if (token != encrypted) {
    res.status(401).json({errcode: 401, message: 'Unauthorized'})
  } else {
    next();
  }
}

module.exports = {
  checkToken
};

