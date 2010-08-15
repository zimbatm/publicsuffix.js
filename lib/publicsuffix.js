var list = require('./publicsuffix-list').list,
  sys = require('sys');

exports.extract = extract;

//
//
// @param string domain a full domain
// @return array [subdomain, domain, suffix]
function extract(domain) {
  var ary = [];

  list.forEach(function(obj) {
    if (obj[0] === '*') {

    }
  });
  
  return [subdomain, domain, suffix];
}

sys.puts(sys.inspect(list));
