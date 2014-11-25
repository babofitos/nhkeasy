var nhkeasy = require('../');
var mocha = require('mocha');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs');
var html = fs.readFileSync('./test/mock.html');
var parsedResponse = require('./parsed.json');

var url = 'http://www3.nhk.or.jp/news/easy/k10013455581000/k10013455581000.html';
var nhk = 
  nock('http://www3.nhk.or.jp')
    .get('/news/easy/k10013455581000/k10013455581000.html')
    .reply(200, html);


describe('nhkeasy', function() {
  it('should return statusCode 200 and response', function() {

    nhkeasy({}, url, function(err, d) {
      assert.equal(err, null);
      assert.ok(d);
    });
  });

  it('should return an error on bad link', function() {
    nhk = 
      nock('http://www3.nhk.or.jp')
        .get('/news/easy/doesntexist.html')
        .reply(404, undefined);
    
    var url = 'http://www3.nhk.or.jp/news/easy/doesntexist.html';

    nhkeasy({}, url, function(err, d) {
      assert.equal(err, 'Unable to resolve ' + url);
      assert.equal(d, undefined);
    });
  });

  it('should error when scrape goes wrong', function() {
    nhk = 
      nock('http://www3.nhk.or.jp')
        .get('/news/easy/k10013455581000/k10013455581000.html')
        .reply(200, '');

    nhkeasy({}, url, function(err, d) {
      assert.equal(d, {});
      assert.equal(err, 'Scraping went wrong, article: ' + d.article + ' title: ' + d.title);
    });
  });

  it('should separate paragraphs using separator passed in', function() {
    nhk = 
      nock('http://www3.nhk.or.jp')
        .get('/news/easy/k10013455581000/k10013455581000.html')
        .reply(200, html);

    nhkeasy({separator: '\n'}, url, function(err, d) {
      assert.equal(err, null);
      assert.deepEqual(d, parsedResponse);
    });
  });
});