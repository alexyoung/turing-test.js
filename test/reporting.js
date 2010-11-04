if (typeof require !== 'undefined') {
  if (typeof require.paths !== 'undefined')
    require.paths.unshift('lib/');
  var assert = require('assert');
}

exports['test reports'] = function() {
  assert.ok(true, 'This should be reported as a test from reporting.js');
};

if (typeof module !== 'undefined')
  if (module === require.main) 
    require('test').run(exports);

