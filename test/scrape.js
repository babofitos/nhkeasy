var nhkeasy = require('../');
var mocha = require('mocha');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs');
var mockHtml = fs.readFileSync('./test/mock.html');
var parsedResponse = require('./parsed.json');
var request = require('request');

var url = 'http://www3.nhk.or.jp/news/easy/k123/k123.html';
var host = 'http://www3.nhk.or.jp';
var route = '/news/easy/k123/k123.html';

describe('nhkeasy', function() {
  describe('memory', function() {
    it('should return statusCode 200 and response', function(done) {
      nock(host)
        .get(route)
        .reply(200, mockHtml);

      request(url, function(err, res, body) {
        nhkeasy({}, body, function(err, d) {
          assert.equal(err, null);
          assert.ok(d);
          done();
        });
      });
    });

    it('should err when title or p nodes not found', function(done) {
      nock(host)
        .get(route)
        .reply(200, undefined);

      request(url, function(err, res, body) {
        nhkeasy({}, body, function(err, d) {
          assert.equal(d, undefined);
          assert.equal(err, 'Cannot find relevant nodes to scrape');
          done();
        });
      });
    });

    it('should separate paragraphs using separator passed in', function(done) {
      nock(host)
        .get(route)
        .reply(200, mockHtml);

      request(url, function(err, res, body) {
        nhkeasy({separator: '\n'}, body, function(err, d) {
          assert.equal(err, null);
          assert.deepEqual(d, parsedResponse);
          done();
        });
      });
    });
  });
    
  describe('stream', function() {
    var nhkws;

    beforeEach(function() {
      nock(host)
        .get(route)
        .reply(200, mockHtml);

      nhkws = nhkeasy();
      request(url).pipe(nhkws);
    });

    it('should return a writable stream when no args', function() {
      var writestream = require('stream').Writable;
      
      assert.ok(nhkws instanceof writestream);
    });

    it('should emit title when found', function(done) {
      nhkws.on('title', function(title) {
        assert.equal(title, '長野県で震度６弱の地震　これからも十分に注意して');
        done();
      });
    });

    it('should emit paragraphs when found', function(done) {
      var res = [];

      nhkws.on('paragraph', function(p) {
       res.push(p);
      });

      nhkws.on('finish', function() {
        assert.deepEqual([
          '２２日午後１０時ころ、長野県でマグニチュード６．７（Ｍ６．７）の地震がありました。長野市と小谷村、小川村で震度６弱でした。白馬村と信濃町は震度５強でした。',
          'この地震で４５人がけがをしたと、２５日の昼までにわかっています。そして、３１の家が全部壊れて、４６の家が半分壊れました。'
        ], res);
        done();
      });
    });

    it('should not emit empty paragraphs', function(done) {
      var i = 0;
      
      nhkws.on('paragraph', function(p) {
        i++;
      });

      nhkws.on('finish', function() {
        assert.equal(i, 2);
        done();
      });
    });
  });
});