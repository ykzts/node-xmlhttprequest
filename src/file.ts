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

import { Blob, type BlobOptions } from 'buffer';
import { type BinaryLike } from 'crypto';

/**
 * @see {@link https://w3c.github.io/FileAPI/#typedefdef-blobpart File API - typedef (BufferSource or Blob or USVString) BlobPart}
 */
export type BlobPart = BinaryLike | Blob;

/**
 * @see {@link https://w3c.github.io/FileAPI/#dfn-FilePropertyBag File API - interface FilePropertyBag}
 */
export interface FilePropertyBag extends BlobOptions {
  lastModified?: number;
}

/**
 * @see {@link https://w3c.github.io/FileAPI/#dfn-file File API - interface File}
 */
export default class File extends Blob {
  #lastModifiled: number;
  #name: string;

  constructor(
    fileBits: BlobPart[],
    fileName: string,
    options?: FilePropertyBag
  ) {
    const { lastModified = Date.now(), ...blobPropertyBag } = options ?? {};

    super(fileBits, blobPropertyBag);

    this.#name = fileName;
    this.#lastModifiled = lastModified;
  }

  get lastModified(): number {
    return this.#lastModifiled;
  }

  get name(): string {
    return this.#name;
  }
}
