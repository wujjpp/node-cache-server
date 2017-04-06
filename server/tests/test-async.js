/**
 * Created by JP on 2016/12/14.
 */

'use strict';

var async = require('async');
var Promise = require('bluebird');

function Store() {
  var _data = {};

  this.get = function (key) {
    return new Promise(function (resolve, reject) {
      resolve(_data[key]);
    });
  };

  this.set = function (key, value) {
    return new Promise(function (resolve, reject) {
      _data[key] = value;
      resolve();
    });
  };
}



async
  .eachSeries([func1(), func2(), func3()], function (cache, next) {
    console.log(cache);
    next();
  });

