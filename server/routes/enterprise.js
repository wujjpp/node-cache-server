/**
 * Created by JP on 2016/12/20.
 */

'use strict';
var express = require('express');
var enterpriseService = require('../services/enterprise');

var manager = require('../services/cache-manager');
var router = express.Router();

//get cache
router.get('/enterprise/:id', function (req, res, next) {
  var id = req.params.id;
  var key = `enterprise:${id}`;
  manager
    .get(key, function () {
      return enterpriseService.loadEnterpriseSummaryData(id);
    })
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      next(err);
    })
});

module.exports = router;
