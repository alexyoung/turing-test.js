(function() {
  var env, node;

  if (typeof require !== 'undefined') {
    require.paths.unshift('./');
  }

  function detectEnvironment() {
    if (typeof env !== 'undefined') {
      return env;
    }

    env = (function() {
      if (typeof XPCOMCore !== 'undefined') {
        return 'xpcomcore';
      } else if (typeof window === 'undefined' && typeof java !== 'undefined') {
        return 'rhino';
      } else if (typeof exports !== 'undefined') {
        // TODO: Node should be checked more thoroughly
        node = {
          fs: require('fs'),
          sys: require('sys')
        }

        return 'node';
      } else if (typeof window === 'undefined') {
        return 'non-browser-interpreter';
      } else {
        return 'browser';
      }
    })();

    return env;
  }

  TuringTest = {
    isLoading: false,
    loadingItems: 0,

    webRelativePath: '',

    loading: function() {
      TuringTest.loadingItems++;
      TuringTest.isLoading = true;
    },

    doneLoading: function() {
      TuringTest.loadingItems--;
      if (TuringTest.loadingItems === 0) TuringTest.isLoading = false;
    },

    load: function(script, eval) {
      function addEvent(obj, type, fn)  {
        if (obj.attachEvent) {
          obj['e' + type + fn] = fn;
          obj[type + fn] = function(){obj['e' + type + fn](window.event);}
          obj.attachEvent('on' + type, obj[type + fn]);
        } else
          obj.addEventListener(type, fn, false);
      }
        
      switch (detectEnvironment()) {
        case 'xpcomcore':
        case 'rhino':
        case 'non-browser-interpreter':
          load(script);
        break;

        case 'node':
          // Evaluate the required code in the global context, like Rhino's load() would
          eval(node.fs.readFileSync(script).toString());
        break;

        case 'browser':
          var scriptTag = document.createElement('script'),
              head = document.getElementsByTagName('head');
          this.loading();
          addEvent(scriptTag, 'load', TuringTest.doneLoading);
          scriptTag.setAttribute('type', 'text/javascript');
          scriptTag.setAttribute('src', script);
          head[0].insertBefore(scriptTag, head.firstChild);
        break;
      }
    },

    addStyleSheet: function() {
      var link = document.createElement('link'),
          head = document.getElementsByTagName('head');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', this.webRelativePath + 'stylesheets/screen.css');
      head[0].insertBefore(link, head.firstChild);
    },

    installBrowserPatching: function() {
      window.exports = [];

      window.require = function() {
        return {
          run: function() {
            exports.run(exports);
          }
        };
      };

      window.require.paths = {
        unshift: function() {}
      };
    },

    installBrowserSupport: function() {
      TuringTest.load(TuringTest.webRelativePath + 'lib/test.js');
      TuringTest.load(TuringTest.webRelativePath + 'lib/assert.js');
      TuringTest.installBrowserPatching();
      TuringTest.addStyleSheet();
      TuringTest.test = {
        run: function(tests) {
          if (TuringTest.isLoading) {
            setTimeout(function() { TuringTest.test.run(tests); }, 10);
          } else {
            return TuringTest.testRunner.run(tests);
          }
        }
      };
      TuringTest.assert = window.assert;
    },

    init: function(options) {
      options = options || {};

      switch (detectEnvironment()) {
        case 'node':
          exports.load = TuringTest.load;
          exports.test = require(__dirname + '/lib/test');
          exports.assert = require(__dirname + '/lib/assert').assert;
        break;

        case 'browser':
          this.webRelativePath = options.webRelativePath || '';
          this.installBrowserSupport();
        break;
      }

      if (options.webScripts && options.eval) {
        for (var i = 0; i < options.webScripts.length; i++) {
          TuringTest.load(options.webScripts[i], options.eval);
        }
      }
    }
  };

  switch (detectEnvironment()) {
    case 'node':
      exports.init = TuringTest.init;
    break;
  }
})();
