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

  assert.AssertionError.prototype.summary = function() {
    return this.name + (this.message ? ': ' + this.message : '');
  };

  assert.AssertionError.prototype.details = function() {
    return 'In "' + this.operator + '":\n\tExpected: ' + this.expected + '\n\tFound: ' + this.actual;
  };

  assert.AssertionError.prototype.toString = function() {
    return this.summary() + '\n' + this.details();
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

  assert.throws = function(block, error, message) {
    throws.apply(this, [true].concat(Array.prototype.slice.call(arguments)));
  };

  assert.doesNotThrow = function(block, error, message) {
    throws.apply(this, [false].concat(Array.prototype.slice.call(arguments)));
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

  function objKeys(o) {
    var result = [];
    for (var name in o) {  
      if (o.hasOwnProperty(name))  
        result.push(name);  
    }  
    return result;  
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
      return deepEqual(a, b);
    }

    try {
      var ka = objKeys(a),
        kb = objKeys(b),
        key, i;
    } catch (e) {
      console.log(a, b)
      console.log(e);
      return false;
    }

    if (ka.length !== kb.length)
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

  function throws(expected, block, error, message) {
    var exception,
        actual,
        actual = false,
        operator = expected ? 'throws' : 'doesNotThrow';
        callee = expected ? assert.throws : assert.doesNotThrow;

    if (typeof error === 'string' && !message) {
      message = error;
      error = null;
    }

    message = message || '';

    try {
      block();
    } catch (e) {
      actual = true;
      exception = e;
    }

    if (expected && !actual) {
      fail((exception || Error), (error || Error), 'Exception was not thrown\n' + message, operator, callee); 
    } else if (!expected && actual) {
      fail((exception || Error), null, 'Unexpected exception was thrown\n' + message, operator, callee); 
    } else if (expected && actual && error && exception.constructor != error) {
      fail((exception || Error), null, 'Unexpected exception was thrown\n' + message, operator, callee); 
    }
  };

  global.assert = assert;
})(typeof window === 'undefined' ? this : window);

