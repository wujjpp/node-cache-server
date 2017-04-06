/**
 * Created by JP on 2016/12/19.
 */

'use strict';

module.exports = {
  caches: [{
      store: 'redis',
      ttl: 60 * 5, //expire time in seconds, 5 mins
      ignoreCacheErrors: true, //ignore storage errors

      //下面是redis相关设置
      host: "6379",
      port: 6401,
      password: "xxxxxxxxx",
      db: 0
    },
    {
      store: 'ots',
      ttl: 60 * 10, //expire time in seconds, 1 day
      ignoreCacheErrors: false, //ignore storage errors

      //下面是OTS相关设置
      accessKeyId: 'Mf7kHLKXXXXXXXXX',
      secretAccessKey: 'o3Qv0NdgjpXXXXXXXXXXXXXX',
      endpoint: 'http://cn-hangzhou.ots-internal.aliyuncs.com',
      apiVersion: '2014-08-08',
      instance_name: 'cachetest',
      table_name: 'sit'
    }
  ]
};
