var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1309.0 Safari/537.17';
var BAILII = 'http://www.bailii.org/ew/cases/';

function scrapePage() {
  request({url: 'http://www.bailii.org/ew/cases/EWHC/Comm/2012/87.html'}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Print the google web page.
    }
  });
}

// URL structure
// 
// index pages look like ...
// /ew/cases/EWHC/Comm/
// /ew/cases/EWHC/Comm/1995/
function buildIndex() {
  // by courts then years then cases ...
  var index = {
    // england-wales high court - commercial
    'EWHC/Comm': {}
  };
  var court = 'EWHC/Comm';
  // for comm court starts at 1995 and runs to present ...
  for (x=1995;x<=2012;x++) {
    index[court][x] = {};
  }

  for (year in index[court]) {
    var url = BAILII + court + '/' + year + '/';
    request(url, function(error, response, body) {
      console.log('Processing court ' + court + ' for year: ' + year);
      $ = cheerio.load(body);
      // <li><a href="/ew/cases/EWHC/Comm/2012/87.html">Abuja International Hotels Ltd. v Meridien Sas <a title="Link to BAILII version" href="/ew/cases/EWHC/Comm/2012/87.html">[2012] EWHC 87 (Comm)</a> (26 January 2012)</a></li>
      $('li').each(function(idx, html) {
        var data = {};
        var $a = $(html).find('a').first();
        data.url = $a.attr('href');
        // note numbers are not always actual integers e.g. B26
        data.bailii_number = data.url.split('/').reverse()[0].split('.html')[0];
        var _content = $a.html();
        var _parts = _content.split(' <a');
        data.title = _parts[0];
        data.rawdate = _parts[1].split('</a> (').reverse()[0].replace(')', '');
        data.date = new Date(data.rawdate).toISOString().slice(0, 10);
        data.id = [court, year, data.bailii_number].join('::');
        index[court][year][data.bailii_number] = data;
        save();
      });
    });
  }

  function save() {
    var data = JSON.stringify(index, null, 2);
    fs.writeFileSync('cache/scrape/index.json', data);
  }
}

buildIndex();

