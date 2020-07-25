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

/**
 * @see {@link https://heycam.github.io/webidl/#idl-DOMException Web IDL - 4.3. DOMException}
 */
export default class DOMException extends Error {
  /**
   * @deprecated since version 3.0
   */
  static readonly INDEX_SIZE_ERR = 1;
  /**
   * @deprecated since version 3.0
   */
  static readonly DOMSTRING_SIZE_ERR = 2;
  /**
   * @deprecated since version 3.0
   */
  static readonly HIERARCHY_REQUEST_ERR = 3;
  /**
   * @deprecated since version 3.0
   */
  static readonly WRONG_DOCUMENT_ERR = 4;
  /**
   * @deprecated since version 3.0
   */
  static readonly INVALID_CHARACTER_ERR = 5;
  /**
   * @deprecated since version 3.0
   */
  static readonly NO_DATA_ALLOWED_ERR = 6;
  /**
   * @deprecated since version 3.0
   */
  static readonly NO_MODIFICATION_ALLOWED_ERR = 7;
  /**
   * @deprecated since version 3.0
   */
  static readonly NOT_FOUND_ERR = 8;
  /**
   * @deprecated since version 3.0
   */
  static readonly NOT_SUPPORTED_ERR = 9;
  /**
   * @deprecated since version 3.0
   */
  static readonly INUSE_ATTRIBUTE_ERR = 10;
  /**
   * @deprecated since version 3.0
   */
  static readonly INVALID_STATE_ERR = 11;
  /**
   * @deprecated since version 3.0
   */
  static readonly SYNTAX_ERR = 12;
  /**
   * @deprecated since version 3.0
   */
  static readonly INVALID_MODIFICATION_ERR = 13;
  /**
   * @deprecated since version 3.0
   */
  static readonly NAMESPACE_ERR = 14;
  /**
   * @deprecated since version 3.0
   */
  static readonly INVALID_ACCESS_ERR = 15;
  /**
   * @deprecated since version 3.0
   */
  static readonly VALIDATION_ERR = 16;
  /**
   * @deprecated since version 3.0
   */
  static readonly TYPE_MISMATCH_ERR = 17;
  /**
   * @deprecated since version 3.0
   */
  static readonly SECURITY_ERR = 18;
  /**
   * @deprecated since version 3.0
   */
  static readonly NETWORK_ERR = 19;
  /**
   * @deprecated since version 3.0
   */
  static readonly ABORT_ERR = 20;
  /**
   * @deprecated since version 3.0
   */
  static readonly URL_MISMATCH_ERR = 21;
  /**
   * @deprecated since version 3.0
   */
  static readonly QUOTA_EXCEEDED_ERR = 22;
  /**
   * @deprecated since version 3.0
   */
  static readonly TIMEOUT_ERR = 23;
  /**
   * @deprecated since version 3.0
   */
  static readonly INVALID_NODE_TYPE_ERR = 24;
  /**
   * @deprecated since version 3.0
   */
  static readonly DATA_CLONE_ERR = 25;

  /**
   * @deprecated since version 3.0
   */
  readonly INDEX_SIZE_ERR = DOMException.INDEX_SIZE_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly DOMSTRING_SIZE_ERR = DOMException.DOMSTRING_SIZE_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly HIERARCHY_REQUEST_ERR = DOMException.HIERARCHY_REQUEST_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly WRONG_DOCUMENT_ERR = DOMException.WRONG_DOCUMENT_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly INVALID_CHARACTER_ERR = DOMException.INVALID_CHARACTER_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly NO_DATA_ALLOWED_ERR = DOMException.NO_DATA_ALLOWED_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly NO_MODIFICATION_ALLOWED_ERR =
    DOMException.NO_MODIFICATION_ALLOWED_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly NOT_FOUND_ERR = DOMException.NOT_FOUND_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly NOT_SUPPORTED_ERR = DOMException.NOT_SUPPORTED_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly INUSE_ATTRIBUTE_ERR = DOMException.INUSE_ATTRIBUTE_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly INVALID_STATE_ERR = DOMException.INVALID_STATE_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly SYNTAX_ERR = DOMException.SYNTAX_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly INVALID_MODIFICATION_ERR = DOMException.INVALID_MODIFICATION_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly NAMESPACE_ERR = DOMException.NAMESPACE_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly INVALID_ACCESS_ERR = DOMException.INVALID_ACCESS_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly VALIDATION_ERR = DOMException.VALIDATION_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly TYPE_MISMATCH_ERR = DOMException.TYPE_MISMATCH_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly SECURITY_ERR = DOMException.SECURITY_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly NETWORK_ERR = DOMException.NETWORK_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly ABORT_ERR = DOMException.ABORT_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly URL_MISMATCH_ERR = DOMException.URL_MISMATCH_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly QUOTA_EXCEEDED_ERR = DOMException.QUOTA_EXCEEDED_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly TIMEOUT_ERR = DOMException.TIMEOUT_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly INVALID_NODE_TYPE_ERR = DOMException.INVALID_NODE_TYPE_ERR;
  /**
   * @deprecated since version 3.0
   */
  readonly DATA_CLONE_ERR = DOMException.DATA_CLONE_ERR;

  #codeMap = new Map<string, number>([
    ['IndexSizeError', DOMException.INDEX_SIZE_ERR],
    ['HierarchyRequestError', DOMException.HIERARCHY_REQUEST_ERR],
    ['WrongDocumentError', DOMException.WRONG_DOCUMENT_ERR],
    ['InvalidCharacterError', DOMException.INVALID_CHARACTER_ERR],
    ['NotFoundError', DOMException.NOT_FOUND_ERR],
    ['NotSupportedError', DOMException.NOT_SUPPORTED_ERR],
    ['InvalidStateError', DOMException.INVALID_STATE_ERR],
    ['SyntaxError', DOMException.SYNTAX_ERR],
    ['InvalidModificationError', DOMException.INVALID_MODIFICATION_ERR],
    ['NamespaceError', DOMException.NAMESPACE_ERR],
    ['InvalidAccessError', DOMException.INVALID_ACCESS_ERR],
    ['TypeMismatchError', DOMException.TYPE_MISMATCH_ERR],
    ['SecurityError', DOMException.SECURITY_ERR],
    ['NetworkError', DOMException.NETWORK_ERR],
    ['AbortError', DOMException.ABORT_ERR],
    ['URLMismatchError', DOMException.URL_MISMATCH_ERR],
    ['QuotaExceededError', DOMException.QUOTA_EXCEEDED_ERR],
    ['TimeoutError', DOMException.TIMEOUT_ERR],
    ['InvalidNodeTypeError', DOMException.INVALID_NODE_TYPE_ERR],
    ['DataCloneError', DOMException.DATA_CLONE_ERR]
  ]);

  #message: string;
  #name: string;

  /**
   * @deprecated since version 3.0
   */
  get code(): number {
    return this.#codeMap.get(this.name) ?? 0;
  }

  get message(): string {
    return this.#message;
  }

  get name(): string {
    return this.#name;
  }

  constructor(message = '', name = 'Error') {
    super(message);

    this.#message = message;
    this.#name = name;
  }
}
