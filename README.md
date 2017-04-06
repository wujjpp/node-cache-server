# node cache server

node缓存服务器，支持多级缓存，允许自定义store, 内置store包含 memory, redis以及阿里云OTS

## 运行

#### 服务端
```shell
$ cd server
$ npm start
```

#### 运行测试客户端
```shell
$ cd client
$ npm run benchmark
```

## 配置
环境配置`/server/configs/config.js`

```javascript
'use strict';
var env = 'dev'; //运行环境：dev, sit, uat, prod根据配置读取对应目录的cache.js配置文件

var path = require('path');
var _ = require('lodash');
var glob = require('glob');

var sharedConfig = require('./shared');
var config = {
  env: env
};

_.extend(config, sharedConfig);
var configFiles = glob.sync(path.join(__dirname, env, '**', '*.js'));// sync operation is require

module.exports = _.extend(config, _.chain(configFiles)
  .map(function (o) {
    return require(o);
  }).reduce(function (o, n) {
    return _.extend(o, n);
  }, config).value());
```

缓存store配置`/server/configs/(dev|sit|uat|prod)/cache.js`, 根据实际情况进行调整，当然内存足够大的情况下，你可以直接使用memory，建议memory + redis, 这样缓存服务挂掉的情况下，可以使用redis作为backing store

```javascript

module.exports = {
  caches: [
    //一级缓存配置为内存
    {
      store: 'memory',
      ttl: 60 * 5, //expire time in seconds, 5 mins
      max: 600, //max key count
    },

    //二级缓存配置成redis
    {
      store: 'redis',
      ttl: 60 * 5, //expire time in seconds, 5 mins
      ignoreCacheErrors: false, //ignore storage errors

      //下面是redis相关设置
      host: "127.0.0.1",
      port: 6379,
      password: "xxxxxxxxx",
      db: 0
    },

    //三级缓存配置成阿里云的OTS
    {
      //阿里云OTS
      store: 'ots',
      ttl: 60 * 10, //expire time in seconds, 1 day
      ignoreCacheErrors: false, //ignore storage errors

      //下面是OTS相关设置
      accessKeyId: 'Mf7kHLKXXXXXXXXX',
      secretAccessKey: 'o3Qv0NdgjpXXXXXXXXXXXXXX',
      endpoint: 'http://cn-hangzhou.ots.aliyuncs.com',
      apiVersion: '2014-08-08',
      instance_name: 'cachetest',
      table_name: 'dev'
    }
  ]
};

```
