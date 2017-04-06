/**
 * Created by JP on 2016/12/19.
 */

'use strict';

var Promise = require('bluebird');
var aliSDK = require('aliyun-sdk');
var _ = require('lodash');

var _buildClient = function (cfg) {
  var ots = new aliSDK.OTS(cfg);
  var filters = [
    'createTable',
    'deleteTable',
    'listTable',
    'describeTable',
    'getRange',
    'getRow',
    'deleteRow',
    'putRow',
    'updateRow',
    'updateTable'
  ];

  Promise.promisifyAll(ots, {
    filter: name => _.includes(filters, name)
  });

  //friendly function for convert ots object to plain object
  var _getRow = function (row) {
    if (row && row.primary_key_columns && row.primary_key_columns.length > 0) {
      var obj = {};
      //process primary columns
      var pk = row.primary_key_columns;
      _.forEach(pk, function (a) {
        _.defaults(obj, _getData(a));
      });
      //process attribute columns
      var attrs = row.attribute_columns;
      _.forEach(attrs, function (a) {
        _.defaults(obj, _getData(a));
      });
      return obj;
    }
    return null;
  };

  var _getData = function (obj) {
    if (obj && obj.name && obj.value) {
      var value = null;
      switch (obj.value.type) {
        case 2:
          value = obj.value.v_int;
          break;
        case 3:
          value = obj.value.v_string;
          break;
        case 4:
          value = obj.value.v_bool;
          break;
        case 5:
          value = obj.value.v_double;
          break;
        case 6:
          value = obj.value.v_binary;
          break;
      }
      if (value) {
        var result = {};
        result[obj.name] = value;
        return result;
      }
    }
    return null;
  };

  /**
   * get range then convert rows to plain object, return bluebird Promise
   * @param opt
   */
  ots.getRange2Async = function (opt) {
    return new Promise(function (resolve, reject) {
      ots
        .getRangeAsync(opt)
        .then(function (data) {
          var result = {
            items: []
          };
          _.forEach(data.rows, function (o) {
            var obj = _getRow(o);
            if (obj) {
              result.items.push(_getRow(o));
            }
          });
          if (data.next_start_primary_key && data.next_start_primary_key.length > 0) {
            result.next = _getData(data.next_start_primary_key[0]);
          }
          resolve(result);
        })
        .catch(function (err) {
          reject(err);
        })
    });
  };

  /**
   * get row then convert row to plain object
   * @param opt
   */
  ots.getRow2Async = function (opt) {
    return new Promise(function (resolve, reject) {
      ots
        .getRowAsync(opt)
        .then(function (data) {
          resolve(_getRow(data.row));
        })
        .catch(function (err) {
          reject(err);
        })
    });
  };

  /**
   * check table if exist in instance or not, return bluebird Promise
   * @param instanceName
   * @param tableName
   */
  ots.isTableExist = function (instanceName, tableName) {
    return new Promise(function (resolve, reject) {
      ots
        .listTableAsync({
          instance_name: instanceName
        })
        .then(function (tables) {
          resolve(_.includes(tables.table_names, tableName));
        })
        .catch(function (err) {
          reject(err);
        })
    });
  };

  /**
   * create table if the table doesn't exist, return bluebird Promise
   * @param opt
   */
  ots.createTableIfNotExist = function (opt) {
    return new Promise(function (resolve, reject) {
      ots
        .isTableExist(opt.instance_name, opt.table_meta.table_name)
        .then(function (exist) {
          if (!exist) {
            return ots.createTableAsync(opt);
          }
        })
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        })
    });
  };

  return ots;
};

function otsStore(args) {

  var instance_name = args.instance_name;
  var table_name = args.table_name;

  var self = {name: 'ali-ots'};

  var client = _buildClient(args);

  //if cache table doesn't exist, create it;
  client.createTableIfNotExist({
    instance_name: instance_name,
    table_meta: {
      table_name: table_name,
      primary_key: [
        {
          name: 'id',
          type: 'STRING'
        }
      ]
    },
    reserved_throughput: {
      capacity_unit: {
        read: 0,
        write: 0
      }
    }
  });

  self.get = function (key) {
    return new Promise(function (resolve, reject) {
      client
        .getRow2Async({
          instance_name: instance_name,
          table_name: table_name,
          primary_key: [
            {
              name: 'id',
              value: {
                type: 'STRING',
                v_string: key.toString()
              }
            }
          ]
        })
        .then(function (data) {
          if (data && data.value) {
            resolve(JSON.parse(data.value));
          }
          else {
            resolve();
          }
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  self.set = function (key, value) {
    return new Promise(function (resolve, reject) {
      client
        .putRowAsync({
          instance_name: instance_name,
          table_name: table_name,
          condition: {
            row_existence: "IGNORE"
          },
          primary_key: [
            {
              name: 'id',
              value: {
                type: 'STRING',
                v_string: key
              }
            }
          ],
          attribute_columns: [
            {
              name: 'value',
              value: {
                type: 'STRING',
                v_string: JSON.stringify(value)
              }
            }
          ]
        })
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    });
  };

  self.del = function (key) {
    return new Promise(function (resolve, reject) {
      client
        .deleteRowAsync({
          instance_name: instance_name,
          table_name: table_name,
          condition: {
            row_existence: "IGNORE"
          },
          primary_key: [
            {
              name: 'id',
              value: {
                type: 'STRING',
                v_string: key
              }
            }
          ]
        })
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        })
    });
  };

  return self;
}

module.exports = {
  create: otsStore
};
