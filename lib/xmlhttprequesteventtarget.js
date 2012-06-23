(function() {
  'use strict';

  var EventTarget = require('./eventtarget');

  function XMLHttpRequestEventTarget() {
    EventTarget.call(this);
  }
  XMLHttpRequestEventTarget.prototype = Object.create(EventTarget.prototype);
  module.exports = XMLHttpRequestEventTarget;

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
          enumerable: true,
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
})();
