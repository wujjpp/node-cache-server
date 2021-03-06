/**
 * Created by JP on 2016/12/20.
 */

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
var configFiles = glob.sync(path.join(__dirname, env, '**', '*.js')); // sync operation is require

module.exports = _.extend(config, _.chain(configFiles)
  .map(function(o) {
    return require(o);
  })
  .reduce(function(o, n) {
    return _.extend(o, n);
  }, config).value());
