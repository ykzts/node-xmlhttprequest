// The MIT License (MIT)
//
// Copyright (c) 2012-2020 Yamagishi Kazutoshi
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

import Event, { internalEventSymbol } from './event';

interface EventListenerOptions {
  capture?: boolean;
}

interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
}

interface EventListener {
  (event: Event): void;
}

/**
 * @see {@link https://dom.spec.whatwg.org/#interface-eventtarget DOM Standard - 2.7. Interface EventTarget}
 */
export default class EventTarget {
  #listeners: {
    [type: string]: Set<EventListener>;
  };

  constructor() {
    this.#listeners = {};
  }

  addEventListener(
    type: string,
    listener: EventListener,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: boolean | AddEventListenerOptions = false
  ): void {
    this.#listeners[type] = this.#listeners[type] ?? new Set<EventListener>();

    if (!this.#listeners[type].has(listener)) {
      this.#listeners[type].add(listener);
    }
  }

  dispatchEvent(event: Event): boolean {
    event[internalEventSymbol].eventPhase = Event.CAPTURING_PHASE;
    event[internalEventSymbol].target = this;
    event[internalEventSymbol].eventPhase = Event.AT_TARGET;

    const listeners = this.#listeners[event.type];

    if (listeners && !event[internalEventSymbol].propagationStoped) {
      for (const listener of listeners) {
        listener.call(this, event);
      }
    }

    if (event.bubbles) {
      event[internalEventSymbol].eventPhase = Event.BUBBLING_PHASE;
    }

    event[internalEventSymbol].eventPhase = Event.NONE;

    return event.defaultPrevented;
  }

  removeEventListener(
    type: string,
    listener: EventListener,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: boolean | EventListenerOptions = false
  ): void {
    if (this.#listeners[type]) {
      this.#listeners[type].delete(listener);
    }
  }
}
