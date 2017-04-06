/**
 * Created by JP on 2016/12/21.
 */

'use strict';
var config = require('./config');
var cache = require('../cache');
//创建客户端
var client = cache.create(config);

var category = 'enterprise';
var key = '1234567';

client
  .get(category, key)
  .then(function (data) {
    console.log(data);
  });
