// The MIT License (MIT)
//
// Copyright (c) 2013-2020 Yamagishi Kazutoshi
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

import { performance } from 'perf_hooks';
import EventTarget from './eventtarget';

export const internalEventSymbol = Symbol('InternalEvent');

export interface EventInit {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

export class InternalEvent {
  canceled: boolean;
  immediatePropagationStoped: boolean;
  initialized: boolean;
  propagationStoped: boolean;

  bubbles: boolean;
  cancelable: boolean;
  eventPhase: number;
  target: EventTarget | null;
  timeStamp: number;
  type: string;

  constructor(type: string, eventInit: EventInit) {
    this.canceled = false;
    this.immediatePropagationStoped = false;
    this.initialized = true;
    this.propagationStoped = false;

    this.bubbles = eventInit.bubbles ?? false;
    this.cancelable = eventInit.cancelable ?? false;
    this.eventPhase = Event.NONE;
    this.target = null;
    this.timeStamp = performance.now();
    this.type = type;
  }
}

/**
 * @see {@link https://dom.spec.whatwg.org/#interface-event DOM Standard - 2.2. Interface Event}
 */
export default class Event {
  static readonly NONE = 0;
  static readonly CAPTURING_PHASE = 1;
  static readonly AT_TARGET = 2;
  static readonly BUBBLING_PHASE = 3;

  readonly NONE = Event.NONE;
  readonly CAPTURING_PHASE = Event.CAPTURING_PHASE;
  readonly AT_TARGET = Event.AT_TARGET;
  readonly BUBBLING_PHASE = Event.BUBBLING_PHASE;

  [internalEventSymbol]: InternalEvent;

  get bubbles(): boolean {
    return this[internalEventSymbol].bubbles;
  }

  get cancelable(): boolean {
    return this[internalEventSymbol].cancelable;
  }

  get currentTarget(): EventTarget | null {
    return this[internalEventSymbol].target;
  }

  get defaultPrevented(): boolean {
    return this[internalEventSymbol].canceled;
  }

  get eventPhase(): number {
    return this[internalEventSymbol].eventPhase;
  }

  /**
   * @todo Make the value changeable.
   */
  get isTrusted(): boolean {
    return true;
  }

  get target(): EventTarget | null {
    return this[internalEventSymbol].target;
  }

  get timeStamp(): number {
    return this[internalEventSymbol].timeStamp;
  }

  get type(): string {
    return this[internalEventSymbol].type;
  }

  constructor(type: string, eventInit: EventInit = {}) {
    if (!type) throw new TypeError('Not enough arguments.');

    Object.defineProperty(this, internalEventSymbol, {
      enumerable: false,
      value: new InternalEvent(type, {
        bubbles: eventInit.bubbles ?? false,
        cancelable: eventInit.cancelable ?? false
      }),
      writable: true
    });
  }

  preventDefault(): void {
    if (this.cancelable && !this[internalEventSymbol].canceled) {
      this[internalEventSymbol].canceled = true;
    }
  }

  stopImmediatePropagation(): void {
    if (!this[internalEventSymbol].immediatePropagationStoped) {
      this[internalEventSymbol].immediatePropagationStoped = true;
    }
  }

  stopPropagation(): void {
    if (!this[internalEventSymbol].propagationStoped) {
      this[internalEventSymbol].propagationStoped = true;
    }
  }
}
