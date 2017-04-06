/**
 * Created by JP on 2016/12/19.
 */

'use strict';

module.exports = {
  caches: [{
      store: 'memory',
      ttl: 60 * 5, //expire time in seconds, 5 minutes
      max: 600, //max key count
    },
    // {
    //   store: 'redis',
    //   ttl: 60 * 10, //expire time in seconds, 10 minutes
    //   ignoreCacheErrors: false, //ignore storage errors
    //
    //   //下面是redis相关设置
    //   host: "127.0.0.1",
    //   port: 6379,
    //   password: "xxxxxxxxx",
    //   db: 0
    // },
    // {
    //   //阿里云OTS
    //   store: 'ots',
    //   ttl: 60 * 20, //expire time in seconds, 20 minutes
    //   ignoreCacheErrors: false, //ignore storage errors
    //
    //   //下面是OTS相关设置
    //   accessKeyId: 'Mf7kHLKXXXXXXXXX',
    //   secretAccessKey: 'o3Qv0NdgjpXXXXXXXXXXXXXX',
    //   endpoint: 'http://cn-hangzhou.ots.aliyuncs.com',
    //   apiVersion: '2014-08-08',
    //   instance_name: 'cachetest',
    //   table_name: 'dev'
    // }
  ]
};
