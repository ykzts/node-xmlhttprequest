(function() {
  'use strict';

  function FormData() {
    if (!(this instanceof FormData)) {
      throw new TypeError('DOM object constructor cannot be called as a function.');
    }
  }
  module.exports = FormData;

  (function(proto) {
    proto.append = function append(name, value, filename) {
      // todo
    };
  })(FormData.prototype);
})();
