var sys = require('sys');

exports.extract = extract;

// Prepare list into regexps
var list = (function() {
  var list = require('./publicsuffix-list').list,
    reList = {'reject':[], 'wildcard':[], 'accept':[]}, ary, i, l, re;
  
  ary = list['reject'];
  for (var i=0, l=ary.length; i<l; i++) {
    re = new RegExp('(?:(.+)\\.)?(' + ary[i].replace(/\./g, '\\.').replace('\\.', ')\\.(') + ')$');
    reList['reject'].push(re);
  }
  
  ary = list['wildcard'];
  for (var i=0, l=ary.length; i<l; i++) {
    re = new RegExp('(?:(?:(.+)\\.)?([^\\.]+)\\.)?([^\\.]+\\.' + ary[i].replace(/\./g, '\\.') + ')$');
    reList['wildcard'].push(re);
  }
  
  ary = list['accept'];
  for (var i=0, l=ary.length; i<l; i++) {
    re = new RegExp('(?:(?:(.+)\\.)?([^\\.]+)\\.)?(' + ary[i].replace(/\./g, '\\.') + ')$');
    reList['accept'].push(re);
  }
  
  return reList;
}());


// Gets the prefix and public-suffix out of a full domain
/*
Algorithm

1. Match domain against all rules and take note of the matching ones.
2. If no rules match, the prevailing rule is "*".
3. If more than one rule matches, the prevailing rule is the one which is an exception rule.
4. If there is no matching exception rule, the prevailing rule is the one with the most labels.
5. If the prevailing rule is a exception rule, modify it by removing the leftmost label.
6. The public suffix is the set of labels from the domain which directly match the labels of the prevailing rule (joined by dots).
7. The registered domain is the public suffix plus one additional label.

*/

// @param string domain a full domain
// @return array [sub-domain, registered-domain, public-suffix]
function extract(domain) {
  var ret;
  
  domain = domain.toLowerCase();

  if ((ret = findFirst(list['reject'], domain))) {
    return ret;
  }

  if ((ret = findLongest(list['accept'], domain))) {
    return ret;
  }

  if ((ret = findFirst(list['wildcard'], domain))) {
    return ret;
  }
  
  sys.puts("default");
  
  // Not in database, just return [*, 'domain', 'tld']
  var split = domain.split('.');
  return [split.pop(), split.pop(), split.join('.')].reverse();
}

// @private
function findLongest(list, domain) {
  var results = [], i, l, re, md;
  
  for (i=0, l=list.length; i<l; i++) {
    if ((md = list[i].exec(domain))) {
      results.push([md[1], md[2], md[3]]);
    }
  }
  
  results.sort(function (a,b) {
    return b[2].length - a[2].length;
  });
  
  return results[0];
}

// @private
function findFirst(list, domain) {
  var i, l, re, md;
  
  for (i=0, l=list.length; i<l; i++) {
    if ((md = list[i].exec(domain))) {
      return [md[1], md[2], md[3]];
    }
  }
}

function p(obj) {
  sys.puts(sys.inspect(obj));
}

if (module.id == '.') {
(function() {
  var sys = require('sys'),
    assert = require('assert');
  
  test('www.foo.co.rs', ['www', 'foo', 'co.rs']);
  //test('google.co.uk', [null, 'google', 'co.uk']);
  test('www.google.co.uk', ['www', 'google', 'co.uk']);
  test('www.教育.hk', [null, 'www', '教育.hk']);
  
    
  function test(source, expected) {
    assert.deepEqual(extract(source), expected);
  }
}());
}

