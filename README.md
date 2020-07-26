# w3c-xmlhttprequest [![Node.js CI](https://github.com/ykzts/node-xmlhttprequest/workflows/Node.js%20CI/badge.svg)](https://github.com/ykzts/node-xmlhttprequest/actions?query=workflow%3A%22Node.js+CI%22)

Server-side XMLHttpRequest like [Living Standard](https://xhr.spec.whatwg.org/) for [Node](https://nodejs.org/).

## Install

```console
$ npm install w3c-xmlhttprequest
```

or

```console
$ yarn add w3c-xmlhttprequest
```

## Example

### Simple GET request

```typescript
import { XMLHttpRequest } from 'w3c-xmlhttprequest';

const client = new XMLHttpRequest();
client.open('GET', 'https://example.com/');
client.addEventListener('load', () => {
  console.log('Received an HTTP response.');
}
client.send();
```

### Parse JSON response

```typescript
import { XMLHttpRequest } from 'w3c-xmlhttprequest';

const client = new XMLHttpRequest();
client.open('GET', 'https://exmaple.com/data.json');
client.responseType = 'json';
client.addEventListener('load', () => {
  const data = client.response;
  if (data.meta.status !== 200) return;
  console.log(data.response.blog.title);
});
client.send();
```

## LICENSE

[MIT License](LICENSE)
