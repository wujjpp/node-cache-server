/**
 * Created by JP on 2016/12/21.
 */

'use strict';
//TODO: if necessary
function mysqlStore(args) {

  var self = {
    name: 'mysql'
  };

  self.get = function (key) {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  };

  self.set = function (key, value, options) {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  };

  self.del = function (key) {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  };

  self.isCacheableValue = function (value) {
    return value !== undefined && value !== null;
  };

  return self;
}


module.exports = {
  create: mysqlStore
};


