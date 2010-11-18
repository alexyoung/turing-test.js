var logger, Tests, printMessage;

printMessage = (function() {
  if (typeof window !== 'undefined') {
    return function(message) {
      var li = document.createElement('li');
      li.innerHTML = '<pre>' + message + '</pre>';
      document.getElementById('results').appendChild(li);
    }
  } else if (typeof console !== 'undefined') {
    return console.log;
  } else {
    return function() {};
  }
})();

logger = {
  display: function(message) {
    printMessage(message);
  },

  error: function(message) {
    this.display('E: ' + message);
  },

  fail: function(message) {
    this.display('F: ' + message);
  }
};

Tests = {
  results: [],
  passed: 0,
  failed: 0,
  errors: 0,

  Result: function(testName) {
    return { name: testName, message: null };
  },

  run: function(testName, obj) {
    var result = new Tests.Result(testName);

    function showException(e) {
      if (!!e.stack) {
        logger.display(e.stack);
      } else {
        logger.display(e);
      }
    }

    try {
      // TODO: Setup
      obj[testName]();
      this.passed += 1;
    } catch (e) {
      if (e.name === 'AssertionError') {
        result.message = e.toString();
        logger.fail('Assertion failed in: ' + testName);
        showException(e);
        this.failed += 1;
      } else {
        logger.error('Error in: ' + testName);
        showException(e);
        this.errors += 1;
      }
    } finally {
      // TODO: Teardown
    }

    this.results.push(result);
  },

  report: function() {
    logger.display('Passed: ' + this.passed);
    logger.display('Failed: ' + this.failed);
    logger.display('Errors: ' + this.errors);
  }
};

exports.run = function(obj) {
  for (var testName in obj) {
    // TODO: Run objects that match ^test
    if (testName.match(/^test/i))
      Tests.run(testName, obj);
  }
  Tests.report();
};

