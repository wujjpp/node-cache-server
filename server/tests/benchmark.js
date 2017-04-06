/**
 * Created by JP on 2016/12/19.
 */

'use strict';
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var _ = require('lodash');

var request = require('request');
var uuid = require('uuid');

var ids = [];

var total = 0;

for (var i = 0; i < 1000; ++i) {
  ids.push(uuid());
}


suite
  .add('cache#get', {
    initCount: 1000,
    defer: true,
    fn: function (deferred) {
      var n = _.random(0, 999);
      total++;
      request('http://127.0.0.1:9999/enterprise/' + ids[n], function (error, response, body) {
        if (!error && response.statusCode == 200) {
          deferred.resolve();
        } else {
          console.log(body);
        }
      })
    }
  })
  .on('complete', function () {
    console.log(this[0].stats);
    console.log(total);
  })
  .run({ 'async': true });
