# node cache server

node缓存服务器，支持多级缓存，允许自定义store, 内置store包含 memory, redis以及阿里云OTS

## 安装
```shell
$ git clone https://github.com/wujjpp/node-cache-server.git
```

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

#### 客户端SDK使用
```javascript
var cache = require('./client/cache');

var client = cache.create({
  uri: 'http://127.0.0.1:9999', // 缓存服务器地址
  apiKey: '123456789' // 必须与服务端的apiKey保持一致
});

client
  .get("category-name", "the-key", function() {
    return new Promise(function(resolve, reject) {
      // Load data from database, for simple case, we just hardcode returned value
      resolve({ id: 'foo', name: 'Jane' });      
    });
  })
  .then(function(data) {
    console.log('result:', data);
  })
```
上面的代码执行流程： client先会尝试从缓存服务器的`category-name`目录取key为`the-key`值。存在的情况下，直接返回对应对象，假如不存在，会执行第三个参数（即回调函数），去慢速介质（比如：数据库）查询数据，框架会将resolve的结果自动填充到缓存服务器，以备下次使用。

## 服务端配置
___/server/configs/config.js___ 环境配置

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
  })
  .reduce(function (o, n) {
    return _.extend(o, n);
  }, config).value());
```

___/server/configs/(dev|sit|uat|prod)/cache.js___ 缓存store配置

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
      ttl: 60 * 10, //expire time in seconds, 10 mins
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
      ttl: 60 * 20, //expire time in seconds, 20 minutes
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

根据实际情况进行调整，当然内存足够大的情况下，你可以直接使用memory，建议memory + redis, 这样缓存服务挂掉的情况下，可以使用redis作为backing store

关于ttl，ttl用来控制缓存过期时间，单位为“秒”，越靠前的缓存存储ttl值应该是越小

理论上越靠前的缓存存储器应该是读写速度应该越快，当然成本也是越高的。

___/server/configs/shared.js___ 配置缓存服务器端口及apiKey
```javascript
module.exports = {
  port: 9999, //缓存服务器访问端口
  apiKey: '123456789' //API key
};

```

Made with ♥ by Wu Jian Ping
