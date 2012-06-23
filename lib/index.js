(function() {
  'use strict';

  var XMLHttpRequestUpload = require('./xmlhttprequestupload');
  var XMLHttpRequest = require('./xmlhttprequest');
  var AnonXMLHttpRequest = require('./anonxmlhttprequest');
  var FormData = require('./formdata');

  module.exports = {
    XMLHttpRequestUpload: XMLHttpRequestUpload,
    XMLHttpRequest: XMLHttpRequest,
    AnonXMLHttpRequest: AnonXMLHttpRequest,
    FormData: FormData
  };
})();
