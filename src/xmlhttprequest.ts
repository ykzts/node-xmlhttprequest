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

import { Blob } from 'buffer';
import * as http from 'http';
import * as https from 'https';
import DOMException from './domexception';
import File from './file';
import FormData from './formdata';
import ProgressEvent from './progressevent';
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

export type XMLHttpRequestBodyInit =
  | Blob
  | BufferSource
  | FormData
  | URLSearchParams
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

  #client: http.ClientRequest | null = null;
  #onreadystatechange: EventListener | null = null;
  #responseBuffer: Buffer = Buffer.alloc(0);
  #responseHeaders: http.IncomingHttpHeaders | null = null;
  #responseURL: URL | null = null;

  #readyState: number = XMLHttpRequest.UNSENT;
  #responseType: XMLHttpRequestResponseType = '';
  #status = 0;
  #statusText = '';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get response(): ArrayBufferLike | Buffer | string | any | null {
    if (this.readyState !== XMLHttpRequest.DONE) {
      return null;
    }

    switch (this.responseType) {
      case 'arraybuffer':
        return new Uint8Array(this.#responseBuffer).buffer;
      case 'blob':
        return this.#responseBuffer;
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
    return this.#responseURL ? this.#responseURL.toString() : '';
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
    return this.#status;
  }

  get statusText(): string {
    return this.#statusText;
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
      !this.#client
    ) {
      return;
    }

    this.#client.destroy();
    this.#client = null;

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
      !this.#responseHeaders
    ) {
      return '';
    }

    const headerNames = Object.keys(this.#responseHeaders).sort();

    let result = '';
    for (const name of headerNames) {
      const value = this.#responseHeaders[name];

      if (value) {
        const values = Array.isArray(value) ? value : [value];

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

    const Agent = isHTTPS ? https.Agent : http.Agent;
    const auth = user ? (pass ? `${user}:${pass}` : user) : '';
    const path = parsedURL.pathname + parsedURL.search;
    const port = parsedURL.port
      ? parseInt(parsedURL.port, 10)
      : isHTTPS
      ? 443
      : 80;

    this.#client = new http.ClientRequest({
      agent: new Agent({
        keepAlive: true,
        timeout: 5_000
      }),
      auth,
      host: parsedURL.hostname,
      method,
      path,
      port,
      protocol
    });

    if (this.#timeout > 0) {
      this.#client.setTimeout(this.#timeout, () => {
        this.#client = null;

        this.#changeReadyState(XMLHttpRequest.DONE);

        this.dispatchEvent(new ProgressEvent('timeout'));
        this.upload.dispatchEvent(new ProgressEvent('timeout'));
      });
    }

    this.#client.addListener('error', () => {
      this.#client = null;

      this.#changeReadyState(XMLHttpRequest.DONE);

      this.dispatchEvent(new ProgressEvent('error'));
      this.upload.dispatchEvent(new ProgressEvent('error'));
    });

    this.#client.addListener('response', (response) => {
      this.#changeReadyState(XMLHttpRequest.HEADERS_RECEIVED);

      this.#status = response.statusCode ?? 0;
      this.#statusText = response.statusMessage ?? '';
      this.#responseHeaders = response.headers;

      this.#responseURL = new URL(path, `${protocol}//${parsedURL.host}`);

      response.addListener('data', (chunk: Buffer) => {
        if (this.#responseBuffer.length === 0) {
          this.dispatchEvent(new ProgressEvent('loadstart'));
        }

        this.#responseBuffer = Buffer.concat([this.#responseBuffer, chunk]);

        this.#changeReadyState(XMLHttpRequest.LOADING);

        this.dispatchEvent(
          new ProgressEvent('progress', {
            loaded: this.#responseBuffer.length
          })
        );
      });

      response.addListener('end', () => {
        const receivedBytes = this.#responseBuffer.length;

        if (receivedBytes === 0) {
          this.#changeReadyState(XMLHttpRequest.LOADING);
        }

        this.#client = null;

        this.#changeReadyState(XMLHttpRequest.DONE);

        this.dispatchEvent(
          new ProgressEvent('load', {
            loaded: receivedBytes
          })
        );
        this.dispatchEvent(
          new ProgressEvent('loadend', {
            loaded: receivedBytes
          })
        );
      });
    });

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
  send(body: XMLHttpRequestBodyInit | null = null): void {
    if (this.readyState !== XMLHttpRequest.OPENED || !this.#client) {
      // TODO: Add human readable message.
      throw new DOMException('', 'InvalidStateError');
    }

    this.dispatchEvent(new ProgressEvent('loadstart'));

    if (body && !['GET', 'HEAD'].includes(this.#client.method)) {
      let chunk = new Blob([]);

      if (
        body instanceof ArrayBuffer ||
        ArrayBuffer.isView(body) ||
        body instanceof Blob
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        chunk = new Blob([body]);
      } else if (body instanceof URLSearchParams) {
        chunk = new Blob([body.toString()], {
          type: 'application/x-www-form-urlencoded; charset=UTF-8'
        });
      } else if (body instanceof FormData) {
        const boundary = '------xxxxx';

        let chunk = new Blob([], {
          type: `multipart/form-data; boundary=${boundary}`
        });
        for (const [name, value] of body) {
          if (value instanceof File) {
            chunk = new Blob(
              [
                chunk,
                `Content-Disposition: form-data; name="${name}"; filename="${value.name}"\r\n`,
                '\r\n',
                value,
                `\r\n`
              ],
              { type: chunk.type }
            );
          } else {
            chunk = new Blob(
              [
                chunk,
                `${boundary}\r\n`,
                `Content-Disposition: form-data; name="${name}"\r\n`,
                '\r\n',
                `${value}\r\n`
              ],
              { type: chunk.type }
            );
          }
        }

        chunk = new Blob([chunk, `${boundary}\r\n`], { type: chunk.type });
      } else {
        chunk = new Blob([body], { type: 'text/plain' });
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

      if (chunk.type) {
        this.setRequestHeader('Content-Type', chunk.type);
      }

      this.setRequestHeader('Content-Length', chunk.size.toString());

      chunk
        .arrayBuffer()
        .then((buffer) => {
          if (!this.#client) {
            throw new TypeError('The client is initialized unintentionally.');
          }

          this.#client.write(new Uint8Array(buffer));
        })
        .catch((error) => {
          throw error;
        });
    }

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
      const message = error instanceof Error ? error.message : '';

      throw new DOMException(message, 'SyntaxError');
    }
  }

  #changeReadyState(readyState: number): void {
    this.#readyState = readyState;
    this.dispatchEvent(new Event('readystatechange'));
  }
}
