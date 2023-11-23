/**
 * @license
 * Copyright (c) 2011-2023 Yamagishi Kazutoshi
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

import { DispatchProgressStream } from './internal/dispatchprogress';
import { createEmptyReadableStream } from './internal/readablestream';
import ProgressEvent from './progressevent';
import DOMException from './webidl/domexception';
import XMLHttpRequestEventTarget from './xmlhttprequesteventtarget';
import XMLHttpRequestUpload from './xmlhttprequestupload';

const FORBIDDEN_METHODS = ['connect', 'trace', 'track'];

const ACCEPTABLE_RESPONSE_TYPES = [
  '',
  'arraybuffer',
  'blob',
  'document',
  'json',
  'text'
];

/**
 * @see {@link https://fetch.spec.whatwg.org/#forbidden-header-name Fetch Standard - forbidden header name}
 */
const FORBIDDEN_REQUEST_HEADERS = [
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'cookie',
  'cookie2',
  'date',
  'dnt',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'user-agent',
  'via'
];

/**
 * @see {@link https://fetch.spec.whatwg.org/#forbidden-response-header-name Fetch Standard - forbidden response header name}
 */
const FORBIDDEN_RESPONSE_HEADERS = ['set-cookie', 'set-cookie2'];

/**
 * @see {@link https://tools.ietf.org/html/rfc7230#section-3.2.6 RFC 7230 - HTTP/1.1 Message Syntax and Routing - 3.2.6. Field Value Components}
 */
