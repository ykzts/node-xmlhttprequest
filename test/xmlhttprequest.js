// The MIT License (MIT)
//
// Copyright (c) 2011-2013 Yamagishi Kazutoshi
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
(function() {
  'use strict';

  var assert = require('assert');
  var http = require('http');
  var url = require('url');
  var cpm = require('child_process');
  var XMLHttpRequest = require('../lib/xmlhttprequest');
  var path = require('path');

  suite('XMLHttpRequest', function() {
    before(function(done) {
      var server = this.server = cpm.fork(path.join(__dirname, '..', 'test-server.js'));
      server.on('message', function(obj) {
        this.baseUri = obj.baseUri;
        done();
      }.bind(this));
    });

    after(function(done) {
      this.server.on('close', function(code, signal) {
        done();
      });
      this.server.kill('SIGKILL');
    });

    test('send GET request', function(done) {
      var uri = this.baseUri + '/?body=send%20request';
      var client = new XMLHttpRequest();
      client.open('GET', uri);
      client.addEventListener('load', function() {
        assert.strictEqual(200, this.status);
        assert.strictEqual('send request', this.responseText);
        done();
      }, false);
      client.send(null);
    });

    test('onreadystatechange', function(done) {
      var uri = this.baseUri + '/';
      var states = [
        XMLHttpRequest.OPENED,
        XMLHttpRequest.HEADERS_RECEIVED,
        XMLHttpRequest.LOADING,
        XMLHttpRequest.DONE
      ];
      var client = new XMLHttpRequest();
      client.addEventListener('readystatechange', function() {
        var state = this.readyState;
        var index = states.indexOf(state);
        if (index >= 0) {
          states.splice(index, 1);
        }
        if (state === this.DONE) {
          assert.ok(states.length === 0);
          done();
        }
      }, false);
      client.open('GET', uri);
      client.send(null);
    });

    test('parse JSON', function(done) {
      var uri = this.baseUri + '/?body=%7B%22test%22%3A%22value%22%7D';
      var client = new XMLHttpRequest();
      client.open('GET', uri);
      client.responseType = 'json';
      client.addEventListener('load', function() {
        var response = this.response;
        assert.ok(typeof response !== 'string');
        assert.strictEqual(response.test, 'value');
        done();
      }, false);
      client.send(null);
    });

    test('send synchronous GET request', function(done) {
      var uri = this.baseUri + '/?body=send%20request';
      var client = new XMLHttpRequest();
      client.open('GET', uri, false);
      client.send(null);
      assert.strictEqual(200, client.status);
      assert.strictEqual('send request', client.responseText);
      done();
    });
  });
})();

