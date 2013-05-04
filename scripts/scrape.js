var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var csv = require('csv');

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

// DB structure
var headers = [ 'id', 'court', 'division', 'year', 'number', 'date', 'url', 'title' ];
// Court = Court (Group) Code (e.g. EWHCi = England and Wales High Court)
// number = bailii number
function buildIndex() {
  // by courts then years then cases ...
  var index = [];
  var court = 'EWHC/Comm';

  // for comm court starts at 1995 and runs to present ...
  for (year=1995;year<=2012;year++) {
    var url = BAILII + court + '/' + year + '/';
    getInfo(url, court, year, function() {
      save(index);
    });
  }

  // split out to avoid scoping issues
  function getInfo(url, court, year, cb) {
    request(url, function(error, response, body) {
      console.log('Processing court ' + court + ' for year: ' + year);
      $ = cheerio.load(body);
      // <li><a href="/ew/cases/EWHC/Comm/2012/87.html">Abuja International Hotels Ltd. v Meridien Sas <a title="Link to BAILII version" href="/ew/cases/EWHC/Comm/2012/87.html">[2012] EWHC 87 (Comm)</a> (26 January 2012)</a></li>
      $('li').each(function(idx, html) {
        var data = {
          year: year,
          court: court.split('/')[0],
          division: court.split('/')[1]
        };
        var $a = $(html).find('a').first();
        data.url = $a.attr('href');
        // note numbers are not always actual integers e.g. B26
        data.number = data.url.split('/').reverse()[0].split('.html')[0];
        var _content = $a.html();
        var _parts = _content.split(' <a');
        data.title = _parts[0];
        var _datepart = _parts[1]
          // fix up
          .replace('(Comm</a> )', '(Comm)</a>')
          .split('</a> (')
          .reverse()[0];
        var rawdate = _datepart.replace(')', '')
          .replace(',', '')
          .replace('th', '')
          .replace('rd', '')
          .replace('st', '')
          .replace('nd', '')
          // fix for typo
          .replace('Before:', '')
          ;
        try {
          data.date = new Date(rawdate).toISOString().slice(0, 10);
        } catch(e) {
          console.log(_content);
          console.log(_datepart);
          console.log(rawdate);
        }
        data.id = [data.court, data.division, data.year, data.number].join('-');
        data.id = data.id.toLowerCase();
        index.push(data);
        cb();
      });
    });
  }

  function save(data) {
    csv()
      .from(data)
      .to.path('data/decisions.csv', {columns: headers, header: true} )
      ;
  }
}

buildIndex();

