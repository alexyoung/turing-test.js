(function() {
  var logger,
      Tests,
      printMessage,
      colorize = true;

  printMessage = (function() {
    function htmlEntityToUTF(text) {
      switch (text) {
        case '&#10005;':
          return '\u2715';
        break;

        case '&#10003;':
          return '\u2713';
        break;

        case '&#9760;':
          return '\u2620';
        break;
      }
      return text;
    }

    function messageTypeToColor(messageType) {
      switch (messageType) {
        case 'pass':
          return '32';
        break;

        case 'fail':
          return '31';
        break;
      }

      return '';
    }

    if (typeof window !== 'undefined') {
      return function(message, messageType, prefix) {
        var li = document.createElement('li');
        li.innerHTML = (prefix ? prefix + ' ' : '') + (message && message.length > 0 ? message.replace(/\n/, '<br/>') : message.toString());
        if (messageType) li.className = messageType;
        document.getElementById('results').appendChild(li);
      }
    } else if (typeof console !== 'undefined') {
      return function(message, messageType, prefix) {
        var col      = colorize ? messageTypeToColor(messageType) : false;
            startCol = col ? '\033[' + col + 'm' : '',
            endCol   = col ? '\033[0m' : '',
        console.log(startCol + (prefix ? htmlEntityToUTF(prefix) + ' ' : '') + message + endCol);
      };
    } else {
      return function() {};
    }
  })();

  logger = {
    display: function(message, className, prefix) {
      printMessage(message, className || 'trace', prefix || '');
    },

    error: function(message) {
      this.display(message, 'error', '&#9760;');
    },

    pass: function(message) {
      this.display(message, 'pass', '&#10003;');
    },

    fail: function(message) {
      this.display(message, 'fail', '&#10005;');
    }
  };

  function run(obj) {
    for (var testName in obj) {
      // TODO: Run objects that match ^test
      if (testName.match(/^test/i))
        Tests.run(testName, obj);
    }
  }

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

      if (typeof obj[testName] === 'object') {
        logger.display('Running: ' + testName);
        return run(obj[testName]);
      }

      try {
        // TODO: Setup
        obj[testName]();
        this.passed += 1;
        logger.pass(testName);
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
      logger.display('');
      logger.display('Report:', 'header');
      logger.pass('Passed: ' + this.passed);
      logger.fail('Failed: ' + this.failed);
      logger.error('Errors: ' + this.errors);
    },

    runAll: function(tests) {
      if (typeof TuringTest !== 'undefined' && TuringTest.isLoading) {
        setTimeout(function() { Tests.runAll(tests); }, 10);
      } else {
        run(tests);
        Tests.report();
      }
    }
  };

  if (typeof window === 'undefined') {
    exports.run = Tests.runAll;
  } else if (TuringTest) {
    TuringTest.testRunner = { run: Tests.runAll };
  }
})();

