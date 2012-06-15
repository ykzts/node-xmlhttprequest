(function() {
  'use strict';

  var http = require('http');
  var https = require('https');
  var urlparse = require('url').parse;

  function XMLHttpRequest() {
    if (!(this instanceof XMLHttpRequest)) {
      throw new TypeError('DOM object constructor cannot be called as a function.');
    }

    // attributes
    this.readyState = XMLHttpRequest.UNSENT;;

    // request attributes
    this.timeout = null; // todo
    this.withCredentials = false; // todo
    this.upload = null; // todo

    // response attributes
    this.status = 0;
    this.statusText = '';
    this.responseType = ''; // todo
    this.response = ''; // todo
    this.responseText = '';
    this.responseXML = null;
  }

  (function(proto) {
    // private properties
    var _async = true;
    var _client = null;
    var _options = {};
    var _requestHeaders = {};
    var _responseHeaders = {};

    // states values
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

    // callback listeners
    (function(types) {
      var _eventListeners = {};
      types.forEach(function(type) {
        Object.defineProperty(proto, 'on' + type, {
          get: function() {
            var _listener;
            return ((typeof (_listener = _eventListeners[type])) === 'undefined') ? null : _listener;
          },
          set: function(listener) {
            return _eventListeners[type] = listener;
          },
          enumerble: false,
          configurable: false
        });
      });
    })([
      'readystatechange',
      'loadstart',
      'progress', // todo
      'abort',
      'error', // todo
      'load',
      'timeout', // todo
      'loadend'
    ]);

    // methods
    proto.addEventListener = function addEventListener(type, listener, userCapture) {
      this['on' + type] = listener;
    };

    // request methods
    proto.open = function open(method, url, async, user, password) {
      if ((typeof method) === 'undefined' || (typeof url) === 'undefined') {
        throw new TypeError('Not enought arguments');
      }
      _options.method = method;
      (function(_parsedUrlObj) {
        _options.protocol = _parsedUrlObj.protocol || 'http:';
        _options.agent = ((_options.protocol === 'https:') ? https : http).globalAgent;
        _options.host = _parsedUrlObj.hostname || 'localhost';
        _options.port = _parsedUrlObj.port || ((_options.protocol === 'https:') ? 443 : 80);
        _options.path = _parsedUrlObj.path || '/';
      })(urlparse(url));
      if ((typeof async) !== 'undefined') {
        _async = async;
      }
      if ((typeof user) === 'string' && (typeof password) === 'string') {
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

    proto.send = function send(body) {
      _client = new http.ClientRequest(_options);
      _client.on('response', _receiveResponse.bind(this));
      Object.keys(_requestHeaders).forEach(function(key) {
        _client.setHeader(key, _requestHeaders[key]);
      });
      _readyStateChange.call(this, XMLHttpRequest.HEADERS_RECEIVED);
      if ((typeof body) !== 'undefined' && body !== null) {
        _client.write(body);
      }
      _client.end();
    };

    proto.abort = function abort() {
      if (!(_client instanceof http.ClientRequest)) {
        return;
      }
      _client.abort();
      _dispatchEvent.call(this, 'abort');
    };

    // response methods
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

    proto.overrideMimeType = function overrideMimeType() {
      // todo
    };

    // private methods
    var _init = function _init() {
      _client = null;
      _options = {};
      _requestHeaders = {};
      _responseHeaders = {};
    };

    var _readyStateChange = function _readyStateChange(readyState) {
      this.readyState = readyState;
      _dispatchEvent.call(this, 'readystatechange');
    };

    var _dispatchEvent = function _dispatchEvent(type) {
      var _listener;
      if ((typeof (_listener = this['on'+type])) === 'function') {
        _listener.apply(this, [].slice(arguments, 1));
      }
    };

    var _receiveResponse = function _receiveResponse(response) {
      this.status = response.statusCode;
      this.statusText = http.STATUS_CODES[this.status];
      _responseHeaders = response.headers;
      _dispatchEvent.call(this, 'loadstart');
      _readyStateChange.call(this, XMLHttpRequest.LOADING);
      response.addListener('data', function(chunk) {
        _dispatchEvent.call(this, 'progress');
        this.responseText = chunk.toString();
      }.bind(this));
      response.addListener('end', function() {
        _dispatchEvent.call(this, 'load');
        _dispatchEvent.call(this, 'loadend');
        _readyStateChange.call(this, XMLHttpRequest.DONE);
        _init.call(this);
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

  XMLHttpRequest.XMLHttpRequest = XMLHttpRequest;
  XMLHttpRequest.FormData = FormData;
  module.exports = XMLHttpRequest;
})();
