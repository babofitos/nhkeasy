var request = require('request');
var cheerio = require('cheerio');

module.exports = function (options, nhkUrl, cb) {
  var article = '';
  options = options || {};

  request(nhkUrl,
    function (err, res, body) {
      if (!err && res.statusCode == 200) {
        var $ = cheerio.load(body);
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
            }

            cb(null, output);
          } 
          //add separator per paragraph but ignore weird empty p nodes 
          if (p.next().children().length >0) {
            article += options.separator || '';
          }
        })
      } else {
        cb('Unable to resolve ' + nhkUrl);
      }
    }
  )
}

//get relevant text nodes, ignore the furigana
function extractText($, node) {
  var output = '';
  //text node
  if (node[0].name == undefined) {
    return node.text();
  }

  if (node[0].name !== 'rt') {
    node.contents().each(function (i, el) {
      output += extractText($, $(this));
    })
  }
  return output;
}