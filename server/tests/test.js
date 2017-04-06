/**
 * Created by JP on 2016/12/14.
 */

'use strict';

var Promise = require('bluebird');
var logger = require('../cache-manager/shared/logger')('App');

var cacheManger = require('../cache-manager');
var cache1 = cacheManger.cache({store: 'memory', ttl: 3});

var cache2 = cacheManger.cache({
  ttl: 8, //缓存过期秒数
  ignoreCacheErrors: true, //是否忽略存储器错误
  store: 'redis',

  host: "127.0.0.1",
  port: 6379,
  password: "xxxxxxxxxx",
  db: 0
});

var cache3 = cacheManger.cache({
  ttl: 20,//缓存过期秒数
  ignoreCacheErrors: true, //是否忽略存储器错误
  store: 'ots',

  accessKeyId: 'Mf7kHxxxxxxxxx',
  secretAccessKey: 'o3Qv0Ndgxxxxxxxxxxxxx',
  endpoint: 'http://cn-hangzhou.ots.aliyuncs.com',
  apiVersion: '2014-08-08',

  instance_name: 'cachetest',
  table_name: 'dbcache'
});

var manager = cacheManger.manager([cache1, cache2, cache3]);

var key = '123';

var _loadData = function () {
  return new Promise(function (resolve) {
    logger.info('load data from db');
    resolve({name: '张三'});
  });
};

setInterval(function () {
  manager
    .get(key, _loadData)
    .then(function (data) {
      //logger.info(data);
    });
}, 1000);