const HTTP_HEADER_FIELD_NAME_REGEXP = /[!#$%&'*+-.^_`|~a-z0-9]+/;

export type BodyInit =
  | ArrayBuffer
  | FormData
  | URLSearchParams
  | Uint8Array
  | string;

export type XMLHttpRequestResponseType =
  | ''
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text';

/**
 * @see {@link https://xhr.spec.whatwg.org/#interface-xmlhttprequest XMLHttpRequest Standard - 4. Interface XMLHttpRequest}
 */
export default class XMLHttpRequest extends XMLHttpRequestEventTarget {
  static readonly UNSENT = 0;
  static readonly OPENED = 1;
  static readonly HEADERS_RECEIVED = 2;
  static readonly LOADING = 3;
  static readonly DONE = 4;

  readonly UNSENT = XMLHttpRequest.UNSENT;
  readonly OPENED = XMLHttpRequest.OPENED;
  readonly HEADERS_RECEIVED = XMLHttpRequest.HEADERS_RECEIVED;
  readonly LOADING = XMLHttpRequest.LOADING;
  readonly DONE = XMLHttpRequest.DONE;

  readonly upload: XMLHttpRequestUpload = new XMLHttpRequestUpload();

  #abortController = new AbortController();
  #onreadystatechange: EventListener | null = null;
  #request: Request | null = null;
  #response: Response | null = null;
  #responseBuffer: Uint8Array = new Uint8Array();

  #readyState: number = XMLHttpRequest.UNSENT;
  #responseType: XMLHttpRequestResponseType = '';
  #timeout = 0;
  #withCredentials = false;

  get onreadystatechange(): EventListener | null {
    return this.#onreadystatechange;
  }

  set onreadystatechange(value: EventListener | null) {
    if (this.#onreadystatechange) {
      this.removeEventListener('readystatechange', this.#onreadystatechange);
    }

    if (typeof value === 'function') {
      this.#onreadystatechange = value;
      this.addEventListener('readystatechange', this.#onreadystatechange);
    } else {
      this.#onreadystatechange = null;
    }
  }

  get readyState(): number {
    return this.#readyState;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
  get response(): ArrayBufferLike | string | any | null {
    if (this.readyState !== XMLHttpRequest.DONE) {
      return null;
    }

    switch (this.responseType) {
      case 'arraybuffer':
        return this.#responseBuffer.buffer;
      case 'blob':
        return new Blob([this.#responseBuffer]);
      case 'document':
        return this.responseXML;
      case 'json':
        try {
          const text = this.#responseBuffer.toString();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return JSON.parse(text);
        } catch {
          return null;
        }
      default:
        return this.responseText;
    }
  }

  get responseText(): string {
    if (this.responseType !== '' && this.responseType !== 'text') {
      // TODO: Add human readable message.
      throw new DOMException('', 'InvalidStateError');
    }

    if (
      this.readyState !== XMLHttpRequest.LOADING &&
      this.readyState !== XMLHttpRequest.DONE
    ) {
      return '';
    }

    return new TextDecoder().decode(this.#responseBuffer);
  }

  get responseType(): XMLHttpRequestResponseType {
    return this.#responseType;
  }

  set responseType(value: XMLHttpRequestResponseType) {
    if (ACCEPTABLE_RESPONSE_TYPES.includes(value)) {
      if (
        this.readyState === XMLHttpRequest.LOADING ||
        this.readyState === XMLHttpRequest.DONE
      ) {
        // TODO: Add human readable message.
        throw new DOMException('', 'InvalidStateError');
      }

      this.#responseType = value;
    }
  }

  get responseURL(): string {
    return this.#response?.url ?? '';
  }

  get responseXML(): null {
    if (this.responseType !== '' && this.responseType !== 'document') {
      // TODO: Add human readable message.
      throw new DOMException('', 'InvalidStateError');
    }

    if (this.readyState !== XMLHttpRequest.DONE) {
      return null;
    }

    return null;
  }

  get status(): number {
    return this.#response?.status ?? 0;
  }

  get statusText(): string {
    return this.#response?.statusText ?? '';
  }

  get timeout(): number {
    return this.#timeout;
  }

  set timeout(value: number) {
    this.#timeout = value;
  }

  get withCredentials(): boolean {
    return this.#withCredentials;
  }

  set withCredentials(value: boolean) {
    if (
      this.readyState !== XMLHttpRequest.UNSENT &&
      this.readyState !== XMLHttpRequest.OPENED
    ) {
      // TODO: Add human readable message.
      throw new DOMException('', 'InvalidStateError');
    }

    this.#withCredentials = value;
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-abort()-method XMLHttpRequest Standard - 4.5.7. The abort() method}
   */
  abort(): void {
    if (
      this.readyState === XMLHttpRequest.UNSENT ||
      this.readyState === XMLHttpRequest.OPENED ||
      this.readyState === XMLHttpRequest.DONE ||
      !this.#request
    ) {
      return;
    }

    this.#abortController.abort();
    this.#request = null;

    this.#changeReadyState(XMLHttpRequest.UNSENT);

    this.dispatchEvent(new ProgressEvent('abort'));
    this.upload.dispatchEvent(new ProgressEvent('abort'));
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method XMLHttpRequest Standard - 4.6.5. The getAllResponseHeaders() method}
   */
  getAllResponseHeaders(): string {
    if (
      this.readyState === XMLHttpRequest.UNSENT ||
      this.readyState === XMLHttpRequest.OPENED ||
      !this.#response
    ) {
      return '';
    }

    const headerNames = Object.keys(this.#response.headers).sort();

    let result = '';
    for (const name of headerNames) {
      const value = this.#response.headers.get(name);

      if (value) {
        const values = value.split(/\s*,\s*/);

        for (const v of values) {
          result += `${name}: ${v}\r\n`;
        }
      }
    }

    return result;
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-getresponseheader()-method XMLHttpRequest Standard - 4.6.4. The getResponseHeader() method}
   */
  getResponseHeader(name: string): string | null {
    if (
      this.readyState === XMLHttpRequest.UNSENT ||
      this.readyState === XMLHttpRequest.OPENED ||
      !this.#response
    ) {
      return null;
    }

    // Normalize value
    const headerName = `${name}`.toLowerCase();

    if (!HTTP_HEADER_FIELD_NAME_REGEXP.test(headerName)) {
      // TODO: Add human readable message.
      throw new DOMException('', 'SyntaxError');
    }

    if (FORBIDDEN_RESPONSE_HEADERS.includes(headerName)) {
      // TODO: Print human readable warn message.
      return null;
    }

    return this.#response.headers.get(headerName) || null;
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-open()-method 4.5.1. The open() method}
   */
  open(
    method: string,
    url: string,
    async = true,
    username: string | null = null,
    password: string | null = null
  ): void {
    if (!async) {
      // TODO: Add human readable message.
      throw new DOMException('', 'InvalidAccessError');
    }

    if (FORBIDDEN_METHODS.includes(method.toLowerCase())) {
      // TODO: Add human readable message.
      throw new DOMException('', 'SecurityError');
    }

    let parsedURL: URL;

    try {
      parsedURL = new URL(url);
    } catch {
      // TODO: Add human readable message.
      throw new DOMException('', 'SyntaxError');
    }

    parsedURL.username = '';
    parsedURL.password = '';

    this.#request = new Request(parsedURL, {
      method,
      signal: this.#abortController.signal
    });

    if (username && password) {
      this.#request.headers.set(
        'Authorization',
        `Basic ${btoa(`${username}:${password}`)}`
      );
    }

    this.#changeReadyState(XMLHttpRequest.OPENED);
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-overridemimetype()-method XMLHttpRequest Standard - 4.6.7. The overrideMimeType() method}
   */
  overrideMimeType(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mime: string
  ): void {
    // TODO: Unimplemented.
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-send()-method XMLHttpRequest Standard - 4.5.6. The send() method}
   */
  send(body: BodyInit | null = null): void {
    if (this.readyState !== XMLHttpRequest.OPENED || !this.#request) {
      // TODO: Add human readable message.
      throw new DOMException('', 'InvalidStateError');
    }

    const requestInit: RequestInit = {};

    if (body) {
      const bodyInit =
        body instanceof Uint8Array || body instanceof ArrayBuffer
          ? new Blob([body])
          : body;

      if (bodyInit instanceof Blob) {
        Object.assign(requestInit, {
          body: bodyInit.stream().pipeThrough(
            new DispatchProgressStream({
              target: this.upload,
              total: bodyInit.size
            })
          ),
          duplex: 'half'
        });
      } else {
        requestInit.body = bodyInit;
      }
    }

    this.dispatchEvent(new ProgressEvent('loadstart'));

    fetch(this.#request, requestInit)
      .then((response) => {
        this.#changeReadyState(XMLHttpRequest.HEADERS_RECEIVED);

        const rawContentLength = response.headers.get('Content-Length');
        const contentLength = rawContentLength
          ? parseInt(rawContentLength, 10)
          : 0;
        const total = Number.isNaN(contentLength) ? contentLength : 0;

        (response.body || createEmptyReadableStream())
          .pipeThrough(new DispatchProgressStream({ target: this, total }))
          .pipeTo(
            new WritableStream({
              close: () => {
                this.#changeReadyState(XMLHttpRequest.DONE);
              },
              start: () => {
                this.#changeReadyState(XMLHttpRequest.LOADING);
              },
              write: (chunk) => {
                const newBuffer = new Uint8Array(
                  this.#responseBuffer.byteLength + chunk.byteLength
                );
                newBuffer.set(this.#responseBuffer);
                newBuffer.set(chunk, this.#responseBuffer.byteLength);

                this.#responseBuffer = newBuffer;
              }
            })
          )
          .catch((error) => {
            console.error(error);
          });
      })
      .catch(() => {
        this.#changeReadyState(XMLHttpRequest.DONE);

        this.dispatchEvent(new ProgressEvent('error'));
        this.upload.dispatchEvent(new ProgressEvent('error'));
      });

    if (this.#timeout > 0) {
      setTimeout(() => {
        this.#abortController.abort();

        this.#changeReadyState(XMLHttpRequest.DONE);

        this.dispatchEvent(new ProgressEvent('timeout'));
        this.upload.dispatchEvent(new ProgressEvent('timeout'));
      }, this.#timeout);
    }
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-setrequestheader()-method XMLHttpRequest Standard - 4.5.2. The setRequestHeader() method}
   */
  setRequestHeader(name: string, value: string): void {
    if (this.readyState !== XMLHttpRequest.OPENED || !this.#request) {
      // TODO: Add human readable message.
      throw new DOMException('', 'InvalidStateError');
    }

    // Normalize value
    const headerName = `${name}`.toLowerCase();
    const headerValue = `${value}`.trim();

    if (!HTTP_HEADER_FIELD_NAME_REGEXP.test(headerName)) {
      // TODO: Add human readable message.
      throw new DOMException('', 'SyntaxError');
    }

    if (
      FORBIDDEN_REQUEST_HEADERS.includes(headerName) ||
      headerName.startsWith('proxy-') ||
      headerName.startsWith('sec-')
    ) {
      // TODO: Print human readable warn message.
      return;
    }

    try {
      this.#request.headers.set(headerName, headerValue);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';

      throw new DOMException(message, 'SyntaxError');
    }
  }

  #changeReadyState(readyState: number): void {
    this.#readyState = readyState;
    this.dispatchEvent(new Event('readystatechange'));
  }
}
