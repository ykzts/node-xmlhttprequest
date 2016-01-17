/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2016 Yamagishi Kazutoshi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

const constants = require('./constants');

const OVERRIDE_PROTECTION_DESCRIPTOR = constants.OVERRIDE_PROTECTION_DESCRIPTOR;

class Event {
  constructor(type) {
    if (arguments.length === 0) {
      throw new TypeError('Not enough arguments.');
    }
    const timeStampDiscriptor = {};
    Object.assign(timeStampDiscriptor, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: Date.now()
    });
    Object.defineProperty(this, 'timeStamp', timeStampDiscriptor);
    if (typeof type !== 'undefined') {
      this.initEvent(type);
    }
  }

  get defaultPrevented() {
    const eventFlag = this._flag;
    return !eventFlag.canceled;
  }

  initEvent(type, cancelable, bubbles) {
    var eventFlag = this._flag;
    eventFlag.initialized = true;
    if (!eventFlag.dispatch) {
      Object.defineProperties(this, {
        bubbles: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
          value: !!bubbles
        }),
        cancelable: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
          value: !!cancelable
        }),
        type: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
          value: '' + type
        })
      });
    }
  }

  preventDefault() {
    const eventFlag = this._flag;
    if (this.cancelable && !eventFlag.canceled) {
      eventFlag.canceled = true;
    }
  }

  stopImmediatePropagation() {
    const eventFlag = this._flag;
    if (!eventFlag.stopImmediatePropagation) {
      this._flag.stopImmediatePropagation = true;
    }
  }

  stopPropagation() {
    const eventFlag = this._flag;
    if (!eventFlag.stopPropagation) {
      this._flag.stopPropagation = true;
    }
  }
}

(function() {
  const eventConstants = {
    NONE: {
      configurable: false,
      enumerable: true,
      value: 0,
      writable: false
    },
    CAPTURING_PHASE: {
      configurable: false,
      enumerable: true,
      value: 1,
      writable: false
    },
    AT_TARGET: {
      configurable: false,
      enumerable: true,
      value: 2,
      writable: false
    },
    BUBBLING_PHASE: {
      configurable: false,
      enumerable: true,
      value: 3,
      writable: false
    }
  };
  const props = {
    _flag: {
      configurable: false,
      enumerable: false,
      value: Object.create(Object.prototype, (function() {
        const defaultDiscriptor = {
          configurable: false,
          enumerable: true,
          value: false,
          writable: true
        };
        return {
          canceled: Object.assign({}, defaultDiscriptor),
          dispatch: Object.assign({}, defaultDiscriptor),
          initialized: Object.assign({}, defaultDiscriptor),
          stopImmediatePropagation: Object.assign({}, defaultDiscriptor),
          stopPropagation: Object.assign({}, defaultDiscriptor)
        };
      })),
      writable: false
    },
    bubbles: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: false
    }),
    cancelable: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: false
    }),
    currentTarget: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: null
    }),
    eventPhase: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: Event.NONE
    }),
    isTrusted: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: false
    }),
    target: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: null
    }),
    timeStamp: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: 0
    }),
    type: Object.assign({}, OVERRIDE_PROTECTION_DESCRIPTOR, {
      value: ''
    })
  };
  Object.defineProperties(Event, eventConstants);
  Object.defineProperties(Event.prototype, Object.assign(
    {}, eventConstants, props));
})();

module.exports = Event;
