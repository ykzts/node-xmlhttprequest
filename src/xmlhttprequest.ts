// The MIT License (MIT)
//
// Copyright (c) 2011-2020 Yamagishi Kazutoshi
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import * as http from 'http';
import * as https from 'https';
import Event from './dom/event';
import FormData from './formdata';
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
  | Buffer
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

  readonly upload: XMLHttpRequestUpload;

  #client: http.ClientRequest | null;
  #responseBuffer: Buffer;
  #responseHeaders: http.IncomingHttpHeaders | null;

  #readyState: number;
  #responseType: XMLHttpRequestResponseType;
  #responseURL: string;
  #status: number;
  #statusText: string;

  get readyState(): number {
    return this.#readyState;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get response(): any {
    switch (this.responseType) {
      case 'arraybuffer':
        return new Uint8Array(this.#responseBuffer).buffer;
      case 'blob':
        return this.#responseBuffer;
      case 'document':
        return this.responseXML;
      case 'json':
        return JSON.parse(this.responseText);
      default:
        return this.responseText;
    }
  }

  get responseText(): string {
    return this.#responseBuffer.toString();
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
    return this.#responseURL;
  }

  get responseXML(): null {
    return null;
  }

  get status(): number {
    return this.#status;
  }

  get statusText(): string {
    return this.#statusText;
  }

  constructor() {
    super();

    this.upload = new XMLHttpRequestUpload();

    this.#client = null;
    this.#responseBuffer = Buffer.alloc(0);
    this.#responseHeaders = null;

    this.#readyState = XMLHttpRequest.UNSENT;
    this.#responseType = '';
    this.#responseURL = '';
    this.#status = 0;
    this.#statusText = '';
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-abort()-method XMLHttpRequest Standard - 4.5.7. The abort() method}
   */
  abort(): void {
    if (
      this.readyState === XMLHttpRequest.HEADERS_RECEIVED ||
      this.readyState === XMLHttpRequest.LOADING
    ) {
      this.#client?.abort();
    }
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method XMLHttpRequest Standard - 4.6.5. The getAllResponseHeaders() method}
   */
  getAllResponseHeaders(): string {
    if (
      this.readyState === XMLHttpRequest.UNSENT ||
      this.readyState === XMLHttpRequest.OPENED ||
      !this.#responseHeaders
    ) {
      return '';
    }

    const headerNames = Object.keys(this.#responseHeaders).sort();

    let result = '';
    for (const name of headerNames) {
      const value = this.#responseHeaders[name];

      result += `${name}: ${value}\r\n`;
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
      !this.#responseHeaders
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

    const value = this.#responseHeaders[headerName] || null;

    return Array.isArray(value) ? value.join(', ') : value;
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

    let parsedURL: URL;

    try {
      parsedURL = new URL(url, 'http://localhost/');
    } catch {
      // TODO: Add human readable message.
      throw new DOMException('', 'SyntaxError');
    }

    if (FORBIDDEN_METHODS.includes(method.toLowerCase())) {
      // TODO: Add human readable message.
      throw new DOMException('', 'SecurityError');
    }

    const protocol = parsedURL.protocol;
    const isHTTPS = protocol === 'https:';
    const user = username || parsedURL.username;
    const pass = password || parsedURL.password;

    const agent = isHTTPS ? https.globalAgent : http.globalAgent;
    const auth = user ? (pass ? `${user}:${pass}` : user) : '';
    const path = parsedURL.pathname + parsedURL.search;
    const port = parsedURL.port
      ? parseInt(parsedURL.port, 10)
      : isHTTPS
      ? 443
      : 80;

    this.#client = new http.ClientRequest({
      agent,
      auth,
      host: parsedURL.hostname,
      method,
      path,
      port,
      protocol
    });

    this.#client.addListener('abort', () => {
      this.dispatchEvent(new ProgressEvent('abort'));
      this.upload.dispatchEvent(new ProgressEvent('abort'));

      this.#client = null;
      this.#readyState = XMLHttpRequest.UNSENT;
    });

    this.#client.addListener('response', (response) => {
      this.#readyState = XMLHttpRequest.HEADERS_RECEIVED;
      this.dispatchEvent(new Event('readystatechange'));

      this.#status = response.statusCode ?? 0;
      this.#statusText = response.statusMessage ?? '';
      this.#responseHeaders = response.headers;

      response.addListener('data', (chunk: Buffer) => {
        if (this.#responseBuffer.length === 0) {
          this.dispatchEvent(new ProgressEvent('loadstart'));
        }

        this.#responseBuffer = Buffer.concat([this.#responseBuffer, chunk]);

        this.#readyState = XMLHttpRequest.LOADING;
        this.dispatchEvent(new Event('readystatechange'));

        this.dispatchEvent(
          new ProgressEvent('progress', {
            loaded: this.#responseBuffer.length
          })
        );
      });

      response.addListener('end', () => {
        if (this.#responseBuffer.length === 0) {
          this.#readyState = XMLHttpRequest.LOADING;
          this.dispatchEvent(new Event('readystatechange'));
        }

        this.#client = null;

        this.#readyState = XMLHttpRequest.DONE;
        this.dispatchEvent(new Event('readystatechange'));

        this.dispatchEvent(
          new ProgressEvent('load', {
            loaded: this.#responseBuffer.length
          })
        );
        this.dispatchEvent(
          new ProgressEvent('loadend', {
            loaded: this.#responseBuffer.length
          })
        );
      });
    });

    this.#readyState = XMLHttpRequest.OPENED;
    this.dispatchEvent(new Event('readystatechange'));
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-overridemimetype()-method XMLHttpRequest Standard - 4.6.7. The overrideMimeType() method}
   */
  overrideMimeType(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mime: string
  ): void {
    // TODO: Unimplemented.
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-send()-method XMLHttpRequest Standard - 4.5.6. The send() method}
   */
  send(body: BodyInit | null = null): void {
    if (this.readyState !== XMLHttpRequest.OPENED || !this.#client) {
      // TODO: Add human readable message.
      throw new DOMException('', 'InvalidStateError');
    }

    if (body) {
      const bodyInit =
        body instanceof ArrayBuffer || body instanceof Uint8Array
          ? Buffer.from(body)
          : body;

      if (typeof bodyInit === 'string' || bodyInit instanceof Buffer) {
        const length = Buffer.isBuffer(bodyInit)
          ? bodyInit.length
          : Buffer.byteLength(bodyInit);

        this.#client.setHeader('Content-Length', length);
      }

      this.#client.addListener('socket', (socket) => {
        this.upload.dispatchEvent(new ProgressEvent('loadstart'));

        socket.addListener('data', () => {
          this.upload.dispatchEvent(new ProgressEvent('progress'));
        });

        socket.addListener('end', () => {
          this.upload.dispatchEvent(new ProgressEvent('load'));
          this.upload.dispatchEvent(new ProgressEvent('loadend'));
        });
      });

      this.#client.write(body);
    }

    this.dispatchEvent(new ProgressEvent('loadstart'));
    this.#client.end();
  }

  /**
   * @see {@link https://xhr.spec.whatwg.org/#the-setrequestheader()-method XMLHttpRequest Standard - 4.5.2. The setRequestHeader() method}
   */
  setRequestHeader(name: string, value: string): void {
    if (this.readyState !== XMLHttpRequest.OPENED || !this.#client) {
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
      this.#client.setHeader(headerName, headerValue);
    } catch (error) {
      throw new DOMException(error.message, 'SyntaxError');
    }
  }
}
