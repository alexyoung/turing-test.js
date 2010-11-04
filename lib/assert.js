(function(global) {
  var assert = {};

  assert.AssertionError = function AssertionError(options) {
    this.name = 'AssertionError';
    this.message = options.message;
    this.actual = options.actual;
    this.expected = options.expected;
    this.operator = options.operator;
    var stackStartFunction = options.stackStartFunction || fail;
  };

  function fail(actual, expected, message, operator, stackStartFunction) {
    throw new assert.AssertionError({
      message: message,
      actual: actual,
      expected: expected,
      operator: operator,
      stackStartFunction: stackStartFunction
    });
  }

  assert.fail = fail;

  assert.ok = function(value, message) {
    if (!!!value)
      fail(value, true, message, '==', assert.ok);  
  };

  assert.equal = function(actual, expected, message) {
    if (actual != expected)
      fail(actual, expected, message, '==', assert.equal);  
  };

  window.assert = assert;
})(typeof window === 'undefined' ? this : window);
