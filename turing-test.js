(function() {
  var env, node, tt;

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

  tt = TuringTest = {
    isLoading: false,
    loadingItems: 0,

    webRelativePath: '',
    browserPaths: [],

    loading: function() {
      tt.loadingItems++;
      tt.isLoading = true;
    },

    doneLoading: function(request) {
      tt.loadingItems--;
      if (tt.loadingItems === 0) tt.isLoading = false;
    },

    load: function(script, eval) {
      if (!window.__turingTestInit) {
        window.__turingTestInit = true;
        TuringTest.init();
      }

      if (!script.match(/\.js$/)) {
        script = script + '.js';
      }

      if (!script.match(/\//)) {
        script = tt.browserPaths[0] + '/' + script;
        script = script.replace(/\.\//, '');
      }

      function loadIEScript() {
        var id = '__id_' + (new Date()).valueOf(),
            timer,
            scriptTag;
        document.write('<script id="' + id + '" type="text/javascript" src="' + script + '"></script>');
        scriptTag = document.getElementById(id);

        timer = setInterval(function() {
          if (/loaded|complete/.test(scriptTag.readyState)) {
            clearInterval(timer);
            tt.doneLoading();
          }
        }, 10);
      }

      function loadOtherScript() {
        var scriptTag = document.createElement('script'),
            head = document.getElementsByTagName('head');
        scriptTag.onload = function() { tt.doneLoading(); };
        scriptTag.setAttribute('type', 'text/javascript');
        scriptTag.setAttribute('src', script);
        head[0].insertBefore(scriptTag, head.firstChild);
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
          this.loading();
          if (document.attachEvent) {
            loadIEScript();
          } else {
            loadOtherScript();
          }
        break;
      }
    },

    fakeTest: {
      run: function(tests) {
        if (tt.isLoading) {
          setTimeout(function() { tt.fakeTest.run(tests); }, 10);
        } else {
          return tt.testRunner.run(tests);
        }
      }
    },

    installBrowserPatching: function() {
      window.exports = [];
      window.__dirname = '';

      window.require = function(path) {
        exports = {};
        tt.load(path);

        if (path === 'test') {
          return tt.fakeTest;
        } else {
          return {};
        }
      };

      window.require.paths = {
        unshift: function(path) {
          tt.browserPaths.push(path);
        }
      };
    },

    init: function(options) {
      options = options || {};

      switch (detectEnvironment()) {
        case 'node':
          exports.load = tt.load;
          exports.test = require(__dirname + '/lib/test');
          exports.assert = require(__dirname + '/lib/assert').assert;
        break;

        case 'browser':
          this.webRelativePath = options.webRelativePath || '';
        break;
      }

      if (options.webScripts && options.eval) {
        for (var i = 0; i < options.webScripts.length; i++) {
          tt.load(options.webScripts[i], options.eval);
        }
      }
    }
  };

  switch (detectEnvironment()) {
    case 'node':
      exports.init = tt.init;
    break;
    
    case 'browser':
      tt.installBrowserPatching();
    break;
  }
})();
