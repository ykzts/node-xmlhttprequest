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

import Event, { EventInit } from './dom/event';

/**
 * @see {@link https://xhr.spec.whatwg.org/#interface-progressevent XMLHttpRequest Standard - 6. Interface ProgressEvent}
 */
export interface ProgressEventInit extends EventInit {
  lengthComputable?: boolean;
  loaded?: number;
  total?: number;
}

export default class ProgressEvent extends Event {
  #lengthComputable: boolean;
  #loaded: number;
  #total: number;

  get lengthComputable(): boolean {
    return this.#lengthComputable;
  }

  get loaded(): number {
    return this.#loaded;
  }

  get total(): number {
    return this.#total;
  }

  constructor(type: string, eventInit: ProgressEventInit = {}) {
    super(type, eventInit);

    this.#lengthComputable = eventInit.lengthComputable ?? false;
    this.#loaded = eventInit.loaded ?? 0;
    this.#total = eventInit.total ?? 0;
  }
}
