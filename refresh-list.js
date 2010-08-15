//
// Engine: node
//
// Fetches the list and make it a commonjs module
//

var sys = require('sys'),
  http = require('http'),
  fs = require('fs');
  
fetchList(function(list) {
  // Remove cruft
  var list = cleanupList(list.split("\n"));
  
  var json_list = JSON.stringify(list);
  
  var header = "exports.list = ";
  
  var out = fs.createWriteStream('lib/publicsuffix-list.js');
  out.write(header);
  out.write(json_list);
});

// Transforms list in a big hash of hashes
//
// Data structure:
//  {
//     "com": [node_info, {}]
//  }
//
// Where node_info can be:
//   nil not a node
//   1 end
//   2 wildcard
//   3 not
//   4 not-wildcard


function topDown(ary_list) {
  var top = {};
  for (var i=0, l=ary_list.length; i<l; i++) {
    var s = ary_list[i].split('.'),
      t = top;
    while (s.length > 0) {
      
    }
  }
}


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