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

const assert = require('assert');
const http = require('http');
const { XMLHttpRequest } = require('..');

function receiveRequest(req, res) {
  const url = new URL(req.url, 'http://example.test');
  const body = url.searchParams.get('body') || '';
  res.writeHead(+(url.searchParams.get('status') || 200), {
    'Content-Type': 'text/plain'
  });
  res.write(body);
  res.end();
}

describe('XMLHttpRequest', function () {
  const defaultPort = 10000;
  let server;

  before(function (done) {
    server = http.createServer();
    server.on('request', receiveRequest);
    const retry = (port) => {
      try {
        server.listen(port, () => {
          this.baseUri = `http://127.0.0.1:${port}`;
          done();
        });
      } catch (e) {
        ++port;
        if (port < defaultPort + 20) {
          retry(port);
        }
      }
    };
    retry(defaultPort);
  });

  after(function (done) {
    server.close(function () {
      done();
    });
  });

  it('send GET request', function (done) {
    const uri = this.baseUri + '/?body=send%20request';
    const client = new XMLHttpRequest();
    client.open('GET', uri);
    client.addEventListener(
      'load',
      function () {
        assert.strictEqual(200, this.status);
        assert.strictEqual('send request', this.responseText);
        done();
      },
      false
    );
    client.send(null);
  });

  it('onreadystatechange', function (done) {
    const uri = this.baseUri + '/?body=onreadystatechange';
    const states = [];
    const client = new XMLHttpRequest();
    client.addEventListener(
      'readystatechange',
      function () {
        states.push(this.readyState);

        if (this.readyState === XMLHttpRequest.DONE) {
          assert.deepEqual(states, [
            XMLHttpRequest.OPENED,
            XMLHttpRequest.HEADERS_RECEIVED,
            XMLHttpRequest.LOADING,
            XMLHttpRequest.DONE
          ]);
          done();
        }
      },
      false
    );
    client.open('GET', uri);
    client.send(null);
  });

  it('parse JSON', function (done) {
    const uri = this.baseUri + '/?body=%7B%22test%22%3A%22value%22%7D';
    const client = new XMLHttpRequest();
    client.open('GET', uri);
    client.responseType = 'json';
    client.addEventListener(
      'load',
      function () {
        const response = this.response;
        assert.ok(typeof response !== 'string');
        assert.strictEqual(response.test, 'value');
        done();
      },
      false
    );
    client.send(null);
  });
});
