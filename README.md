# node-xmlhttprequest

Server-side XMLHttpRequest like [W3C spec](http://www.w3.org/TR/XMLHttpRequest/) for [Node](http://nodejs.org/).

## Install

    $ npm install w3c-xmlhttprequest

or

    $ npm install git://github.com/ykzts/node-xmlhttprequest.git

## Example

### Simple GET request

    var XMLHttpRequest = require('w3c-xmlhttprequest').XMLHttpRequest;
    
    var client = new XMLHttpRequest();
    client.open('GET', 'http://example.com/');
    client.addEventListener('load', function(event) {
      console.log('HTTP Request OSHIMAI.');
    }, false);
    clietn.send();

### Parse JSON response

    var XMLHttpRequest = require('w3c-xmlhttprequest').XMLHttpRequest;
    
    var client = new XMLHttpRequest();
    client.open('GET', 'http://exmaple.com/data.json');
    client.responseType = 'json';
    client.addEventListener('load', function() {
      var data = client.response;
      if (data.meta.status !== 200) {
        return;
      }
      console.log(data.response.blog.title);
    }, false);
    client.send();
