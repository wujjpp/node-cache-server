/**
 * Created by JP on 2016/12/20.
 */

'use strict';
var _ = require('lodash');
var request = require('request');
var Promise = require('bluebird');
var urlHelper = require('url');
var crypto = require('crypto');

function create(args) {
  var uri = args.uri;
  var apiKey = args.apiKey;

  if (!(_.isString(uri) && uri)) {
    throw new Error('Parameter uri is required');
  }

  /*if (!(_.isString(apiKey) && apiKey)) {
    throw new Error('Parameter apiKey is required');
  }*/

  var _generateHeader = function (url) {
    var headers = {};
    if(apiKey) {
      var uri = urlHelper.parse(url);
      var text = decodeURIComponent(uri.path).toLowerCase() + apiKey;
      var MD5 = crypto.createHash('md5');
      MD5.update(text);
      var encrypted = MD5.digest("hex");
      headers.token = encrypted;
    }
    return {token: encrypted};
  };

  var _isCacheableValue = function (value) {
    return value != undefined && value != null && !_.isFunction(value);
  };

  var self = {
    uri: uri,
    apiKey: apiKey
  };

  /**
   * 从缓存中请求数据
   * @param 缓存目录
   * @param 缓存key
   * @param 当缓存不存在时，执行的查询函数，该函数必须返回Promise， Promise resolve的结果（可以为缓存的值）将被缓存到缓存服务器
   * @param 缓存过期时间（秒），可选参数，假如未提供该参数，将使用缓存服务器默认设置
   */
  self.get = function (category, key, work, ttl) {
    return new Promise(function (resolve, reject) {
      var url = `${self.uri}/${category}/${key}?_t=${new Date().getTime()}`;
      request({
          method: 'GET',
          uri: url,
          headers: _generateHeader(url),
          json: true
        },
        function (error, response, body) {
          if (error) {
            reject(error);
          }
          else if (response.statusCode == 200) {
            if (body) {
              resolve(body);
            } else if (_.isFunction(work)) {
              work()
                .then(function (data) {
                  resolve(data);
                  //save data to cache
                  self
                    .set(category, key, data, ttl)
                    .catch(function () {
                      //ignore error if save failed;
                    });
                })
                .catch(function (err) {
                  reject(err);
                })
            } else {
              resolve();
            }
          } else {
            reject(body);
          }
        });
    });
  };

  /**
   * 设置数据到缓存中
   * @param 缓存目录
   * @param 缓存key
   * @param 需要缓存的对象或者值
   * @param 缓存过期时间（秒），可选参数，假如未提供该参数，将使用缓存服务器默认设置
   */
  self.set = function (category, key, value, ttl) {
    return new Promise(function (resolve, reject) {
      if (_isCacheableValue(value)) {
        var url = `${self.uri}/${category}/${key}`;
        var data = {
          value: value
        };
        if (ttl && ttl > 0) {
          data.ttl = ttl;
        }
        request({
            method: 'POST',
            uri: url,
            headers: _generateHeader(url),
            json: true,
            body: data
          },
          function (error, response, body) {
            if (error) {
              reject(error);
            }
            else if (response.statusCode == 200) {
              resolve(body);
            } else {
              reject(body);
            }
          });
      } else {
        reject(Error(`value: ${value} is not allowed to save to cache`));
      }
    });
  };

  /**
   * 从缓存中删除缓存的对象或者值
   * NOTE：即使缓存的对象或者值不存在，执行该函数也是安全的。
   * @param 缓存目录
   * @param 缓存key
   */
  self.del = function (category, key) {
    return new Promise(function (resolve, reject) {
      var url = `${self.uri}/${category}/${key}`;
      request({
          method: 'DELETE',
          uri: url,
          headers: _generateHeader(url),
          json: true
        },
        function (error, response, body) {
          if (error) {
            reject(error);
          }
          else if (response.statusCode == 200) {
            resolve(body);
          } else {
            reject(body);
          }
        });
    });
  };

  return self;
}

module.exports = {
  create
};
