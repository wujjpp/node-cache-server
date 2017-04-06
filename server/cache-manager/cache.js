/**
 * Created by JP on 2016/12/15.
 */

'use strict';

var logger = require('./shared/logger')('cache');

var caching = function (args) {
  var self = {
    requestCount: 0,
    hitCount: 0
  };

  //initialize store
  if (typeof args.store === 'object') {
    if (args.store.create) {
      self.store = args.store.create(args);
    } else {
      self.store = args.store;
    }
  } else if (typeof args.store === 'string') {
    //noinspection JSUnresolvedFunction
    self.store = require('./stores/' + args.store).create(args);
  } else {
    throw new Error('args\'s store parameter is incorrect');
  }

  self.name = args.name || self.store.name;

  if (args.ttl && args.ttl !== 0 && args.ttl > 0) {
    self.defaultTTL = args.ttl;
  }

  //ignore cache error or not
  self.ignoreCacheErrors = args.ignoreCacheErrors || false;

  //determine value can be stored or not
  if (typeof args.isCacheableValue === 'function') {
    self.isCacheableValue = args.isCacheableValue;
  } else if (typeof self.store.isCacheableValue === 'function') {
    self.isCacheableValue = self.store.isCacheableValue;
  } else {
    self.isCacheableValue = function (value) {
      return value !== undefined && value !== null;
    };
  }

  if (typeof self.store.get === 'function') {
    self.get = function (key) {
      return new Promise(function (resolve, reject) {
        self.store.get(key)
          .then(function (wrappedValue) {
            if (wrappedValue && wrappedValue.___expire && +wrappedValue.___expire > new Date().getTime()) {//expired data aren't we wanted
              resolve(wrappedValue);
            } else {
              resolve();
            }
          })
          .catch(function (err) {
            logger.error(err);
            if (self.ignoreCacheErrors) {
              resolve();
            } else {
              reject(err);
            }
          })
      });
    }
  } else {
    throw new Error(`Store must be implement 【get】 function`);
  }

  if (typeof self.store.set === 'function') {
    self.set = function (key, value, options) {
      return new Promise(function (resolve, reject) {
        if (self.isCacheableValue(value)) {
          options = options || {};
          var ttl = (options.ttl && options.ttl !== 0 && options.ttl > 0) ? options.ttl : self.defaultTTL;
          options.ttl = ttl;
          var wrappedValue = {
            ___value: value,
            ___expire: new Date().getTime() + ttl * 1000
          };

          self.store.set(key, wrappedValue, options)
            .then(function () {
              resolve();
            })
            .catch(function (err) {
              logger.error(err);
              if (self.ignoreCacheErrors) {
                resolve();
              }
              else {
                reject(err);
              }
            })
        } else {
          resolve();
        }
      });
    }
  } else {
    throw new Error(`Store must be implement 【set】 function`);
  }

  //common function for bridging between cache and store
  var _setupCaching = function (funcName, check) {
    if (typeof self.store[funcName] === 'function') {
      if (self.ignoreCacheErrors) {
        self[funcName] = function () {
          var params = arguments;
          return new Promise(function (resolve) {
            self.store[funcName].apply(self.store, params)
              .then(function (data) {
                resolve(data);
              })
              .catch(function (err) {
                logger.error(err);
                resolve();
              })
          });
        }
      } else {
        self[funcName] = self.store[funcName].bind(self.store);
      }
    } else if (check) {
      throw new Error(`Store must be implement 【${funcName}】 function`);
    } else {
      self[funcName] = function () {
      };
    }
  };

  _setupCaching('del', true);

  _setupCaching('keys');

  _setupCaching('setex');

  _setupCaching('reset');

  _setupCaching('ttl');

  return self;
};

module.exports = caching;
