require.paths.unshift('lib');
var ps = require('publicsuffix'),
  assert = require('assert'),
  sys = require('sys'),
  tests = [];


// Reject
test('www.foo.educ.ar', ['www.foo.', 'educ.ar']);
// Accept
test('www.foo.com.ac', ['www.', 'foo.com.ac']);
// Accept without sub-domain
test('google.co.uk', ['', 'google.co.uk']);
// Accept without public-suffix
test('co.uk', ['', 'co.uk']);
// UTF-8 accept
test('www.教育.hk', ['', 'www.教育.hk']);
// IPv4
test('127.0.0.1', ['', '127.0.0.1']);
// Cases, you need to lowerCase() the domain yourself
test('XxX.CaseTest.coM', ['XxX.', 'CaseTest.coM']);


testURL('http://127.0.0.1:8080/test.hmtl', ['http://', '127.0.0.1', ':8080/test.hmtl']);
testURL('http://oree.ch/freepass', ['http://', 'oree.ch', '/freepass']);
testURL('https://oree.ch/freepass', ['https://', 'oree.ch', '/freepass']);
testURL('http://www.oree.ch/freepass', ['http://www.', 'oree.ch', '/freepass']);
testURL('http://user:pass@example.org', ['http://user:pass@', 'example.org', '']);
testURL('google.com', ['', 'google.com', '']);
testURL('mailto:foo@example.com', ['mailto:foo@', 'example.com', '']);

for (var i=0, l=tests.length; i<l; i++) {
  sys.puts("Running test " + i + "/" + l);
  tests[i]();
}
sys.puts("All tests passed");


function test(source, expected) {
  tests.push(function() {
    assert.deepEqual(ps.extract(source), expected);
  });
}

function testURL(source, expected) {
  tests.push(function() {
    assert.deepEqual(ps.extractURL(source), expected);
  });
}
