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

import { FormData } from '../..';

describe('FormData', () => {
  describe('.append()', () => {
    it('basic use case', () => {
      const formData = new FormData();

      expect(formData.append('message', 'test message')).toBeUndefined();
    });
  });

  describe('.delete()', () => {
    it('basic use case', () => {
      const formData = new FormData();
    });
  });

  describe('.get()', () => {
    it('basic use case', () => {
      const formData = new FormData();
    });
  });

  describe('.getAll()', () => {
    it('basic use case', () => {
      const formData = new FormData();
    });
  });

  describe('.has()', () => {
    it('basic use case', () => {
      const formData = new FormData();
    });
  });

  describe('.set()', () => {
    it('basic use case', () => {
      const formData = new FormData();
    });
  });

  describe('.[Symbol.iterator]()', () => {
    it('basic use case', () => {
      const formData = new FormData();
    });
  });
});
