/**
 * Created by JP on 2016/12/15.
 */

'use strict';

//noinspection JSUnresolvedFunction
var redis = require('redis');
var Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

function redisStore(args) {

  var ttl = args.ttl;
  var client = redis.createClient(args);

  var self = {
    name: 'redis'
  };

  self.get = function (key) {
    return new Promise(function (resolve, reject) {
      client
        .getAsync(key)
        .then(function (data) {
          if (data) {
            resolve(JSON.parse(data));
          } else {
            resolve();
          }
        })
        .catch(function (err) {
          reject(err);
        })
    });
  };

  self.set = function (key, value, options) {
    return new Promise(function (resolve, reject) {
      options = options || {};
      options.ttl = Math.ceil((options.ttl && options.ttl !== 0 && options.ttl > 0) ? options.ttl : ttl);
      if (options.ttl) {
        client.setexAsync(key, options.ttl, JSON.stringify(value))
          .then(function () {
            resolve();
          })
          .catch(function (err) {
            reject(err);
          })
      } else {
        client
          .setAsync(key, value)
          .then(function () {
            resolve();
          })
          .catch(function (err) {
            reject(err);
          });
      }
    });
  };

  self.del = function (key) {
    return client.delAsync(key);
  };

  self.isCacheableValue = function (value) {
    return value !== undefined && value !== null;
  };

  return self;
}


module.exports = {
  create: redisStore
};
