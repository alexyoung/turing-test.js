if (typeof require !== 'undefined') {
  if (typeof require.paths !== 'undefined')
    require.paths.unshift('lib/');
  var assert = require('assert');
}

exports['test equal'] = function() {
  assert.equal(true, true, 'True should be true');
};

exports['test ok'] = function() {
  assert.ok(true, 'True should be OK');
};

exports['test failed assertions'] = function() {
  assert.ok(false, 'Is not OK');
};

exports['test exceptions are caught by the reporter'] = function() {
  throw('Intentionally raised');
};

exports['test weird things are caught'] = function() {
  a + 1;
};

if (typeof module !== 'undefined')
  if (module === require.main) 
    require('test').run(exports);

