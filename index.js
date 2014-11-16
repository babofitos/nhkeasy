var request = require('request');
var cheerio = require('cheerio');
var article = '';

module.exports = function (nhkUrl, cb) {
  request(nhkUrl,
    function (err, res, body) {
      if (!err) {
        var $ = cheerio.load(body);
        var numberOfParagraphs = $('#newsarticle').children().length;
        //take out preceding news web easy|
        var newsTitle = $('title').text().split('|')[1];

        $('#newsarticle').children().each(function (index, element) {
          
          var p = $(this);
          p.contents().each(function (i, e) {
            var pChild = $(this);

            article += extractText($, pChild, '', '');
          })
          

          if (index == numberOfParagraphs - 1) {
            var output = {
              article: article,
              title: newsTitle
            }
            cb(output);
          } 
          //add newline per paragraph but ignore weird empty p nodes 
          if (p.next().children().length >0) {
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