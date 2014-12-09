var request = require('request');
var cheerio = require('cheerio');
var $ = cheerio;

module.exports = function (options, body, cb) {
  var args = [].slice.call(arguments, 0);
  if (args.length === 0) {
    //return a writablestream
    var Parser = require("htmlparser2").WritableStream;
    var Cornet = require("cornet");
    var cornet = new Cornet();
    var ws = new Parser(cornet);

    cornet.select('title', function(elem) {
      ws.emit('title', $(elem).text().split('|')[1]);
    });

    cornet.select('#newsarticle > p', function(elem) {
      var p = $(elem);
      
      ws.emit('paragraph', extractText($, p));
    });

    return ws;

  } else {
    var article = '';
    options = options || {};
    $ = cheerio.load(body);
    var numberOfParagraphs = $('#newsarticle').children().length;
    //take out preceding news web easy|
    var newsTitle = $('title').text().split('|')[1];

    if (!numberOfParagraphs || !newsTitle.length) {
      cb('Cannot find relevant nodes to scrape');
    }

    $('#newsarticle').children().each(function (index, element) {
      
      var p = $(this);
      
      article += extractText($, p);

      if (index == numberOfParagraphs - 1) {
        var output = {
          article: article,
          title: newsTitle
        };

        cb(null, output);
      } 
      //add separator per paragraph but ignore weird empty p nodes 
      if (p.next().children().length >0) {
        article += options.separator || '';
      }
    });
    
  }
};

//get relevant text nodes, ignore the furigana
function extractText($, node) {
  var output = '';
  //text node
  if (node[0].name === undefined) {
    return node.text();
  }

  if (node[0].name !== 'rt') {
    node.contents().each(function (i, el) {
      output += extractText($, $(this));
    });
  }
  return output;
}