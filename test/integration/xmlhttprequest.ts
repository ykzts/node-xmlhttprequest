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

import * as http from 'http';
import getPort from 'get-port';
import { XMLHttpRequest } from '../..';

const defaultBaseURL = 'https://example.test';
const referenceTime = new Date(Date.UTC(1999, 2, 3, 9, 1, 7, 8));
const defaultKeepAliveTimeout = 5_000;

const launchMockServer = (port: number, hostname = 'localhost') =>
  new Promise<http.Server>((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://${hostname}:${port}`);
      const status = parseInt(url.searchParams.get('status') || '200', 10);
      const type = url.searchParams.get('type') || 'text/plain';
      const body = url.searchParams.get('body') || '';

      res.writeHead(status, {
        'Cache-Control': 'max-age=60',
        'Content-Type': type,
        Date: referenceTime.toUTCString()
      });
      res.write(body);
      res.end();
    });

    server.keepAliveTimeout = defaultKeepAliveTimeout;

    server.listen(port, hostname, () => {
      resolve(server);
    });
  });

describe('XMLHttpRequest', () => {
  let server: http.Server | null = null;
  let baseURL = defaultBaseURL;

  beforeEach(async () => {
    const port = await getPort();

    server = await launchMockServer(port);
    baseURL = `http://localhost:${port}`;
  });

  afterEach((done) => {
    server?.close(() => {
      done();
    });

    server = null;
    baseURL = defaultBaseURL;
  });

  describe('.abort()', () => {
    it('basic use case', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('abort', (event) => {
        expect(event.type).toBe('abort');
        expect(client.readyState).toBe(XMLHttpRequest.UNSENT);

        done();
      });
      client.addEventListener('loadstart', () => {
        client.abort();
      });

      client.open('GET', `${baseURL}/?body=abort`);
      client.send();
    });
  });

  describe(".addEventListener(event: 'error')", () => {
    it('basic use case', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('error', () => {
        done();
      });

      client.open('GET', 'http://example.invalid/path/to');
      client.send(null);
    });
  });

  describe.each([
    ['loadstart', 0, '', ''],
    ['progress', 200, 'OK', 'response text'],
    ['load', 200, 'OK', 'response text'],
    ['loadend', 200, 'OK', 'response text']
  ])(
    `.addEventListener(event: '%s')`,
    (eventType, expectedStatus, expectedStatusText, expectedResponseText) => {
      it('basic use case', (done) => {
        const client = new XMLHttpRequest();

        client.addEventListener(eventType, () => {
          expect(client.status).toBe(expectedStatus);
          expect(client.statusText).toBe(expectedStatusText);

          if (eventType !== 'progress') {
            expect(client.responseText).toBe(expectedResponseText);
          }

          done();
        });

        client.open('GET', `${baseURL}/?body=response%20text`);
        client.send(null);
      });

      it('use object with handleEvent', (done) => {
        const client = new XMLHttpRequest();

        const obj = {
          handleEvent() {
            expect(client.status).toBe(expectedStatus);
            expect(client.statusText).toBe(expectedStatusText);

            if (eventType !== 'progress') {
              expect(client.responseText).toBe(expectedResponseText);
            }

            done();
          }
        };

        client.addEventListener(eventType, obj);

        client.open('GET', `${baseURL}/?body=response%20text`);
        client.send(null);
      });

      it('use object property', (done) => {
        const client = new XMLHttpRequest();
        const prop = `on${eventType}` as
          | 'onload'
          | 'onloadend'
          | 'onloadstart'
          | 'onprogress';

        client[prop] = () => {
          expect(client.status).toBe(expectedStatus);
          expect(client.statusText).toBe(expectedStatusText);
          expect(client.responseText).toBe(expectedResponseText);

          done();
        };

        client.open('GET', `${baseURL}/?body=response%20text`);
        client.send(null);
      });
    }
  );

  describe(".addEventListener(event: 'readystatechange')", () => {
    it('basic use case', (done) => {
      const client = new XMLHttpRequest();
      const states = new Set<number>([client.readyState]);

      client.addEventListener('readystatechange', () => {
        states.add(client.readyState);

        if (client.readyState === XMLHttpRequest.DONE) {
          expect(states).toEqual(
            new Set([
              XMLHttpRequest.UNSENT,
              XMLHttpRequest.OPENED,
              XMLHttpRequest.HEADERS_RECEIVED,
              XMLHttpRequest.LOADING,
              XMLHttpRequest.DONE
            ])
          );

          done();
        }
      });

      client.open('GET', `${baseURL}/?body=onreadystatechange`);
      client.send(null);
    });

    it('use object property', (done) => {
      const client = new XMLHttpRequest();
      const states = new Set<number>([client.readyState]);

      client.onreadystatechange = () => {
        states.add(client.readyState);

        if (client.readyState === XMLHttpRequest.DONE) {
          expect(states).toEqual(
            new Set([
              XMLHttpRequest.UNSENT,
              XMLHttpRequest.OPENED,
              XMLHttpRequest.HEADERS_RECEIVED,
              XMLHttpRequest.LOADING,
              XMLHttpRequest.DONE
            ])
          );

          done();
        }
      };

      client.open('GET', `${baseURL}/?body=onreadystatechange`);
      client.send(null);
    });
  });

  describe('.getAllResponseHeaders()', () => {
    it('returns all response headers', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('load', () => {
        expect(client.getAllResponseHeaders()).toBe(
          [
            'cache-control: max-age=60',
            'connection: keep-alive',
            'content-type: text/html',
            'date: Wed, 03 Mar 1999 09:01:07 GMT',
            `keep-alive: timeout=${defaultKeepAliveTimeout / 1_000}`,
            'transfer-encoding: chunked',
            ''
          ].join('\r\n')
        );

        done();
      });

      client.open('GET', `${baseURL}/?type=text/html`);
      client.send(null);
    });
  });

  describe('.getResponseHeader()', () => {
    it('returns response header value', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('load', () => {
        expect(client.getResponseHeader('content-type')).toBe('image/png');

        done();
      });

      client.open('GET', `${baseURL}/?type=image/png`);
      client.send(null);
    });
  });

  describe('.response', () => {
    it('returns object when given JSON', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('load', () => {
        expect(typeof client.response).not.toBe('string');
        expect(client.response).toEqual({
          test: 'value'
        });

        done();
      });

      client.open(
        'GET',
        `${baseURL}/?body=%7B%22test%22%3A%22value%22%7D&type=application/json`
      );
      client.responseType = 'json';
      client.send(null);
    });

    it('returns null when given invalid JSON', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('load', () => {
        expect(client.response).toBe(null);

        done();
      });

      client.open(
        'GET',
        `${baseURL}/?body=%7B%22test%22%3A%22value%22&type=application/json`
      );
      client.responseType = 'json';
      client.send(null);
    });
  });

  describe('.responseURL', () => {
    it('', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('loadstart', () => {
        expect(client.responseURL).toBe('');
      });

      client.addEventListener('load', () => {
        expect(client.responseURL).toMatch(/http:\/\/localhost:\d+\/path\/to/);

        done();
      });

      client.open('GET', `${baseURL}/path/to`);
      client.send(null);
    });
  });

  describe('.withCredentials', () => {
    it('throws InvalidStateError when readyState is DONE', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('load', () => {
        expect(() => {
          client.withCredentials = false;
        }).toThrow();

        expect(client.withCredentials).toBe(true);

        done();
      });

      client.open('GET', `${baseURL}/`);
      client.withCredentials = true;
      client.send(null);
    });
  });
});
