/**
 * Created by JP on 2016/12/15.
 */

'use strict';
var log4js = require('log4js');
log4js.configure("log4js.json", {reloadSecs: 60});

var errorLogger = log4js.getLogger('cache-error');

function getLogger(name) {
  var self = {};
  var logger = log4js.getLogger(name);
  self.trace = function () {
    logger.trace.apply(logger, arguments);
    errorLogger.trace.apply(errorLogger, arguments);
  };

  self.debug = function () {
    logger.debug.apply(logger, arguments);
    errorLogger.debug.apply(errorLogger, arguments);
  };

  self.info = function () {
    logger.info.apply(logger, arguments);
    errorLogger.info.apply(errorLogger, arguments);
  };

  self.error = function () {
    logger.error.apply(logger, arguments);
    errorLogger.error.apply(errorLogger, arguments);
  };

  self.fatal = function () {
    logger.fatal.apply(logger, arguments);
    errorLogger.fatal.apply(errorLogger, arguments);
  };

  self.isTraceEnabled = function () {
    return logger.isLevelEnabled(log4js.levels.TRACE);
  };

  self.isDebugEnabled = function () {
    return logger.isLevelEnabled(log4js.levels.DEBUG);
  };

  self.isInfoEnabled = function () {
    return logger.isLevelEnabled(log4js.levels.INFO);
  };

  self.isErrorEnabled = function () {
    return logger.isLevelEnabled(log4js.levels.ERROR);
  };

  self.isFatalEnabled = function () {
    return logger.isLevelEnabled(log4js.levels.FATAL);
  };


  return self;
}

module.exports = getLogger;
