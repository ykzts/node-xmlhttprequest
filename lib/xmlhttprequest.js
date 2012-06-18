(function() {
  'use strict';

  var http = require('http');
  var https = require('https');
  var urlparse = require('url').parse;

  function EventTarget() {
    this._eventListeners = {};
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
    EventTarget.call(this);
  }
  XMLHttpRequestEventTarget.prototype = Object.create(EventTarget.prototype);

  (function(proto) {
    // Event handler
    (function(types) {
      types.forEach(function(type) {
        Object.defineProperty(proto, 'on' + type, {
          get: function() {
            var _listener = this._eventListeners[type];
            if (typeof(_listener) !== 'function') {
              return null;
            }
            return _listener;
          },
          set: function(listener) {
            if (typeof(listener) !== 'function') {
              delete this._eventListeners[type];
              return listener;
            }
            return this._eventListeners[type] = listener;
          },
          enumerble: false,
          configurable: false
        });
      });
    })([
      'loadstart',
      'progress',
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
    XMLHttpRequestEventTarget.call(this);
  }
  XMLHttpRequestUpload.prototype = Object.create(XMLHttpRequestEventTarget.prototype);

  function XMLHttpRequest() {
    if (!(this instanceof XMLHttpRequest)) {
      throw new TypeError('DOM object constructor cannot be called as a function.');
    }
    XMLHttpRequestEventTarget.call(this);

    // Private properties
    this._eventListeners = {};
    this._async = true;
    this._client = null;
    this._options = {};
    this._requestHeaders = {};
    this._responseHeaders = {};

    // States
    this.readyState = XMLHttpRequest.UNSENT;

    // Request
    this.timeout = null; // todo
    this.withCredentials = false; // todo
    this.upload = new XMLHttpRequestUpload();

    // Response
    this.status = 0;
    this.statusText = '';
    this.responseType = ''; // todo
    this.response = ''; // todo
    this.responseText = '';
    this.responseXML = null; // not support
  }
  XMLHttpRequest.prototype = Object.create(XMLHttpRequestEventTarget.prototype);

  (function(proto) {
    // Event handler
    Object.defineProperty(proto, 'onreadystatechange', {
      get: function() {
        var _listener = this._eventListeners['readystatechange'];
        if (typeof(_listener) !== 'function') {
          return null;
        }
        return _listener;
      },
      set: function(listener) {
        if (typeof(listener) !== 'function') {
          this._eventListener['readystatechange'] = null;
          return listener;
        }
        return this._eventListeners['readystatechange'] = listener;
      },
      enumerble: false,
      configurable: false
    });

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

    // Request
    proto.open = function open(method, url, async, user, password) {
      if (typeof(method) === 'undefined' || typeof(url) === 'undefined') {
        throw new TypeError('Not enought arguments');
      }
      this._options.method = method;
      (function(_parsedUrlObj) {
        this._options.protocol = (typeof(_parsedUrlObj.protocol) !== 'undefined') ? _parsedUrlObj.protocol : 'http:';
        this._options.agent = ((this._options.protocol === 'https:') ? https : http).globalAgent;
        this._options.host = (typeof(_parsedUrlObj.hostname) !== 'undefined') ? _parsedUrlObj.hostname : 'localhost';
        this._options.port = (typeof(_parsedUrlObj.port) !== 'undefined') ? _parsedUrlObj.port : ((this._options.protocol === 'https:') ? 443 : 80);
        this._options.path = (typeof(_parsedUrlObj.path) !== 'undefined') ? _parsedUrlObj.path : '/';
      }).call(this, urlparse(url));
      this._async = (typeof(async) !== 'undifined') ? async : true;
      if (typeof(user) === 'string' && typeof(password) === 'string') {
        this._options.auth = [user, password].join(':');
      }
      _readyStateChange.call(this, XMLHttpRequest.OPENED);
    };

    proto.setRequestHeader = function setRequestHeader(header, value) {
      if (this.readyState === XMLHttpRequest.UNSENT) {
        throw Error(''); // todo  
      }
      this._requestHeaders[header] = value;
    };

    proto.send = function send(body) {
      if (this.readyState !== XMLHttpRequest.OPENED) {
        throw new Error(); // todo
      }
      this._client = new http.ClientRequest(this._options);
      this._client.on('response', _receiveResponse.bind(this));
      this._client.on('socket', function(socket) {
        socket.on('connect', function() {
          this.upload.dispatchEvent({type: 'loadstart'});
        }.bind(this));
        socket.on('data', function() {
          this.upload.dispatchEvent({type: 'progress'});
        }.bind(this));
        socket.on('end', function() {
          this.upload.dispatchEvent({type: 'load'});
          this.upload.dispatchEvent({type: 'loadend'});
        }.bind(this));
      }.bind(this));
      Object.keys(this._requestHeaders).forEach(function(key) {
        this._client.setHeader(key, this._requestHeaders[key]);
      }, this);
      _readyStateChange.call(this, XMLHttpRequest.HEADERS_RECEIVED);
      if (typeof(body) !== 'undefined' && body !== null) {
        this._client.write(body);
      }
      this._client.end();
    };

    proto.abort = function abort() {
      if (!(this._client instanceof http.ClientRequest)) {
        return;
      }
      this._client.abort();
      this.dispatchEvent({type: 'abort'});
      this.upload.dispatchEvent({type: 'abort'});
    };

    // Response
    proto.getResponseHeader = function getResponseHeader(header) {
      if (this.readyState === XMLHttpRequest.UNSENT || this.readyState === XMLHttpRequest.OPENED) {
        throw new Error(''); // todo;
      }
      return this._responseHeaders[header.toLowerCase()] || null;
    };

    proto.getAllResponseHeaders = function getAllResponseHeaders() {
      if (this.readyState === XMLHttpRequest.UNSENT || this.readyState === XMLHttpRequest.OPENED) {
        throw new Error(''); // todo
      }
      return Object.keys(this._responseHeaders).map(function(key) {
        return [key, this._responseHeaders[key]].join(': ');
      }, this).join('\n');
    };

    proto.overrideMimeType = function overrideMimeType(mime) {
      // todo
    };

    // private methods
    var _readyStateChange = function _readyStateChange(readyState) {
      this.readyState = readyState;
      this.dispatchEvent({type: 'readystatechange'});
    };

    var _receiveResponse = function _receiveResponse(response) {
      this.status = response.statusCode;
      this.statusText = http.STATUS_CODES[this.status];
      this._responseHeaders = response.headers;
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
        this._client = null;
        this._options = {};
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
