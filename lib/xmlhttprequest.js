(function() {
  'use strict';

  var http = require('http');
  var https = require('https');
  var urlparse = require('url').parse;

  function EventTarget() {
  }

  (function(proto) {
    proto.addEventListener = function addEventListener(type, listener, useCapture) {
      this['on' + type] = listener;
    };

    proto.dispatchEvent = function dispatchEvent(event) {
      var _listener = this['on' + event.type];
      if (typeof(_listener) === 'function') {
        _listener.call(this, event);
      }
    };

    proto.removeEventListener = function removeEventListener(type, listener, useCapture) {
      // todo
    };
  })(EventTarget.prototype);

  function XMLHttpRequestEventTarget() {
  }
  XMLHttpRequestEventTarget.prototype = Object.create(EventTarget.prototype);

  (function(proto) {
    // Event handler
    (function(types) {
      var _eventListeners = {};
      types.forEach(function(type) {
        Object.defineProperty(proto, 'on' + type, {
          get: function() {
            var _listener = _eventListeners[type];
            if (typeof(_listener) !== 'function') {
              return null;
            }
            return _listener;
          },
          set: function(listener) {
            if (typeof(listener) !== 'function') {
              delete _eventListeners[type];
              return listener;
            }
            return _eventListeners[type] = listener;
          },
          enumerble: false,
          configurable: false
        });
      });
    })([
      'loadstart',
      'progress', // todo
      'abort',
      'error', // todo
      'load',
      'timeout', // todo
      'loadend'
    ]);
  })(XMLHttpRequestEventTarget.prototype);

  function XMLHttpRequestUpload() {
    if (!(this instanceof XMLHttpRequestUpload)) {
      throw new TypeError('DOM object constructor cannot be called as a function.');
    }
  }
  XMLHttpRequestUpload.prototype = Object.create(XMLHttpRequestEventTarget.prototype);

  function XMLHttpRequest() {
    if (!(this instanceof XMLHttpRequest)) {
      throw new TypeError('DOM object constructor cannot be called as a function.');
    }
  }
  XMLHttpRequest.prototype = Object.create(XMLHttpRequestEventTarget.prototype);

  (function(proto) {
    // private properties
    var _async = true;
    var _client = null;
    var _options = {};
    var _requestHeaders = {};
    var _responseHeaders = {};

    // Event handler
    (function() {
      var _eventListener = null;
      Object.defineProperty(proto, 'onreadystatechange', {
        get: function() {
          if (typeof(_eventListener) !== 'function') {
            return null;
          }
          return _eventListener;
        },
        set: function(listener) {
          if (typeof(listener) !== 'function') {
            _eventListener = null;
            return listener;
          }
          return _eventListener = listener;
        },
        enumerble: false,
        configurable: false
      });
    })();

    // States
    (function(states) {
      var _objs = [XMLHttpRequest, proto];
      Object.keys(states).forEach(function(prop) {
        var _value = states[prop];
        _objs.forEach(function(_obj) {
          Object.defineProperty(_obj, prop, {
            value: _value,
            writable: false,
            enumerable: true,
            configurable: false
          });
        });
      });
    })({
      UNSENT: 0,
      OPENED: 1,
      HEADERS_RECEIVED: 2,
      LOADING: 3,
      DONE: 4
    });

    proto.readyState = XMLHttpRequest.UNSENT;

    // Request
    proto.open = function open(method, url, async, user, password) {
      if (typeof(method) === 'undefined' || typeof(url) === 'undefined') {
        throw new TypeError('Not enought arguments');
      }
      _options.method = method;
      (function(_parsedUrlObj) {
        _options.protocol = (typeof(_parsedUrlObj.protocol) !== 'undefined') ? _parsedUrlObj.protocol : 'http:';
        _options.agent = ((_options.protocol === 'https:') ? https : http).globalAgent;
        _options.host = (typeof(_parsedUrlObj.hostname) !== 'undefined') ? _parsedUrlObj.hostname : 'localhost';
        _options.port = (typeof(_parsedUrlObj.port) !== 'undefined') ? _parsedUrlObj.port : ((_options.protocol === 'https:') ? 443 : 80);
        _options.path = (typeof(_parsedUrlObj.path) !== 'undefined') ? _parsedUrlObj.path : '/';
      })(urlparse(url));
      _async = (typeof(async) !== 'undifined') ? async : true;
      if (typeof(user) === 'string' && typeof(password) === 'string') {
        _options.auth = [user, password].join(':');
      }
      _readyStateChange.call(this, XMLHttpRequest.OPENED);
    };

    proto.setRequestHeader = function setRequestHeader(header, value) {
      if (this.readyState === XMLHttpRequest.UNSENT) {
        throw Error(''); // todo  
      }
      _requestHeaders[header] = value;
    };

    proto.timeout = null; // todo

    proto.withCredentials = false; // todo

    proto.upload = new XMLHttpRequestUpload(); // todo

    proto.send = function send(body) {
      if (this.readyState !== XMLHttpRequest.OPENED) {
        throw new Error(); // todo
      }
      _client = new http.ClientRequest(_options);
      _client.on('response', _receiveResponse.bind(this));
      Object.keys(_requestHeaders).forEach(function(key) {
        _client.setHeader(key, _requestHeaders[key]);
      });
      _readyStateChange.call(this, XMLHttpRequest.HEADERS_RECEIVED);
      if (typeof(body) !== 'undefined' && body !== null) {
        _client.write(body);
      }
      _client.end();
    };

    proto.abort = function abort() {
      if (!(_client instanceof http.ClientRequest)) {
        return;
      }
      _client.abort();
      this.dispatchEvent({type: 'abort'});
    };

    // Response
    proto.status = 0;

    proto.statusText = '';

    proto.getResponseHeader = function getResponseHeader(header) {
      if (this.readyState === XMLHttpRequest.UNSENT || this.readyState === XMLHttpRequest.OPENED) {
        throw new Error(''); // todo;
      }
      return _responseHeaders[header.toLowerCase()] || null;
    };

    proto.getAllResponseHeaders = function getAllResponseHeaders() {
      if (this.readyState === XMLHttpRequest.UNSENT || this.readyState === XMLHttpRequest.OPENED) {
        throw new Error(''); // todo
      }
      return Object.keys(_responseHeaders).map(function(key) {
        return [key, _responseHeaders[key]].join(': ');
      }).join('\n');
    };

    proto.overrideMimeType = function overrideMimeType(mime) {
      // todo
    };

    proto.responseType = ''; // todo

    proto.response = ''; // todo

    proto.responseText = '';

    proto.responseXML = null; // not support

    // private methods
    var _readyStateChange = function _readyStateChange(readyState) {
      this.readyState = readyState;
      this.dispatchEvent({type: 'readystatechange'});
    };

    var _receiveResponse = function _receiveResponse(response) {
      this.status = response.statusCode;
      this.statusText = http.STATUS_CODES[this.status];
      _responseHeaders = response.headers;
      this.dispatchEvent({type: 'loadstart'});
      _readyStateChange.call(this, XMLHttpRequest.LOADING);
      response.addListener('data', function(chunk) {
        this.dispatchEvent({type: 'progress'});
        this.responseText = chunk.toString();
      }.bind(this));
      response.addListener('end', function() {
        this.dispatchEvent({type: 'load'});
        this.dispatchEvent({type: 'loadend'});
        _readyStateChange.call(this, XMLHttpRequest.DONE);
        _client = null;
        _options = {};
      }.bind(this));
    };
  })(XMLHttpRequest.prototype);

  function FormData() {
    if (!(this instanceof FormData)) {
      throw new TypeError('DOM object constructor cannot be called as a function.');
    }
  }

  (function(proto) {
    proto.append = function append(name, value, filename) {
      // todo
    };
  })(FormData.prototype);

  XMLHttpRequest.XMLHttpRequestUpload = XMLHttpRequestUpload;
  XMLHttpRequest.XMLHttpRequest = XMLHttpRequest;
  XMLHttpRequest.FormData = FormData;
  module.exports = XMLHttpRequest;
})();
