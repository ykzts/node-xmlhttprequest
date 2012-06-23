(function() {
  'use strict';

  var XMLHttpRequest = require('./xmlhttprequest');

  function AnonXMLHttpRequest() {
    if (!(this instanceof AnonXMLHttpRequest)) {
      throw new TypeError('DOM object constructor cannot be called as a function');
    }
    XMLHttpRequest.call(this);
  }
  AnonXMLHttpRequest.prototype = Object.create(XMLHttpRequest.prototype);
  module.exports = AnonXMLHttpRequest;
})();
