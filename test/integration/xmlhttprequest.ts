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

const referenceTime = new Date(Date.UTC(1999, 2, 3, 9, 1, 7, 8));

const launchMockServer = (port: number) =>
  new Promise<http.Server>((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://example.test');
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
    server.listen(port, 'localhost', () => {
      resolve(server);
    });
  });

describe('XMLHttpRequest', () => {
  let server: http.Server | null = null;
  let baseURL: string | null = null;

  beforeEach(async () => {
    const port = await getPort();

    server = await launchMockServer(port);
    baseURL = `http://localhost:${port}`;
  });

  afterEach((done) => {
    server?.close(() => done());

    server = null;
    baseURL = null;
  });

  describe("addEventListener(event: 'load')", () => {
    it('basic use case', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('load', () => {
        expect(client.status).toBe(200);
        expect(client.statusText).toBe('OK');
        expect(client.responseText).toBe('response text');

        done();
      });

      client.open('GET', `${baseURL}/?body=response%20text`);
      client.send(null);
    });
  });

  describe("addEventListener(event: 'readystatechange')", () => {
    it('returns all states', (done) => {
      const states: number[] = [];
      const client = new XMLHttpRequest();

      states.push(client.readyState);

      client.addEventListener('readystatechange', () => {
        states.push(client.readyState);

        if (client.readyState === XMLHttpRequest.DONE) {
          expect(states).toEqual([
            XMLHttpRequest.UNSENT,
            XMLHttpRequest.OPENED,
            XMLHttpRequest.HEADERS_RECEIVED,
            XMLHttpRequest.LOADING,
            XMLHttpRequest.DONE
          ]);

          done();
        }
      });

      client.open('GET', `${baseURL}/?body=onreadystatechange`);
      client.send(null);
    });
  });

  describe('getAllResponseHeaders()', () => {
    it('returns all response headers', (done) => {
      const client = new XMLHttpRequest();

      client.addEventListener('load', () => {
        expect(client.getAllResponseHeaders()).toBe(
          [
            'cache-control: max-age=60',
            'connection: close',
            'content-type: text/html',
            'date: Wed, 03 Mar 1999 09:01:07 GMT',
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

  describe('getResponseHeader()', () => {
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

  describe('responseText', () => {
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
  });
});
