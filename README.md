# node-xmlhttprequest

Server-side XMLHttpRequest like [W3C spec](http://www.w3.org/TR/XMLHttpRequest/) for [Node](http://nodejs.org/).

## Example

    var XMLHttpRequest = require('./');
    
    var client = new XMLHttpRequest();
    client.open('GET', 'http://example.com/');
    client.addEventListener('load', function(event) {
      console.log('HTTP Request OSHIMAI.');
    }, false);
    clietn.send();
