# NHK News Easy Article Extracter

A module to scrape NHK Web Easy articles.

I hope I didn't miss an rss feed

```js
npm install nhkeasy
```

```js
var nhkeasy = require('nhkeasy');
var request = require('request');
var url; //some nhk easy article
var nhkws = nhkeasy();

//stream
request(url).pipe(nhkws);
nhkws.on('title', function(title) {
  console.log(title); 
});

nhkws.on('paragraph', function(p) {
  console.log(p);
});

//or just put it in memory
request(url, function(err, res, body) {
  nhkeasy({separator: '\n'}, body, function(err, d) {
    console.log(d.title, d.article);
  });
});
```