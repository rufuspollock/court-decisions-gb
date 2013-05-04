var fs = require('fs');

var request = require('request');
var cheerio = require('cheerio');
var csv = require('csv');
var async = require('async');

var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1309.0 Safari/537.17';
var BAILII = 'http://www.bailii.org/ew/cases/';

// URL structure
// 
// index pages look like ...
// /ew/cases/EWHC/Comm/
// /ew/cases/EWHC/Comm/1995/

// DB structure
var headers = [ 'court', 'division', 'year', 'number', 'date', 'url', 'title' ];
// Court = Court (Group) Code (e.g. EWHCi = England and Wales High Court)
// number = bailii number


// List from http://www.bailii.org/databases.html#ew
// Copy and past and then use this regex
// %s/^England and Wales \([^)]*\) (\([^)]*\).*/  [ 'EWHC\/xxx', 'England and Wales', '\1', '\2' ],/gc
//
// Currently exclude (to reduce issues with personal identification)
// England and Wales Magistrates' Court (Family)
// England and Wales County Court (Family)
// [ 'EWHC/', 'England and Wales', 'High Court', 'Family Division' ],
// [ 'EWHC/COP', 'England and Wales', 'High Court', 'Court of Protection' ],
var courts = {
  fields: [ 'id', 'region', 'court', 'division' ],
  records: [
    [ 'EWCA/Civ', 'England and Wales', 'Court of Appeal', 'Civil Division' ],
    [ 'EWCA/Crim', 'England and Wales', 'Court of Appeal', 'Criminal Division' ],
    [ 'EWHC/Admin', 'England and Wales', 'High Court', 'Administrative Court' ],
    [ 'EWHC/Admlty', 'England and Wales', 'High Court', 'Admiralty Division' ],
    [ 'EWHC/Ch', 'England and Wales', 'High Court', 'Chancery Division' ],
    [ 'EWHC/Comm', 'England and Wales', 'High Court', 'Commercial Court' ],
    [ 'EWHC/Costs', 'England and Wales', 'High Court', 'Senior Court Costs Office' ],
    [ 'EWHC/Exch', 'England and Wales', 'High Court', 'Exchequer Court' ],
    [ 'EWHC/KB', 'England and Wales', 'High Court', 'King\'s Bench Division' ],
    [ 'EWHC/Mercantile', 'England and Wales', 'High Court', 'Mercantile Court' ],
    [ 'EWHC/Patents', 'England and Wales', 'High Court', 'Patents Court' ],
    [ 'EWHC/QB', 'England and Wales', 'High Court', 'Queen\'s Bench Division' ],
    [ 'EWHC/TCC', 'England and Wales', 'High Court', 'Technology and Construction Court' ],
    [ 'EWPCC', 'England and Wales', 'Patents County Court', '' ]
  ]
};

function buildIndex() {
  // by courts then years then cases ...
  var index = [];
  var court = 'EWHC/Comm';

  var pages = [];
  // let's build the list of index pages to scrape
  // Note that some courts have much older decisions (e.g. from 1800s)
  courts.records.forEach(function(court) {
    for (year=1990;year<=2013;year++) {
      var url = BAILII + court[0] + '/' + year + '/';
      pages.push({url: url, court: court[0], year: year});
    }
  });

  async.eachSeries(pages, getInfo, function(err) {
    console.log('Completed');
    if (err) {
      console.log('Error' + err);
    } else {
      save(index);
    }
  });

  function getInfo(info, cb) {
    var url = info.url,
      court = info.court,
      year = info.year
      ;
    request(url, function(error, response, body) {
      console.log('Processing court ' + court + ' for year: ' + year);
      $ = cheerio.load(body);
      // <li><a href="/ew/cases/EWHC/Comm/2012/87.html">Abuja International Hotels Ltd. v Meridien Sas <a title="Link to BAILII version" href="/ew/cases/EWHC/Comm/2012/87.html">[2012] EWHC 87 (Comm)</a> (26 January 2012)</a></li>
      // sometimes no link ...
      // <li>Maple Leaf Macro Volatility Master Fund & Anor v Rouvroy & Anor [2009] EWCA Civ 1334 (temporary reference) (17 November 2009)</li>
      $('li').each(function(idx, html) {
        var data = {
          year: year,
          court: court.split('/')[0],
          division: court.split('/')[1]
        };
        var $a = $(html).find('a').first();
        parseLink($a, data);
        index.push(data);
      });
      cb();
    });
  }

  function parseLink($a, data) {
    data.url = $a.attr('href');
    // note numbers are not always actual integers e.g. B26
    data.number = data.url.split('/').reverse()[0].split('.html')[0];

    var _content = $a.html();
    if (_content.indexOf('<a') != -1) {
      var _parts = _content.split('<a');
    } else {
      var _parts = _content.split('[');
    }
    data.title = _parts[0]
      // strip
      .replace(/^\s+|\s+$/g, '');

    // have to be quite careful e.g. here we have an intial (...) ending with digits but not a date
    // HLB Kidsons (a firm) v Lloyds Underwriters (Policy No 621/PKID00101) & Ors <a title="Link to BAILII version" href="/ew/cases/EWHC/Comm/2007/2699.html">[2007] EWHC 2699 (Comm)</a> (22 November 2007)
    var _datepart = _content.match(/\([^()]+\d\d\d\d[\)$]/g);
    try {
      if (_datepart === null) {
        throw 'Failed to locate date';
      } else {
        _datepart = _datepart[_datepart.length-1];
        _datepart = _datepart.replace('(', '')
          .replace(')', '')
          .replace(',', '')
          .replace('th', '')
          .replace('h', '')
          .replace('rd', '')
          .replace('st', '')
          .replace('nd', '')
          // fix for typo
          .replace('Before:', '')
          ;
        data.date = new Date(_datepart).toISOString().slice(0, 10);
      }
    } catch(e) {
      console.log(e.toString());
      console.log(_content);
      console.log(_datepart);
    }
    return data;
  }

  function save(data) {
    var fp = 'data/decisions.csv';
    console.log('Saving data to file: ' + fp);
    csv()
      .from(data)
      .to.path(fp, {columns: headers, header: true} )
      ;
  }
}

function scrapePage() {
  request({url: 'http://www.bailii.org/ew/cases/EWHC/Comm/2012/87.html'}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Print the google web page.
    }
  });
}

buildIndex();

