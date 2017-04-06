/**
 * Created by JP on 2016/12/15.
 */

'use strict';
var async = require('async');
var Promise = require('bluebird');
var logger = require('./shared/logger')('manager');
var _ = require('lodash');

var manager = function (caches) {
  var self = {};

  self.caches = caches;

  var _updateCaches = function (cachesToUpdate, key, data) {
    //reverse caches
    cachesToUpdate.reverse();
    var expireTime = +data.___expire;
    var now = new Date().getTime();
    var lastTTL = (expireTime - now) / 1000;
    async.eachSeries(cachesToUpdate, function (cache, next) {
      var realTTL = cache.defaultTTL;
      if (realTTL > lastTTL) {
        realTTL = lastTTL;
      }

      if (logger.isDebugEnabled()) {
        logger.debug(`update:${cache.name} next: ${lastTTL} default:${cache.defaultTTL} real:${realTTL}`);
      }

      cache
        .set(key, data.___value, {ttl: realTTL})
        .catch(function (err) {
          logger.error(err);
        });
      lastTTL = realTTL;
      next();
    });
  };

  self.get = function (key, worker) {
    return new Promise(function (resolve, reject) {
      var callback = function (cachesToUpdate, key, data) {
        if (data) {
          resolve(data.___value);
          _updateCaches(cachesToUpdate, key, data);
        } else {

          if (worker && _.isFunction(worker)) {
            worker()
              .then(function (data) {
                resolve(data);

                var d = new Date();
                d.setFullYear(9999);
                var wrappedData = {
                  ___value: data,
                  ___expire: d.getTime()
                };

                _updateCaches(cachesToUpdate, key, wrappedData);
              })
              .catch(function (err) {
                reject(err);
              });
          }
          else {
            resolve(null);
          }
        }
      };

      var i = 0;
      async.eachSeries(self.caches, function (cache, next) {
        i++;
        cache
          .get(key)
          .then(function (data) {
            if (data) {

              if (logger.isDebugEnabled()) {
                logger.debug(`load data from cache:${cache.name}`);
              }

              var cachesToUpdate1 = self.caches.slice(0, i - 1);
              callback(cachesToUpdate1, key, data);
            } else {

              if (logger.isDebugEnabled()) {
                logger.debug(`no data in cache:${cache.name}`);
              }

              if (i === self.caches.length) {
                var cachesToUpdate2 = self.caches.slice(0);
                callback(cachesToUpdate2, key, data);
              } else {
                next();
              }
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
    });
  };

  self.set = function (key, value, options) {
    return new Promise(function (resolve, reject) {
      Promise
        .map(self.caches, function (cache) {
          options = options || {};
          options.ttl = (options.ttl && options.ttl !== 0 && options.ttl > 0) ? options.ttl : cache.defaultTTL;
          return cache.set(key, value, options);
        })
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  self.del = function (key) {
    return new Promise(function (resolve, reject) {
      Promise
        .map(self.caches, c=>c.del(key))
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  self.reset = function () {
    return new Promise(function (resolve, reject) {
      Promise
        .map(self.caches, c => c.reset)
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  return self;
};

module.exports = manager;
