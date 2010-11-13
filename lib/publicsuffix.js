var list = require('./publicsuffix-list').list;

exports.extract = extract;
exports.extractURL = extractURL;

// Transform list in regexps
(function() {
  var reList = {'reject':[], 'wildcard':[], 'accept':[]}, ary, i, l, re;
  
  ary = list['reject'];
  for (var i=0, l=ary.length; i<l; i++) {
    re = new RegExp('(.+\\.|)(' + ary[i].replace(/\./g, '\\.') + ')$', 'i');
    reList['reject'].push(re);
  }
  
  ary = list['wildcard'];
  for (var i=0, l=ary.length; i<l; i++) {
    // FIXME: left-hand rules eaths too much sub-domains
    re = new RegExp('(.+\\.|)((?:[^\\.]+\\.|)[^\\.]+\\.' + ary[i].replace(/\./g, '\\.') + ')$', 'i');
    reList['wildcard'].push(re);
  }
  
  ary = list['accept'];
  for (var i=0, l=ary.length; i<l; i++) {
    // FIXME: left-hand rules eaths too much sub-domains
    re = new RegExp('(.+\\.|)((?:[^\\.]+\\.|)' + ary[i].replace(/\./g, '\\.') + ')$', 'i');
    reList['accept'].push(re);
  }
  
  // Replace list to free memory
  list = reList;
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
// @return array [sub-domain, registered-domain|public-suffix]
function extract(domain) {
  debug("for", domain);
  var ret, fixme;
  
  // Skip if this loosely-matching IP address is found
  // TODO: match IPv6 addresses
  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) return ["", domain];
  
  if (!ret) {
    debug('try reject');
    ret = findFirst(list['reject'], domain);
  }

  if (!ret) {
    debug('try accept');
    ret = findLongest(list['accept'], domain);
    // Fix that bugger
    if (ret && ret[0]) {
      fixme = ret[0].split(/([^\.]+\.)$/);
      ret[0] = fixme[0];
      ret[1] = fixme[1] + ret[1];
    }
  }

  if (!ret) {
    debug('try wildcard');
    ret = findFirst(list['wildcard'], domain);
    // Fix that bugger
    if (ret && ret[0]) {
      fixme = ret[0].split(/([^\.]+\.)$/);
      ret[0] = fixme[0];
      ret[1] = fixme[1] + ret[1];
    }
  }
  
  if (!ret) {
    debug('set default');
    ret = /^(.*)([^\.]+\.[^\.]+)$/.exec(domain);
    ret.shift();
  }
  debug("result", ret);
  return ret;
}

// Like extract but with more
// @param string URL or IPv4
// @return array [prefix, registered-domain, postfix]
function extractURL(str) {
  var ary = /^(\s*[a-z]+:(?:\/\/)?(?:[^@:]+(?::[^@:]+)?@)?|)([^\/:]+)(.*)$/.exec(str);
  
  // Remove global match
  ary = ary.slice(1);
  
  debug("split", ary);
  
  var ary2 = extract(ary[1]);
  // append prefix
  ary[0] += ary2[0];
  ary[1] = ary2[1];

  return ary;
}

// @private
function findLongest(list, domain) {
  var results = [], i, l, re, md;
  
  for (i=0, l=list.length; i<l; i++) {
    if ((md = list[i].exec(domain))) {
      results.push(md.slice(1));
    }
  }
  
  debug("longest matches", results);
  
  if (results.length > 0) {
    results.sort(function (a,b) {
      return b[1].length - a[1].length;
    });
    
    return results[0];
  }
  
  return null;
}

// @private
function findFirst(list, domain) {
  var i, l, re, md;
  
  for (i=0, l=list.length; i<l; i++) {
    if ((md = list[i].exec(domain))) {
      debug("found first with", list[i]);
      return md.slice(1);
    }
  }
}

debug("test");

// Utils
/*function debug(msg, obj) {
  var s = require('sys');
  if (arguments.length > 1) {
    s.puts(msg + ": " + s.inspect(obj));
  } else {
    s.puts(msg);
  }
}*/
function debug() { }
