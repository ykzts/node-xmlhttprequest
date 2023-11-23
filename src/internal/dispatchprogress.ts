/**
 * @license
 * Copyright (c) 2023 Yamagishi Kazutoshi
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

type DispatchProgressOptions = {
  target: EventTarget;
  total?: number;
};

export class DispatchProgressTransformer
  implements Transformer<Uint8Array, Uint8Array>
{
  readonly #target: EventTarget;
  readonly #total: number;

  #loaded = 0;

  constructor({ target, total = 0 }: DispatchProgressOptions) {
    this.#target = target;
    this.#total = total;
  }

  flush() {
    console.log('flush');

    this.#target.dispatchEvent(
      new ProgressEvent('load', {
        loaded: this.#loaded,
        total: this.#total
      })
    );
    this.#target.dispatchEvent(
      new ProgressEvent('loadend', {
        loaded: this.#loaded,
        total: this.#total
      })
    );
  }

  start() {
    console.log('start');

    this.#target.dispatchEvent(
      new ProgressEvent('loadstart', {
        loaded: this.#loaded,
        total: this.#total
      })
    );
  }

  transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController<Uint8Array>
  ) {
    controller.enqueue(chunk);

    console.log('transform: ', chunk);

    this.#loaded += chunk.length;

    this.#target.dispatchEvent(
      new ProgressEvent('progress', {
        loaded: this.#loaded,
        total: this.#total
      })
    );
  }
}

export class DispatchProgressStream
  implements TransformStream<Uint8Array, Uint8Array>
{
  readonly #transformStream: TransformStream<Uint8Array, Uint8Array>;

  constructor({ target, total = 0 }: DispatchProgressOptions) {
    this.#transformStream = new TransformStream(
      new DispatchProgressTransformer({ target, total })
    );
  }

  get readable(): ReadableStream<Uint8Array> {
    return this.#transformStream.readable;
  }

  get writable(): WritableStream<Uint8Array> {
    return this.#transformStream.writable;
  }
}
