//
// Engine: node
//
// Fetches the list and make it a commonjs module
//

var sys = require('sys'),
  http = require('http'),
  fs = require('fs');
  
fetchList(function(lines) {
  // Remove cruft
  var lines = cleanupList(lines.split("\n")),
    list = {'reject':[], 'accept':[], 'wildcard':[]},
    i, l, md, type;
  
  for (i=0, l=lines.length; i<l; i++) {
    md = /^(!|\*\.|)([^\s]+)/.exec(lines[i]);
    if (md[1] == '!') {
      type = list['reject'];
    } else if (md[1] == '*.') {
      type = list['wildcard'];
    } else {
      type = list['accept'];
    }
    type.push(md[2]);
  }
  
  var header = "exports.list=";
  var js_list = sys.inspect(list, false, 999);
  
  var out = fs.createWriteStream('lib/publicsuffix-list.js');
  out.write(header);
  out.write(js_list);
});

// sync: Remove useless lines
function cleanupList(ary_list) {
  return keep(ary_list, function(line) {
    return !/^$|^\/\/|^\s/.test(line);
  });
}

// sync: Keep items in array that match cond(item)
function keep(ary, cond) {
  var new_ary = [];
  for(var i=0, l=ary.length; i<l; i++) {
    if (cond(ary[i])) {
      new_ary.push(ary[i]);
    }
  }
  return new_ary;
}

// async: Get the list from mozilla
function fetchList(fn) {
  var fulllist = [];
  // Full uri : http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1
  var cli = http.createClient(80, 'mxr.mozilla.org');
  var request = cli.request('GET', '/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1',
    {'host': 'mxr.mozilla.org'});
  request.addListener('response', function (response) {
    response.setEncoding('utf8');
    response.addListener('data', function (chunk) {
      fulllist.push(chunk);
    });
    response.addListener('end', function() {
      fn(fulllist.join(''));
    });
  });
  request.end();
}
