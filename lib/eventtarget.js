(function() {
  'use strict';

  function EventTarget() {
    Object.defineProperty(this, '_eventListeners', {
      value: {},
      writable: true,
      enumerable: false,
      configurable: false
    });
  }
  module.exports = EventTarget;

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
})();
