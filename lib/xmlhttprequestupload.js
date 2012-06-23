(function() {
  'use strict';

  var XMLHttpRequestEventTarget = require('./xmlhttprequesteventtarget');

  function XMLHttpRequestUpload() {
    if (!(this instanceof XMLHttpRequestUpload)) {
      throw new TypeError('DOM object constructor cannot be called as a function.');
    }
    XMLHttpRequestEventTarget.call(this);
  }
  XMLHttpRequestUpload.prototype = Object.create(XMLHttpRequestEventTarget.prototype);
  module.exports = XMLHttpRequestUpload;
})();
