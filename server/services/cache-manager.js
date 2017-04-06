/**
 * Created by JP on 2016/12/20.
 */

'use strict';
var _ = require('lodash');
var cacheManger = require('../cache-manager');
var config = require('../configs/config');
module.exports = cacheManger.manager(_.map(config.caches, store=> cacheManger.cache(store)));
