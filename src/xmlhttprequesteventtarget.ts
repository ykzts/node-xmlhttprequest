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

import EventTarget from './dom/eventtarget';
import EventHandler from './html/eventhandler';

export default class XMLHttpRequestEventTarget extends EventTarget {
  #onabort: EventHandler | null;
  #onerror: EventHandler | null;
  #onload: EventHandler | null;
  #onloadstart: EventHandler | null;
  #onloadend: EventHandler | null;
  #onprogress: EventHandler | null;
  #ontimeout: EventHandler | null;

  get onabort(): EventHandler | null {
    return this.#onabort;
  }

  set onabort(value: EventHandler | null) {
    if (this.#onabort) {
      this.removeEventListener('abort', this.#onabort);
    }

    if (typeof value === 'function') {
      this.#onabort = value;
      this.addEventListener('abort', this.#onabort);
    } else {
      this.#onabort = null;
    }
  }

  get onerror(): EventHandler | null {
    return this.#onerror;
  }

  set onerror(value: EventHandler | null) {
    if (this.#onerror) {
      this.removeEventListener('error', this.#onerror);
    }

    if (typeof value === 'function') {
      this.#onerror = value;
      this.addEventListener('error', this.#onerror);
    } else {
      this.#onerror = null;
    }
  }

  get onload(): EventHandler | null {
    return this.#onload;
  }

  set onload(value: EventHandler | null) {
    if (this.#onload) {
      this.removeEventListener('load', this.#onload);
    }

    if (typeof value === 'function') {
      this.#onload = value;
      this.addEventListener('load', this.#onload);
    } else {
      this.#onload = null;
    }
  }

  get onloadstart(): EventHandler | null {
    return this.#onloadstart;
  }

  set onloadstart(value: EventHandler | null) {
    if (this.#onloadstart) {
      this.removeEventListener('loadstart', this.#onloadstart);
    }

    if (typeof value === 'function') {
      this.#onloadstart = value;
      this.addEventListener('loadstart', this.#onloadstart);
    } else {
      this.#onloadstart = null;
    }
  }

  get onloadend(): EventHandler | null {
    return this.#onloadend;
  }

  set onloadend(value: EventHandler | null) {
    if (this.#onloadend) {
      this.removeEventListener('loadend', this.#onloadend);
    }

    if (typeof value === 'function') {
      this.#onloadend = value;
      this.addEventListener('loadend', this.#onloadend);
    } else {
      this.#onloadend = null;
    }
  }

  get onprogress(): EventHandler | null {
    return this.#onprogress;
  }

  set onprogress(value: EventHandler | null) {
    if (this.#onprogress) {
      this.removeEventListener('progress', this.#onprogress);
    }

    if (typeof value === 'function') {
      this.#onprogress = value;
      this.addEventListener('progress', this.#onprogress);
    } else {
      this.#onprogress = null;
    }
  }

  get ontimeout(): EventHandler | null {
    return this.#ontimeout;
  }

  set ontimeout(value: EventHandler | null) {
    if (this.#ontimeout) {
      this.removeEventListener('timeout', this.#ontimeout);
    }

    if (typeof value === 'function') {
      this.#ontimeout = value;
      this.addEventListener('timeout', this.#ontimeout);
    } else {
      this.#ontimeout = null;
    }
  }

  constructor() {
    super();

    this.#onabort = null;
    this.#onerror = null;
    this.#onload = null;
    this.#onloadstart = null;
    this.#onloadend = null;
    this.#onprogress = null;
    this.#ontimeout = null;
  }
}
