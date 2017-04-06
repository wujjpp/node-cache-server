/**
 * Created by JP on 2016/12/15.
 */

'use strict';
var Promise = require('bluebird');
var Lru = require("lru-cache");

function memoryStore(args) {

  var self = {
    name: 'memory'
  };

  var ttl = args.ttl;

  var lruOpts = {
    max: args.max || 500,
    maxAge: (ttl || ttl === 0) ? ttl * 1000 : null
  };
  var lruCache = new Lru(lruOpts);

  self.set = function (key, value, options) {
    return new Promise(function (resolve) {
      options = options || {};
      var maxAge = (options.ttl && options.ttl !== 0) ? options.ttl * 1000 : lruOpts.maxAge;
      lruCache.set(key, value, maxAge);
      resolve();
    });
  };

  self.get = function (key) {
    return new Promise(function (resolve) {
      resolve(lruCache.get(key));
    });
  };

  self.keys = function () {
    return new Promise(function (resolve) {
      resolve(lruCache.keys());
    });
  };

  self.reset = function () {
    return new Promise(function (resolve) {
      lruCache.reset();
      resolve();
    });
  };

  self.del = function (key) {
    return new Promise(function (resolve) {
      lruCache.del(key);
      resolve();
    });
  };

  return self;
}


module.exports = {
  create: memoryStore
};
