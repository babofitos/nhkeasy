var request = require('request');
var cheerio = require('cheerio');
var article = '';

module.exports = function (nhkUrl, cb) {
  request(nhkUrl,
    function (err, res, body) {
      if (!err) {
        var $ = cheerio.load(body);
        var numberOfParagraphs = $('#newsarticle').children().length;
        var newsTitle = $('#newstitle').text();

        $('#newsarticle').children().each(function (index, element) {
          
          var p = $(this);
          p.contents().each(function (i, e) {
            var pChild = $(this);

            article += extractText($, pChild, '', '');
          })
          

          if (index == numberOfParagraphs - 1) {
            cb(article);
          }

          //add newline per paragraph but ignore weird empty p nodes
          if (p.children().length >0) {
            article += '\n';
          }
        })
      }
    }
  )
}

//get relevant text nodes, ignore the furigana
function extractText($, node, part, whole) {
  //text node
  if (node[0].name == undefined) {
    return node.text();
  }

  //furigana
  if (node[0].name == 'rt') {
    return '';
  }

  if (node[0].name !== 'rt') {
    node.contents().each(function (i, el) {
      part = '';
      part = extractText($, $(this), part, '');
      whole += part;
    })
  }
  return whole;
}