var DB = {};
var searchIndex = null;
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
var courtsLookup = {};
_.each(courts.records, function(rec) {
  courtsLookup[rec[0]] = rec.slice(1).join(' ');
});

jQuery(document).ready(function($) {
  var url = 'data/decisions.csv';
  $.get(url, function(rawdata) {
    var parsed  = recline.Backend.CSV.parseCSV(rawdata);
    var headers = parsed[0];
    var rows = parsed.slice(1);
    var records = _.map(rows, function(row) {
      var out = _.object(headers, row);
      out.id = [out.court,  out.division, out.year, out.number].join('/');
      out.courtfull = courtsLookup[out.court + '/' + out.division];
      DB[out.id] = out;
      return out
    });
   
    // limit records due to limitations of lunr (30k records is too much!)
    records = _.filter(records, function(rec) {
      return (
        rec.court.indexOf('EWHC') != -1
        &&
        rec.division in { 'Comm': '', 'Ch': '' }
      )
    });

    $('.fulltotal').text(records.length);

    searchIndex = lunr(function () {
      this.field('title', {boost: 10})
    });
    _.each(records.slice(0, 10000), function(record) {
      searchIndex.add(record);
    });

    $('.loading').hide();

    doSearch('BP');
  });

  $('.js-search').submit(function(e) {
    var query = $('.js-search input').val();
    doSearch(query);
    e.preventDefault();
  });
});

var compiled = _.template(' \
  <div class="decision"> \
    <h3> \
      <a href="http://www.bailii.org<%= url %>" target="_blank"> \
        <%= title %> (<%= year %>) \
      </a> \
    </h3> \
    <p><%= courtfull %></p> \
  </div> \
');

function doSearch(q) {
  if (!q) {
    q = '*:*';
  }
  var $results = $('.results');
  $results.empty();
  var results = searchIndex.search(q).slice(0,20);
  _.each(results, function(r) {
    var decision = DB[r.ref];
    var $res = compiled(decision);
    $results.append($res);
  });
  if (results.length === 0) {
    $results.html('<p>No results</p>');
  }
}
