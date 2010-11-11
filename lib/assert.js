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

  assert.notEqual = function(actual, expected, message) {
    if (actual == expected)
      fail(actual, expected, message, '!=', assert.equal);  
  };

  assert.strictEqual = function(actual, expected, message) {
    if (actual !== expected)
      fail(actual, expected, message, '===', assert.equal);  
  };

  assert.notStrictEqual = function(actual, expected, message) {
    if (actual === expected)
      fail(actual, expected, message, '!==', assert.equal);  
  };

  assert.deepEqual = function(actual, expected, message) {
    if (!deepEqual(actual, expected))
      fail(actual, expected, message, 'deepEqual', assert.equal);  
  };

  assert.notDeepEqual = function(actual, expected, message) {
    if (deepEqual(actual, expected))
      fail(actual, expected, message, 'notDeepEqual', assert.equal);  
  };

  function deepEqual(actual, expected) {
    if (actual === expected) {
      return true;
    } else if (actual instanceof Date && expected instanceof Date) {
      return actual.getTime() === expected.getTime();
    } else if (typeof actual != 'object' && typeof expected != 'object') {
      return actual == expected;
    } else {
      return objEquiv(actual, expected);
    }
  }

  function isUndefinedOrNull(value) {
    return value === null || value === undefined;
  }

  function isArguments(object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
  }

  function objEquiv(a, b) {
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
      return false;

    if (a.prototype !== b.prototype) return false;
    if (isArguments(a)) {
      if (!isArguments(b)) {
        return false;
      }
      a = Array.prototype.slice.call(a);
      b = Array.prototype.slice.call(b);
      return _deepEqual(a, b);
    }

    try {
      var ka = Object.keys(a),
        kb = Object.keys(b),
        key, i;
    } catch (e) {
      return false;
    }

    if (ka.length != kb.length)
      return false;

    ka.sort();
    kb.sort();

    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] != kb[i])
        return false;
    }

    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      if (!deepEqual(a[key], b[key] ))
         return false;
    }

    return true;
  }

  global.assert = assert;
})(typeof window === 'undefined' ? this : window);

