/**
 * @license
 * Copyright (c) 2012-2023 Yamagishi Kazutoshi
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

import { Blob } from 'buffer';
import File from './file';

/**
 * @see {@link https://xhr.spec.whatwg.org/#formdataentryvalue XMLHttpRequest Standard - typedef (File or USVString) FormDataEntryValue}
 */
export type FormDataEntryValue = File | string;

/**
 * @see {@link https://xhr.spec.whatwg.org/#interface-formdata XMLHttpRequest Standard - 5. Interface FormData}
 */
export default class FormData {
  #entryList = new Map<string, Set<FormDataEntryValue>>();

  /**
   * @see {@link https://xhr.spec.whatwg.org/#dom-formdata-append XMLHttpRequest Standard - The append(name, value) and append(name, blobValue, filename) method}
   */
  append(name: string, value: string): void;
  append(name: string, blobValue: Blob, filename?: string): void;
  append(name: string, value: Blob | string, ...args: string[]): void {
    let entry: FormDataEntryValue;

    if (value instanceof Blob) {
      const filename = args[0] ?? (value instanceof File ? value.name : 'blob');
      entry = new File([value], filename, { type: value.type });
    } else {
      entry = value;
    }

    const entrySet = this.#entryList.get(name);

    if (entrySet) {
      entrySet.add(entry);
    } else {
      this.#entryList.set(name, new Set<FormDataEntryValue>([entry]));
    }
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#dom-formdata-delete XMLHttpRequest Standard - The delete(name) method}
   */
  delete(name: string): void {
    this.#entryList.delete(name);
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#dom-formdata-get XMLHttpRequest Standard - The get(name) method}
   */
  get(name: string): FormDataEntryValue | undefined {
    const entrySet = this.#entryList.get(name);

    if (!entrySet) {
      return;
    }

    return [...entrySet][0];
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#dom-get-getall XMLHttpRequest Standard - The getAll(name) method}
   */
  getAll(name: string): FormDataEntryValue[] {
    const entrySet = this.#entryList.get(name);

    return entrySet ? [...entrySet] : [];
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#dom-formdata-has XMLHttpRequest Standard - The has(name) method}
   */
  has(name: string): boolean {
    return this.#entryList.has(name);
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#dom-formdata-set XMLHttpRequest Standard - The set(name, value) and set(name, blobValue, filename) method}
   */
  set(name: string, value: string): void;
  set(name: string, blobValue: Blob, filename: string): void;
  set(name: string, value: Blob | string, ...args: string[]): void {
    let entry: FormDataEntryValue;

    if (value instanceof Blob) {
      const filename = args[0] ?? (value instanceof File ? value.name : 'blob');
      entry = new File([value], filename, { type: value.type });
    } else {
      entry = value;
    }

    this.#entryList.set(name, new Set<FormDataEntryValue>([entry]));
  }

  *[Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]> {
    for (const [name, entrySet] of this.#entryList.entries()) {
      for (const entry of entrySet.values()) {
        yield [name, entry];
      }
    }
  }
}
