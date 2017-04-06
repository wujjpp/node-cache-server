/**
 * Created by JP on 2016/12/19.
 */

'use strict';
var express = require('express');
var manager = require('../services/cache-manager');
var router = express.Router();

//get cache
router.get('/:category/:id', function (req, res, next) {
  var category = req.params.category;
  var id = req.params.id;
  var key = `${category}:${id}`;

  manager
    .get(key)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      next(err);
    })
});

//set cache
router.post('/:category/:id', function (req, res, next) {
  var key = `${req.params.category}:${req.params.id}`;
  var data = req.body;

  var value = data.value;
  var ttl = +data.ttl;
  var option = {};
  if(ttl && ttl > 0){
    option.ttl = ttl;
  }
  manager
    .set(key, value, option)
    .then(function () {
      res.json({});
    })
    .catch(function (err) {
      next(err);
    });
});

//delete cache
router.delete('/:category/:id', function (req, res, next) {
  var key = `${req.params.category}:${req.params.id}`;
  manager
    .del(key)
    .then(function () {
      res.json({});
    })
    .catch(function (err) {
      next(err);
    });
});

module.exports = router;
