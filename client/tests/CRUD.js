/**
 * Created by JP on 2016/12/20.
 */

'use strict';

var config = require('./config');
var cache = require('../cache');


//创建客户端
var client = cache.create(config);

var category = 'category-name-can-be-any-value';
var key = '1234567';

client
  .get(category, key, function() {
    return new Promise(function(resolve, reject) {
      console.log('step - 1: create data at client');
      resolve({ id: 'foo', name: '张三' });
      //resolve(12345678);
    });
  }, 60) //expire in 60 seconds

  .then(function(data) {
    console.log('result:', data);
    //check cached data
    return client.get(category, key);
  })

  .then(function(data) {
    console.log('step - 2: load data from cache without "work"');
    console.log('result:', data);

    //delete
    console.log('try to delete cached data');
    return client.del(category, key);
  })

  .then(function() {
    console.log('after deleted, try to load data again');
    return client.get(category, key);
  })

  .then(function(data) {
    console.log('step - 3: the cached data disappeared');
    console.log('result:', data);
  })

  .catch(function(err) {
    console.log(err);
  });
