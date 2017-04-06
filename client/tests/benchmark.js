/**
 * Created by JP on 2016/12/19.
 */

'use strict';

var uuid = require('uuid');
var ProgressBar = require('progress');
var request = require('request');

var total = 40000;
var bar = new ProgressBar('progress [:bar] :rate/s :current/:total :percent :elapseds :etas', {
  complete: '=',
  incomplete: ' ',
  width: 30,
  total: total
});

var cnt = 0;
var foo = function() {
  cnt++;
  request('http://127.0.0.1:9999/enterprise/' + uuid(), function(error, response) {
    if (!error && response && response.statusCode == 200) {
      bar.tick(1);
    } else {
      console.log('===============');
      console.log(error);
      if (response) {
        console.log(response.statusCode);
      }
    }
  });

  if (cnt <= total) {
    setTimeout(foo, 1);
  }
};

foo();
