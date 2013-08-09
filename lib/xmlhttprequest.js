// The MIT License (MIT)
//
// Copyright (c) 2011-2013 Yamagishi Kazutoshi
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
(function(global) {
  'use strict';

  var http = require('http');
  var https = require('https');
  var urlparse = require('url').parse;

  var Event = require('./event');
  var ProgressEvent = require('./progressevent');
  var XMLHttpRequestEventTarget = require('./xmlhttprequesteventtarget');
  var XMLHttpRequestUpload = require('./xmlhttprequestupload');

  var XMLHttpRequestResponseType = [
    '',
    'arraybuffer',
    'blob',
    'document',
    'json',
    'text'
  ];

  function XMLHttpRequest() {
    if (!(this instanceof XMLHttpRequest)) {
      throw new TypeError('DOM object constructor cannot be called as a function.');
    }
    XMLHttpRequestEventTarget.call(this);

    // States
    this.readyState = XMLHttpRequest.UNSENT;

    // Request
    this.timeout = null; // todo
    this.withCredentials = false; // todo
    this.upload = new XMLHttpRequestUpload();

    // Response
    this.status = 0;
    this.statusText = '';
  }

  XMLHttpRequest.prototype = Object.create(XMLHttpRequestEventTarget.prototype);

  (function(proto) {
    (function() {
      var constants = {
        UNSENT: {
          configurable: false,
          enumerable: true,
          value: 0,
          writable: false
        },
        OPENED: {
          configurable: false,
          enumerable: true,
          value: 1,
          writable: false
        },
        HEADERS_RECEIVED: {
          configurable: false,
          enumerable: true,
          value: 2,
          writable: false
        },
        LOADING: {
          configurable: false,
          enumerable: true,
          value: 3,
          writable: false
        },
        DONE: {
          configurable: false,
          enumerable: true,
          value: 4,
          writable: false
        }
      };

      Object.defineProperties(XMLHttpRequest, constants);
      Object.defineProperties(proto, constants);
    })();
    Object.defineProperties(proto, {
      _properties: {
        configurable: false,
        enumerable: false,
        value: Object.create(Object.prototype, {
          async: {
            configurable: false,
            enumerable: true,
            value: false,
            writable: true,
          },
          clinet: {
            configurable: false,
            enumerable: true,
            value: null,
            writable: true,
          },
          options: {
            configurable: false,
            enumerable: true,
            value: {},
            writable: true,
          },
          responseHeaders: {
            configurable: false,
            enumerable: true,
            value: {},
            writable: true,
          },
          responseBuffer: {
            configurable: false,
            enumerable: true,
            value: null,
            writable: true,
          },
          responseType: {
            configurable: false,
            enumerable: true,
            value: '',
            writable: true,
          },
          requestHeaders: {
            configurable: false,
            enumerable: true,
            value: {},
            writable: true,
          }
        }),
        writable: false
      },
      responseType: (function() {
        return {
          configurable: false,
          enumerable: true,
          get: function getter() {
            var responseType = this._properties.responseType;
            if (XMLHttpRequestResponseType.indexOf(responseType) < 0) {
              return '';
            }
            return responseType;
          },
          set: function setter(responseType) {
            if (XMLHttpRequestResponseType.indexOf(responseType) < 0) {
              throw new Error(''); // todo
            }
            return this._properties.responseType = responseType;
          }
        };
      })(),
      response: {
        configurable: false,
        enumerable: true,
        get: function getter() {
          var responseBuffer = this._properties.responseBuffer;
          if (!(responseBuffer instanceof Buffer)) {
            return '';
          }
          switch (this.responseType) {
            case '':
              return this.responseText;
            case 'arraybuffer':
            case 'blob':
              return (new Uint8Array(responseBuffer)).buffer;
            case 'document':
              return null; // todo
            case 'json':
              return JSON.parse(this.responseText);
            case 'text':
              return this.responseText;
            default:
              return '';
          }
        }
      },
      responseText: {
        configurable: false,
        enumerable: true,
        get: function getter() {
          var responseBuffer = this._properties.responseBuffer;
          if (!(responseBuffer instanceof Buffer)) {
            return '';
          }
          return responseBuffer.toString();
        }
      },
      responseXML: {
        configurable: false,
        enumerable: true,
        value: null, // todo
        writable: false
      }
    });

    function _readyStateChange(readyState) {
      var readyStateChangeEvent = new Event('readystatechange', true, true);
      this.readyState = readyState;
      this.dispatchEvent(readyStateChangeEvent);
    }

    function _receiveResponse(response) {
      var contentLength = '0';
      var bufferLength = 0;
      var byteOffset = 0;
      this.status = response.statusCode;
      this.statusText = http.STATUS_CODES[this.status];
      this._properties.responseHeaders = response.headers;
      if ((contentLength = response.headers['content-length'])) {
        bufferLength = parseInt(contentLength, 10);
      }
      this._properties.responseBuffer = new Buffer(bufferLength);
      _readyStateChange.call(this, XMLHttpRequest.LOADING);
      response.addListener('data', function(chunk) {
        var buffer;
        if (bufferLength === 0) {
          buffer = this._properties.responseBuffer;
          this._properties.responseBuffer = new Buffer(buffer.length + chunk.length);
          buffer.copy(this._properties.responseBuffer);
        }
        chunk.copy(this._properties.responseBuffer, byteOffset);
        byteOffset += chunk.length;
      }.bind(this));
      response.addListener('end', function() {
        _readyStateChange.call(this, XMLHttpRequest.DONE);
        this._properties.client = null;
        this._properties.options = {};
      }.bind(this));
    }

    function _setDispatchProgressEvents(stream) {
      var loadStartEvent = new ProgressEvent('loadstart');
      this.dispatchEvent(loadStartEvent);;
      stream.on('data', function() {
        var progressEvent = new ProgressEvent('progress');
        this.dispatchEvent(progressEvent);
      }.bind(this));
      stream.on('end', function() {
        var loadEvent = new ProgressEvent('load');
        var loadEndEvent = new ProgressEvent('loadend')
        this.dispatchEvent(loadEvent);
        this.dispatchEvent(loadEndEvent);
      }.bind(this));
    }

    proto.abort = function abort() {
      if (!(this._properties.client instanceof http.ClientRequest)) {
        return;
      }
      this._properties.client.abort();
      this.dispatchEvent(new ProgressEvent('abort'));
      this.upload.dispatchEvent(new ProgressEvent('abort'));
    };

    proto.getAllResponseHeaders = function getAllResponseHeaders() {
      if (this.readyState === XMLHttpRequest.UNSENT || this.readyState === XMLHttpRequest.OPENED) {
        throw new Error(''); // todo
      }
      return Object.keys(this._properties.responseHeaders).map(function(key) {
        return [key, this._properties.responseHeaders[key]].join(': ');
      }, this).join('\n');
    };

    proto.getResponseHeader = function getResponseHeader(header) {
      if (this.readyState === XMLHttpRequest.UNSENT || this.readyState === XMLHttpRequest.OPENED) {
        throw new Error(''); // todo;
      }
      var value = this._properties.responseHeaders[header.toLowerCase()];
      return (typeof(value) !== 'undefined') ? value : null;
    };

    proto.open = function open(method, url, async, user, password) {
      if (typeof(method) === 'undefined' || typeof(url) === 'undefined') {
        throw new TypeError('Not enought arguments');
      }
      this._properties.options.method = method;
      (function(_parsedUrlObj) {
        this._properties.options.protocol = (typeof(_parsedUrlObj.protocol) !== 'undefined') ? _parsedUrlObj.protocol : 'http:';
        this._properties.options.agent = ((this._properties.options.protocol === 'https:') ? https : http).globalAgent;
        this._properties.options.host = (typeof(_parsedUrlObj.hostname) !== 'undefined') ? _parsedUrlObj.hostname : 'localhost';
        this._properties.options.port = (typeof(_parsedUrlObj.port) !== 'undefined') ? _parsedUrlObj.port : ((this._properties.options.protocol === 'https:') ? 443 : 80);
        this._properties.options.path = (typeof(_parsedUrlObj.path) !== 'undefined') ? _parsedUrlObj.path : '/';
      }).call(this, urlparse(url));
      this._properties.async = (typeof(async) !== 'undifined') ? async : true;
      if (typeof(user) === 'string' && typeof(password) === 'string') {
        this._properties.options.auth = [user, password].join(':');
      }
      _readyStateChange.call(this, XMLHttpRequest.OPENED);
    };

    proto.overrideMimeType = function overrideMimeType(mime) {
      // todo
    };

    proto.send = function send(body) {
      if (this.readyState !== XMLHttpRequest.OPENED) {
        throw new Error(); // todo
      }
      this._properties.client = new http.ClientRequest(this._properties.options);
      this._properties.client.on('response', _setDispatchProgressEvents.bind(this));
      this._properties.client.on('response', _receiveResponse.bind(this));
      Object.keys(this._properties.requestHeaders).forEach(function(key) {
        this._properties.client.setHeader(key, this._properties.requestHeaders[key]);
      }, this);
      _readyStateChange.call(this, XMLHttpRequest.HEADERS_RECEIVED);
      if (typeof(body) !== 'undefined' && body !== null) {
        this._properties.client.on('socket', _setDispatchProgressEvents.bind(this.upload));
        this._properties.client.write(body);
      }
      this._properties.client.end();
    };

    proto.setRequestHeader = function setRequestHeader(header, value) {
      if (this.readyState === XMLHttpRequest.UNSENT) {
        throw new Error(''); // todo  
      }
      this._properties.requestHeaders[header] = value;
    };
  })(XMLHttpRequest.prototype);

  module.exports = XMLHttpRequest;
})(this);
