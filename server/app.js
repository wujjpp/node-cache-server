/**
 * Created by JP on 2016/12/19.
 */

'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
//var middlewares = require('./services/middlewares');
var config = require('./configs/config');
var logger = require('./cache-manager/shared/logger')('cache-service');

var app = express();
app.disable('etag');
app.disable('x-powered-by');
app.use(compression());

//app.use(middlewares.checkToken);

if (config.env === 'prod') {
  process.env.NODE_ENV = 'production';
}

app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: false}));

//attach routers
app.use(require('./routes/enterprise'));
app.use(require('./routes/common'));

app.use(function (err, req, res, next) {
  if (err.errcode) {
    res.status(500).json(err);
  } else {
    res.status(500).json({errcode: '1001000', message: err.message});
  }
});

var args = process.argv.slice(2);
if (args && args.length >= 2) {
  var ip = args[0];
  var port = parseInt(args[1]);
  app.listen(port, ip, function () {
    logger.info(`Cache Server started [ ip: ${ip} , port: ${port} ]`);
  });
}
else {
  app.listen(config.port, function () {
    logger.info(`Cache Server listen on port:${config.port}`);
  });
}
