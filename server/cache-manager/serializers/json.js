/**
 * Created by JP on 2016/12/15.
 */

'use strict';
module.exports = {
  serialize: function (object) {
    return JSON.stringify(object);
  },
  deserialize: function (str) {
    return JSON.parse(str);
  }
};
