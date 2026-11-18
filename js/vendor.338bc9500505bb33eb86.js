(self["webpackChunkoligomerry"] = self["webpackChunkoligomerry"] || []).push([["vendor"],{

/***/ 924
/*!*******************************************!*\
  !*** ./node_modules/debug/src/browser.js ***!
  \*******************************************/
(module, exports, __webpack_require__) {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
  var warned = false;
  return () => {
    if (!warned) {
      warned = true;
      console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    }
  };
})();

/**
 * Colors.
 */

exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }
  var m;

  // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  // eslint-disable-next-line no-return-assign
  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance ||
  // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) ||
  // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 ||
  // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);
  if (!this.useColors) {
    return;
  }
  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, match => {
    if (match === '%%') {
      return;
    }
    index++;
    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
  var r;
  try {
    r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG');
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }
  return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
module.exports = __webpack_require__(/*! ./common */ 83)(exports);
var formatters = module.exports.formatters;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};

/***/ },

/***/ 83
/*!******************************************!*\
  !*** ./node_modules/debug/src/common.js ***!
  \******************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = __webpack_require__(/*! ms */ 866);
  createDebug.destroy = destroy;
  Object.keys(env).forEach(key => {
    createDebug[key] = env[key];
  });

  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];

  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */
  createDebug.formatters = {};

  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */
  function selectColor(namespace) {
    var hash = 0;
    for (var i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }
  createDebug.selectColor = selectColor;

  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */
  function createDebug(namespace) {
    var prevTime;
    var enableOverride = null;
    var namespacesCache;
    var enabledCache;
    function debug() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // Disabled?
      if (!debug.enabled) {
        return;
      }
      var self = debug;

      // Set `diff` timestamp
      var curr = Number(new Date());
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);
      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      }

      // Apply any `formatters` transformations
      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return '%';
        }
        index++;
        var formatter = createDebug.formatters[format];
        if (typeof formatter === 'function') {
          var val = args[index];
          match = formatter.call(self, val);

          // Now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      // Apply env-specific formatting (colors, etc.)
      createDebug.formatArgs.call(self, args);
      var logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }
    debug.namespace = namespace;
    debug.useColors = createDebug.useColors();
    debug.color = createDebug.selectColor(namespace);
    debug.extend = extend;
    debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

    Object.defineProperty(debug, 'enabled', {
      enumerable: true,
      configurable: false,
      get: () => {
        if (enableOverride !== null) {
          return enableOverride;
        }
        if (namespacesCache !== createDebug.namespaces) {
          namespacesCache = createDebug.namespaces;
          enabledCache = createDebug.enabled(namespace);
        }
        return enabledCache;
      },
      set: v => {
        enableOverride = v;
      }
    });

    // Env-specific initialization logic for debug instances
    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }
    return debug;
  }
  function extend(namespace, delimiter) {
    var newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
    newDebug.log = this.log;
    return newDebug;
  }

  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */
  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.namespaces = namespaces;
    createDebug.names = [];
    createDebug.skips = [];
    var split = (typeof namespaces === 'string' ? namespaces : '').trim().replace(/\s+/g, ',').split(',').filter(Boolean);
    for (var ns of split) {
      if (ns[0] === '-') {
        createDebug.skips.push(ns.slice(1));
      } else {
        createDebug.names.push(ns);
      }
    }
  }

  /**
   * Checks if the given string matches a namespace template, honoring
   * asterisks as wildcards.
   *
   * @param {String} search
   * @param {String} template
   * @return {Boolean}
   */
  function matchesTemplate(search, template) {
    var searchIndex = 0;
    var templateIndex = 0;
    var starIndex = -1;
    var matchIndex = 0;
    while (searchIndex < search.length) {
      if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
        // Match character or proceed with wildcard
        if (template[templateIndex] === '*') {
          starIndex = templateIndex;
          matchIndex = searchIndex;
          templateIndex++; // Skip the '*'
        } else {
          searchIndex++;
          templateIndex++;
        }
      } else if (starIndex !== -1) {
        // eslint-disable-line no-negated-condition
        // Backtrack to the last '*' and try to match more characters
        templateIndex = starIndex + 1;
        matchIndex++;
        searchIndex = matchIndex;
      } else {
        return false; // No match
      }
    }

    // Handle trailing '*' in template
    while (templateIndex < template.length && template[templateIndex] === '*') {
      templateIndex++;
    }
    return templateIndex === template.length;
  }

  /**
  * Disable debug output.
  *
  * @return {String} namespaces
  * @api public
  */
  function disable() {
    var namespaces = [...createDebug.names, ...createDebug.skips.map(namespace => '-' + namespace)].join(',');
    createDebug.enable('');
    return namespaces;
  }

  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */
  function enabled(name) {
    for (var skip of createDebug.skips) {
      if (matchesTemplate(name, skip)) {
        return false;
      }
    }
    for (var ns of createDebug.names) {
      if (matchesTemplate(name, ns)) {
        return true;
      }
    }
    return false;
  }

  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */
  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }
    return val;
  }

  /**
  * XXX DO NOT USE. This is a temporary stub function.
  * XXX It WILL be removed in the next major release.
  */
  function destroy() {
    console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  }
  createDebug.enable(createDebug.load());
  return createDebug;
}
module.exports = setup;

/***/ },

/***/ 88
/*!*****************************************************!*\
  !*** ./node_modules/es6-tween/bundled/Tween.min.js ***!
  \*****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {

!function (t, e) {
   true ? e(exports) : 0;
}(this, function (t) {
  "use strict";

  function s(t) {
    var e = u.indexOf(t);
    -1 < e && u.splice(e, 1), u.push(t), p = 0, l && !f && (o = c(i), f = !0);
  }
  function e(t) {
    for (var e = 0; e < u.length; e++) if (t === u[e]) return u[e];
    return null;
  }
  function F() {
    return f;
  }
  function x() {
    return d;
  }
  var o,
    r = "undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof __webpack_require__.g ? __webpack_require__.g : this || (void 0 !== t ? t : {}),
    n = r.requestAnimationFrame || function (t) {
      return r.setTimeout(t, 50 / 3);
    },
    a = r.cancelAnimationFrame || function (t) {
      return r.clearTimeout(t);
    },
    C = function () {
      if ("undefined" == typeof process || void 0 === process.hrtime || process.versions && void 0 !== process.versions.electron) {
        if (void 0 !== r.performance && void 0 !== r.performance.now) return r.performance.now.bind(r.performance);
        var t = r.performance && r.performance.timing && r.performance.timing.navigationStart ? r.performance.timing.navigationStart : Date.now();
        return function () {
          return Date.now() - t;
        };
      }
      return function () {
        var t = process.hrtime();
        return 1e3 * t[0] + t[1] / 1e6;
      };
    }(),
    u = [],
    f = !1,
    l = !1,
    h = [],
    c = n,
    p = 0,
    y = 120,
    d = !0,
    N = function N(t) {
      var e = u.indexOf(t);
      -1 !== e && u.splice(e, 1), 0 === u.length && (a(o), f = !1);
    },
    i = function t() {
      var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : C(),
        r = 1 < arguments.length ? arguments[1] : void 0;
      if (y <= p && d) return f = !1, p = 0, a(o), !1;
      l && f ? o = c(t) : function () {
        for (var t = 0; t < h.length; t++) h[t]();
      }(), u.length || p++;
      for (var n = 0, i = u.length; n < i;) u[n++].update(e, r), i > u.length && n--, i = u.length;
      return !0;
    },
    q = {},
    v = {
      Linear: {
        None: function None(t) {
          return t;
        }
      },
      Quadratic: {
        In: function In(t) {
          return Math.pow(t, 2);
        },
        Out: function Out(t) {
          return t * (2 - t);
        },
        InOut: function InOut(t) {
          return (t *= 2) < 1 ? .5 * Math.pow(t, 2) : -.5 * (--t * (t - 2) - 1);
        }
      },
      Cubic: {
        In: function In(t) {
          return Math.pow(t, 3);
        },
        Out: function Out(t) {
          return --t * t * t + 1;
        },
        InOut: function InOut(t) {
          return (t *= 2) < 1 ? .5 * Math.pow(t, 3) : .5 * ((t -= 2) * t * t + 2);
        }
      },
      Quartic: {
        In: function In(t) {
          return Math.pow(t, 4);
        },
        Out: function Out(t) {
          return 1 - --t * t * t * t;
        },
        InOut: function InOut(t) {
          return (t *= 2) < 1 ? .5 * Math.pow(t, 4) : -.5 * ((t -= 2) * t * t * t - 2);
        }
      },
      Quintic: {
        In: function In(t) {
          return Math.pow(t, 5);
        },
        Out: function Out(t) {
          return --t * t * t * t * t + 1;
        },
        InOut: function InOut(t) {
          return (t *= 2) < 1 ? .5 * Math.pow(t, 5) : .5 * ((t -= 2) * t * t * t * t + 2);
        }
      },
      Sinusoidal: {
        In: function In(t) {
          return 1 - Math.cos(t * Math.PI / 2);
        },
        Out: function Out(t) {
          return Math.sin(t * Math.PI / 2);
        },
        InOut: function InOut(t) {
          return .5 * (1 - Math.cos(Math.PI * t));
        }
      },
      Exponential: {
        In: function In(t) {
          return 0 === t ? 0 : Math.pow(1024, t - 1);
        },
        Out: function Out(t) {
          return 1 === t ? 1 : 1 - Math.pow(2, -10 * t);
        },
        InOut: function InOut(t) {
          return 0 === t ? 0 : 1 === t ? 1 : (t *= 2) < 1 ? .5 * Math.pow(1024, t - 1) : .5 * (2 - Math.pow(2, -10 * (t - 1)));
        }
      },
      Circular: {
        In: function In(t) {
          return 1 - Math.sqrt(1 - t * t);
        },
        Out: function Out(t) {
          return Math.sqrt(1 - --t * t);
        },
        InOut: function InOut(t) {
          return (t *= 2) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        }
      },
      Elastic: {
        In: function In(t) {
          return 0 === t ? 0 : 1 === t ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin(5 * (t - 1.1) * Math.PI);
        },
        Out: function Out(t) {
          return 0 === t ? 0 : 1 === t ? 1 : Math.pow(2, -10 * t) * Math.sin(5 * (t - .1) * Math.PI) + 1;
        },
        InOut: function InOut(t) {
          return 0 === t ? 0 : 1 === t ? 1 : (t *= 2) < 1 ? -.5 * Math.pow(2, 10 * (t - 1)) * Math.sin(5 * (t - 1.1) * Math.PI) : .5 * Math.pow(2, -10 * (t - 1)) * Math.sin(5 * (t - 1.1) * Math.PI) + 1;
        }
      },
      Back: {
        In: function In(t) {
          return t * t * (2.70158 * t - 1.70158);
        },
        Out: function Out(t) {
          return --t * t * (2.70158 * t + 1.70158) + 1;
        },
        InOut: function InOut(t) {
          var e = 2.5949095;
          return (t *= 2) < 1 ? t * t * ((1 + e) * t - e) * .5 : .5 * ((t -= 2) * t * ((1 + e) * t + e) + 2);
        }
      },
      Bounce: {
        In: function In(t) {
          return 1 - v.Bounce.Out(1 - t);
        },
        Out: function Out(t) {
          var e = 2.75,
            r = 7.5625;
          return t < 1 / e ? r * t * t : t < 2 / e ? r * (t -= 1.5 / e) * t + .75 : t < 2.5 / e ? r * (t -= 2.25 / e) * t + .9375 : r * (t -= 2.625 / e) * t + .984375;
        },
        InOut: function InOut(t) {
          return t < .5 ? .5 * v.Bounce.In(2 * t) : .5 * v.Bounce.Out(2 * t - 1) + .5;
        }
      },
      Stepped: {
        steps: function steps(e) {
          return function (t) {
            return (t * e | 0) / e;
          };
        }
      }
    };
  function m(t) {
    return (m = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
      return typeof t;
    } : function (t) {
      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
    })(t);
  }
  function _(t, e) {
    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
  }
  function g(t, e) {
    for (var r = 0; r < e.length; r++) {
      var n = e[r];
      n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n);
    }
  }
  function b(t, e, r) {
    return e && g(t.prototype, e), r && g(t, r), t;
  }
  function T(e, t) {
    var r = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      t && (n = n.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })), r.push.apply(r, n);
    }
    return r;
  }
  function O(i) {
    for (var t = 1; t < arguments.length; t++) {
      var o = null != arguments[t] ? arguments[t] : {};
      t % 2 ? T(Object(o), !0).forEach(function (t) {
        var e, r, n;
        e = i, n = o[r = t], r in e ? Object.defineProperty(e, r, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0
        }) : e[r] = n;
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(i, Object.getOwnPropertyDescriptors(o)) : T(Object(o)).forEach(function (t) {
        Object.defineProperty(i, t, Object.getOwnPropertyDescriptor(o, t));
      });
    }
    return i;
  }
  function w(t) {
    return (w = Object.setPrototypeOf ? Object.getPrototypeOf : function (t) {
      return t.__proto__ || Object.getPrototypeOf(t);
    })(t);
  }
  function k(t, e) {
    return (k = Object.setPrototypeOf || function (t, e) {
      return t.__proto__ = e, t;
    })(t, e);
  }
  function j(t) {
    if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return t;
  }
  function A(t, e) {
    return !e || "object" != typeof e && "function" != typeof e ? j(t) : e;
  }
  function S(t, e) {
    return function (t) {
      if (Array.isArray(t)) return t;
    }(t) || function (t, e) {
      if (!(Symbol.iterator in Object(t) || "[object Arguments]" === Object.prototype.toString.call(t))) return;
      var r = [],
        n = !0,
        i = !1,
        o = void 0;
      try {
        for (var s, a = t[Symbol.iterator](); !(n = (s = a.next()).done) && (r.push(s.value), !e || r.length !== e); n = !0);
      } catch (t) {
        i = !0, o = t;
      } finally {
        try {
          n || null == a.return || a.return();
        } finally {
          if (i) throw o;
        }
      }
      return r;
    }(t, e) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }();
  }
  var D = 50 / 3,
    U = "_chainedTweens",
    E = "Callback",
    V = "update",
    B = "complete",
    G = "start",
    z = "repeat",
    Q = "reverse",
    P = "restart",
    M = "STRING_PROP",
    R = /\s+|([A-Za-z?().,{}:""[\]#%]+)|([-+]=+)?([-+]+)?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]=?\d+)?/g;
  function I(t) {
    if (t && t.nodeType || void 0 === t || "object" !== m(t)) return t;
    if (Array.isArray(t)) return [].concat(t);
    if ("object" !== m(t)) return t;
    var e = {};
    for (var r in t) e[r] = I(t[r]);
    return e;
  }
  var L = function L(t) {
      return isNaN(+t) || ("+" === t[0] || "-" === t[0]) && "=" === t[1] || "" === t || " " === t;
    },
    K = /^#([0-9a-f]{6}|[0-9a-f]{3})$/gi,
    W = function W(t, e) {
      var r, n, i;
      3 === e.length && (e = (r = e[0]) + r + (n = e[1]) + n + (i = e[2]) + i);
      var o = parseInt(e, 16);
      return "rgb(" + (r = o >> 16 & 255) + ", " + (n = o >> 8 & 255) + ", " + (i = 255 & o) + ")";
    };
  function H(t) {
    if (t && t.splice && t.isString) return t;
    if ("string" != typeof t) return t;
    if ("=" === t.charAt(1)) return t;
    var e = t.replace(K, W).match(R).map(function (t) {
      return L(t) ? t : +t;
    });
    return e.isString = !0, e;
  }
  function X(r, n, t, e) {
    var i = t[r],
      o = e[r];
    if (i === o) return !0;
    if (Array.isArray(i) && Array.isArray(o) && i.length === o.length) for (var s = 0, a = o.length; s < a; s++) {
      var u = i[s],
        f = o[s];
      u === f || "number" == typeof u && "number" == typeof f || X(s, n[r], i, o);
    }
    if (!("number" == typeof i && "number" == typeof o || i && i.splice && i.isString && o && o.splice && o.isString)) {
      if ("string" == typeof i && Array.isArray(o)) {
        var l = H(i),
          h = o.map(H);
        return t[r] = l, e[r] = h, !0;
      }
      if ("string" == typeof i || "string" == typeof o) {
        var c = Array.isArray(i) && i[0] === M ? i : H(i),
          p = Array.isArray(o) && o[0] === M ? o : H(o);
        if (void 0 === c) return;
        for (var y = 1; y < c.length;) c[y] === p[y] && "string" == typeof c[y - 1] ? (c.splice(y - 1, 2, c[y - 1] + c[y]), p.splice(y - 1, 2, p[y - 1] + p[y])) : y++;
        return c[y = 0] === M && c.shift(), p[0] === M && p.shift(), t[r] = c, e[r] = p, !0;
      }
      if ("object" === m(i) && "object" === m(o)) {
        if (Array.isArray(i) && !i.isString) return i.map(function (t, e) {
          return X(e, n[r], i, o);
        });
        for (var d in o) X(d, n[r], i, o);
        return !0;
      }
    }
    return !1;
  }
  var Y = "rgba(",
    Z = function Z(t, e, r) {
      var n = 2 < arguments.length && void 0 !== r ? r : "rgb(";
      return "number" == typeof t[e] && (t[e - 1] === n || t[e - 3] === n || t[e - 5] === n);
    };
  function $(t, e, r, n, i, o, s) {
    var a = s ? r : r[t],
      u = s ? n : n[t];
    if (void 0 === u) return a;
    if (void 0 === a || "string" == typeof a || a === u) return u;
    if ("object" === m(a) && "object" === m(u)) {
      if (!a || !u) return e[t];
      if ("object" === m(a) && a && a.isString && u && u.splice && u.isString) {
        for (var f = "", l = 0, h = a.length; l < h; l++) if (a[l] !== u[l] || "number" != typeof a[l] || "number" == typeof u[l]) {
          var c = "number" == typeof a[l] && "string" == typeof u[l] && "=" === u[l][1],
            p = "number" != typeof a[l] ? a[l] : c ? a[l] + parseFloat(u[l][0] + u[l].substr(2)) * i : a[l] + (u[l] - a[l]) * i;
          (Z(a, l) || Z(a, l, Y)) && (p |= 0), f += p, c && 1 === o && (a[l] = a[l] + parseFloat(u[l][0] + u[l].substr(2)));
        } else f += a[l];
        return s || (e[t] = f), f;
      }
      if (Array.isArray(a) && a[0] !== M) for (var y = 0, d = a.length; y < d; y++) a[y] !== u[y] && "string" != typeof e[t] && $(y, e[t], a, u, i, o);else if ("object" === m(a) && a && !a.isString) for (var v in a) a[v] !== u[v] && $(v, e[t], a, u, i, o);
    } else if ("number" == typeof a) {
      var _ = "string" == typeof u;
      e[t] = _ ? a + parseFloat(u[0] + u.substr(2)) * i : a + (u - a) * i, _ && 1 === o && (r[t] = e[t]);
    } else "function" == typeof u && (e[t] = u(i));
    return e[t];
  }
  function J(t, e) {
    var i = t[e],
      o = e.replace(nt, "").split(rt),
      s = o.length - 1,
      a = Array.isArray(t),
      u = "object" === m(t) && !a;
    return u ? (t[e] = null, delete t[e]) : a && t.splice(e, 1), o.reduce(function (t, e, r) {
      a && "." !== e && "[" !== e && (e *= 1);
      var n = "[" === o[r + 1];
      if ("." === e || "[" === e) return "." === e ? a = !(u = !0) : "[" === e && (a = !(u = !1)), t;
      if (void 0 === t[e]) {
        if (a || u) return t[e] = r === s ? i : a || n ? [] : u ? {} : null, u = a = !1, t[e];
      } else if (void 0 !== t[e]) return r === s && (t[e] = i), t[e];
      return t;
    }, t);
  }
  function tt(t) {
    if ("object" === m(t) && t) for (var e in t) if (-1 !== e.indexOf(".") || -1 !== e.indexOf("[")) J(t, e);else if ("object" === m(t[e]) && t[e]) {
      var r = t[e];
      for (var n in r) if (-1 !== n.indexOf(".") || -1 !== n.indexOf("[")) J(r, n);else if ("object" === m(r[n]) && r[n]) {
        var i = r[n];
        for (var o in i) -1 === o.indexOf(".") && -1 === o.indexOf("[") || J(i, o);
      }
    }
    return t;
  }
  var et,
    rt = /([.[])/g,
    nt = /\]/g,
    it = Object.freeze({
      __proto__: null,
      FRAME_MS: D,
      TOO_LONG_FRAME_MS: 250,
      CHAINED_TWEENS: U,
      EVENT_CALLBACK: E,
      EVENT_UPDATE: V,
      EVENT_COMPLETE: B,
      EVENT_START: G,
      EVENT_REPEAT: z,
      EVENT_REVERSE: Q,
      EVENT_PAUSE: "pause",
      EVENT_PLAY: "play",
      EVENT_RESTART: P,
      EVENT_STOP: "stop",
      EVENT_SEEK: "seek",
      STRING_PROP: M,
      NUM_REGEX: R,
      deepCopy: I,
      decomposeString: H,
      decompose: X,
      RGB: "rgb(",
      RGBA: Y,
      isRGBColor: Z,
      recompose: $,
      SET_NESTED: tt
    }),
    ot = {
      Linear: function Linear(t, e, r) {
        var n = t.length - 1,
          i = n * e,
          o = Math.floor(i),
          s = ot.Utils.Linear;
        return e < 0 ? s(t[0], t[1], i, r) : 1 < e ? s(t[n], t[n - 1], n - i, r) : s(t[o], t[n < o + 1 ? n : o + 1], i - o, r);
      },
      Bezier: function Bezier(t, e, r) {
        for (var n = ot.Utils.Reset(r), i = t.length - 1, o = Math.pow, s = ot.Utils.Bernstein, a = Array.isArray(n), u = 0; u <= i; u++) if ("number" == typeof n) n += o(1 - e, i - u) * o(e, u) * t[u] * s(i, u);else if (a) for (var f = 0, l = n.length; f < l; f++) "number" == typeof n[f] ? n[f] += o(1 - e, i - u) * o(e, u) * t[u][f] * s(i, u) : n[f] = t[u][f];else if ("object" === m(n)) for (var h in n) "number" == typeof n[h] ? n[h] += o(1 - e, i - u) * o(e, u) * t[u][h] * s(i, u) : n[h] = t[u][h];else if ("string" == typeof n) {
          for (var c = "", p = t[Math.round(i * e)], y = 1, d = p.length; y < d; y++) c += p[y];
          return c;
        }
        return n;
      },
      CatmullRom: function CatmullRom(t, e, r) {
        var n = t.length - 1,
          i = n * e,
          o = Math.floor(i),
          s = ot.Utils.CatmullRom;
        return t[0] === t[n] ? (e < 0 && (o = Math.floor(i = n * (1 + e))), s(t[(o - 1 + n) % n], t[o], t[(o + 1) % n], t[(o + 2) % n], i - o, r)) : e < 0 ? s(t[1], t[1], t[0], t[0], -e, r) : 1 < e ? s(t[n - 1], t[n - 1], t[n], t[n], (0 | e) - e, r) : s(t[o ? o - 1 : 0], t[o], t[n < o + 1 ? n : o + 1], t[n < o + 2 ? n : o + 2], i - o, r);
      },
      Utils: {
        Linear: function Linear(t, e, r, n) {
          if (t === e || "string" == typeof t) {
            if (e.length && e.splice && e.isString) {
              e = "";
              for (var i = 0, o = t.length; i < o; i++) e += t[i];
            }
            return e;
          }
          if ("number" == typeof t) return "function" == typeof t ? t(r) : t + (e - t) * r;
          if ("object" === m(t)) {
            if (void 0 !== t.length) {
              var s = "string" == typeof t[0] || t.isString;
              if (s || t[0] === M) {
                for (var a = "", u = s ? 0 : 1, f = t.length; u < f; u++) {
                  var l = 0 === r ? t[u] : 1 !== r && "number" == typeof t[u] ? t[u] + (e[u] - t[u]) * r : e[u];
                  (0 < r && r < 1 && Z(t, u) || Z(t, u, Y)) && (l |= 0), a += l;
                }
                return a;
              }
              if (n && n.length && n.splice) for (var h = 0, c = n.length; h < c; h++) n[h] = ot.Utils.Linear(t[h], e[h], r, n[h]);
            } else for (var p in n) n[p] = ot.Utils.Linear(t[p], e[p], r, n[p]);
            return n;
          }
        },
        Reset: function Reset(t) {
          if (Array.isArray(t)) {
            for (var e = 0, r = t.length; e < r; e++) t[e] = ot.Utils.Reset(t[e]);
            return t;
          }
          if ("object" !== m(t)) return "number" == typeof t ? 0 : t;
          for (var n in t) t[n] = ot.Utils.Reset(t[n]);
          return t;
        },
        Bernstein: function Bernstein(t, e) {
          var r = ot.Utils.Factorial;
          return r(t) / r(e) / r(t - e);
        },
        Factorial: (et = [1], function (t) {
          var e = 1;
          if (et[t]) return et[t];
          for (var r = t; 1 < r; r--) e *= r;
          return et[t] = e;
        }),
        CatmullRom: function CatmullRom(t, e, r, n, i, o) {
          if ("string" == typeof t) return e;
          if ("number" == typeof t) {
            var s = .5 * (r - t),
              a = .5 * (n - e),
              u = i * i;
            return (2 * e - 2 * r + s + a) * (i * u) + (-3 * e + 3 * r - 2 * s - a) * u + s * i + e;
          }
          if ("object" === m(t)) {
            if (void 0 !== t.length) {
              if (t[0] === M) {
                for (var f = "", l = 1, h = t.length; l < h; l++) {
                  var c = "number" == typeof t[l] ? ot.Utils.CatmullRom(t[l], e[l], r[l], n[l], i) : n[l];
                  (Z(t, l) || Z(t, l, Y)) && (c |= 0), f += c;
                }
                return f;
              }
              for (var p = 0, y = o.length; p < y; p++) o[p] = ot.Utils.CatmullRom(t[p], e[p], r[p], n[p], i, o[p]);
            } else for (var d in o) o[d] = ot.Utils.CatmullRom(t[d], e[d], r[d], n[d], i, o[d]);
            return o;
          }
        }
      }
    },
    st = {};
  function at(t, e, r) {
    if (!t || !t.nodeType) return e;
    var n = t.queueID || "q_" + Date.now();
    t.queueID || (t.queueID = n);
    var i = st[n];
    if (i) {
      if (i.object === e && t === i.tween.node && r._startTime === i.tween._startTime) N(i.tween);else if ("object" === m(e) && e && i.object) {
        for (var o in e) o in i.object && (r._startTime === i.tween._startTime ? delete i.object[o] : i.propNormaliseRequired = !0);
        Object.assign(i.object, e);
      }
      return i.object;
    }
    return "object" === m(e) && e ? (st[n] = {
      tween: r,
      object: e,
      propNormaliseRequired: !1
    }, st[n].object) : e;
  }
  function ut(t, e, r) {
    return e ? t ? "undefined" != typeof window && t === window || "undefined" != typeof document && t === document ? [t] : "string" == typeof t ? !!document.querySelectorAll && document.querySelectorAll(t) : Array.isArray(t) ? t : t.nodeType ? [t] : r ? t : [] : null : t ? "undefined" != typeof window && t === window || "undefined" != typeof document && t === document ? t : "string" == typeof t ? !!document.querySelector && document.querySelector(t) : Array.isArray(t) ? t[0] : t.nodeType || r ? t : null : null;
  }
  var ft = 0,
    lt = v.Linear.None,
    ht = function () {
      function L(t, e) {
        return _(this, L), this.id = ft++, !t || "object" !== m(t) || e || t.nodeType ? t && (t.nodeType || t.length || "string" == typeof t) && (t = this.node = ut(t), e = this.object = at(t, e, this)) : (e = this.object = t, t = null), this._valuesEnd = null, this._valuesStart = Array.isArray(e) ? [] : {}, this._duration = 1e3, this._easingFunction = lt, this._easingReverse = lt, this._interpolationFunction = ot.Linear, this._startTime = 0, this._initTime = 0, this._delayTime = 0, this._repeat = 0, this._r = 0, this._isPlaying = !1, this._yoyo = !1, this._reversed = !1, this._onStartCallbackFired = !1, this._pausedTime = null, this._isFinite = !0, this._maxListener = 15, this._chainedTweensCount = 0, this._prevTime = null, this;
      }
      return b(L, null, [{
        key: "fromTo",
        value: function value(t, e, r, n) {
          var i = 3 < arguments.length && void 0 !== n ? n : {};
          i.quickRender = i.quickRender ? i.quickRender : !r;
          var o = new L(t, e).to(r, i);
          return i.quickRender && (o.render().update(o._startTime), o._rendered = !1, o._onStartCallbackFired = !1), o;
        }
      }, {
        key: "to",
        value: function value(t, e, r) {
          return L.fromTo(t, null, e, r);
        }
      }, {
        key: "from",
        value: function value(t, e, r) {
          return L.fromTo(t, e, null, r);
        }
      }]), b(L, [{
        key: "setMaxListener",
        value: function value(t) {
          var e = 0 < arguments.length && void 0 !== t ? t : 15;
          return this._maxListener = e, this;
        }
      }, {
        key: "on",
        value: function value(t, e) {
          for (var r = this._maxListener, n = t + E, i = 0; i < r; i++) {
            var o = n + i;
            if (!this[o]) {
              this[o] = e;
              break;
            }
          }
          return this;
        }
      }, {
        key: "once",
        value: function value(t, i) {
          for (var o = this, e = this._maxListener, r = t + E, n = function n(t) {
              var n = r + t;
              if (!o[n]) return o[n] = function () {
                for (var t = arguments.length, e = new Array(t), r = 0; r < t; r++) e[r] = arguments[r];
                i.apply(o, e), o[n] = null;
              }, "break";
            }, s = 0; s < e; s++) {
            if ("break" === n(s)) break;
          }
          return this;
        }
      }, {
        key: "off",
        value: function value(t, e) {
          for (var r = this._maxListener, n = t + E, i = 0; i < r; i++) {
            var o = n + i;
            this[o] === e && (this[o] = null);
          }
          return this;
        }
      }, {
        key: "emit",
        value: function value(t, e, r, n) {
          var i = this._maxListener,
            o = t + E;
          if (!this[o + 0]) return this;
          for (var s = 0; s < i; s++) {
            var a = o + s;
            this[a] && this[a](e, r, n);
          }
          return this;
        }
      }, {
        key: "isPlaying",
        value: function value() {
          return this._isPlaying;
        }
      }, {
        key: "isStarted",
        value: function value() {
          return this._onStartCallbackFired;
        }
      }, {
        key: "reverse",
        value: function value(t) {
          var e = this._reversed;
          return this._reversed = void 0 !== t ? t : !e, this;
        }
      }, {
        key: "reversed",
        value: function value() {
          return this._reversed;
        }
      }, {
        key: "pause",
        value: function value() {
          return this._isPlaying ? (this._isPlaying = !1, N(this), this._pausedTime = C(), this.emit("pause", this.object)) : this;
        }
      }, {
        key: "play",
        value: function value() {
          return this._isPlaying ? this : (this._isPlaying = !0, this._startTime += C() - this._pausedTime, this._initTime = this._startTime, s(this), this._pausedTime = C(), this.emit("play", this.object));
        }
      }, {
        key: "restart",
        value: function value() {
          return this._repeat = this._r, this.reassignValues(), s(this), this.emit(P, this.object);
        }
      }, {
        key: "seek",
        value: function value(t, e) {
          var r = this._duration,
            n = this._initTime,
            i = this._startTime,
            o = this._reversed,
            s = n + t;
          return this._isPlaying = !0, s < i && n <= i && (this._startTime -= r, this._reversed = !o), this.update(t, !1), this.emit("seek", t, this.object), e ? this : this.pause();
        }
      }, {
        key: "duration",
        value: function value(t) {
          return this._duration = "function" == typeof t ? t(this._duration) : t, this;
        }
      }, {
        key: "to",
        value: function value(t, e) {
          var r = 1 < arguments.length && void 0 !== e ? e : 1e3;
          if (this._valuesEnd = t, "number" == typeof r || "function" == typeof r) this._duration = "function" == typeof r ? r(this._duration) : r;else if ("object" === m(r)) for (var n in r) if ("function" == typeof this[n]) {
            var i = S(Array.isArray(r[n]) ? r[n] : [r[n]], 4),
              o = i[0],
              s = void 0 === o ? null : o,
              a = i[1],
              u = void 0 === a ? null : a,
              f = i[2],
              l = void 0 === f ? null : f,
              h = i[3],
              c = void 0 === h ? null : h;
            this[n](s, u, l, c);
          }
          return this;
        }
      }, {
        key: "render",
        value: function value() {
          if (this._rendered) return this;
          var t = this._valuesStart,
            e = this._valuesEnd,
            r = this.object,
            n = this.node,
            i = this.InitialValues;
          if (tt(r), tt(e), n && n.queueID && st[n.queueID]) {
            var o = st[n.queueID];
            if (o.propNormaliseRequired && o.tween !== this) {
              for (var s in e) o.tween._valuesEnd[s];
              o.normalisedProp = !0, o.propNormaliseRequired = !1;
            }
          }
          if (n && i && (r && 0 !== Object.keys(r).length ? e && 0 !== Object.keys(e).length || (e = this._valuesEnd = i(n, r)) : r = this.object = at(n, i(n, e), this)), !t.processed) {
            for (var a in e) {
              var u = r && r[a] && I(r[a]),
                f = e[a];
              if (!(q[a] && q[a].init && (q[a].init.call(this, u, f, a, r), void 0 === u && t[a] && (u = t[a]), q[a].skipProcess)) && !("number" == typeof u && isNaN(u) || null === u || null === f || !1 === u || !1 === f || void 0 === u || void 0 === f || u === f)) {
                if (t[a] = u, Array.isArray(f)) {
                  if (Array.isArray(u)) f.isString && r[a].isString && !u.isString ? u.isString = !0 : X(a, r, t, e);else {
                    f.unshift(u);
                    for (var l = 0, h = f.length; l < h; l++) "string" == typeof f[l] && (f[l] = H(f[l]));
                  }
                } else X(a, r, t, e);
                "number" != typeof u || "string" != typeof f || f[1];
              }
            }
            t.processed = !0;
          }
          return L.Renderer && this.node && L.Renderer.init && (L.Renderer.init.call(this, r, t, e), this.__render = !0), this._rendered = !0, this;
        }
      }, {
        key: "start",
        value: function value(t) {
          return this._startTime = void 0 !== t ? "string" == typeof t ? C() + parseFloat(t) : t : C(), this._startTime += this._delayTime, this._initTime = this._prevTime = this._startTime, this._onStartCallbackFired = !1, this._rendered = !1, this._isPlaying = !0, s(this), this;
        }
      }, {
        key: "stop",
        value: function value() {
          var t = this._isPlaying,
            e = this._isFinite,
            r = this.object,
            n = this._startTime,
            i = this._duration,
            o = this._r,
            s = this._yoyo,
            a = this._reversed;
          if (!t) return this;
          var u = e ? (o + 1) % 2 == 1 : !a;
          return this._reversed = !1, s && u ? this.update(n) : this.update(n + i), N(this), this.emit("stop", r);
        }
      }, {
        key: "delay",
        value: function value(t) {
          return this._delayTime = "function" == typeof t ? t(this._delayTime) : t, this;
        }
      }, {
        key: "chainedTweens",
        value: function value() {
          if (this._chainedTweensCount = arguments.length, !this._chainedTweensCount) return this;
          for (var t = 0, e = this._chainedTweensCount; t < e; t++) this[U + t] = arguments[t];
          return this;
        }
      }, {
        key: "repeat",
        value: function value(t) {
          return this._repeat = this._duration ? "function" == typeof t ? t(this._repeat) : t : 0, this._r = this._repeat, this._isFinite = isFinite(t), this;
        }
      }, {
        key: "reverseDelay",
        value: function value(t) {
          return this._reverseDelayTime = "function" == typeof t ? t(this._reverseDelayTime) : t, this;
        }
      }, {
        key: "yoyo",
        value: function value(t, e) {
          return this._yoyo = "function" == typeof t ? t(this._yoyo) : null === t ? this._yoyo : t, t || (this._reversed = !1), this._easingReverse = e || null, this;
        }
      }, {
        key: "easing",
        value: function value(t) {
          return this._easingFunction = t, this;
        }
      }, {
        key: "interpolation",
        value: function value(t) {
          return "function" == typeof t && (this._interpolationFunction = t), this;
        }
      }, {
        key: "reassignValues",
        value: function value(t) {
          var e = this._valuesStart,
            r = this.object,
            n = this._delayTime;
          for (var i in this._isPlaying = !0, this._startTime = void 0 !== t ? t : C(), this._startTime += n, this._reversed = !1, s(this), e) {
            var o = e[i];
            r[i] = o;
          }
          return this;
        }
      }, {
        key: "update",
        value: function value(t, e, r) {
          var n,
            i,
            o,
            s = this._onStartCallbackFired,
            a = this._easingFunction,
            u = this._interpolationFunction,
            f = this._easingReverse,
            l = this._repeat,
            h = this._delayTime,
            c = this._reverseDelayTime,
            p = this._yoyo,
            y = this._reversed,
            d = this._startTime,
            v = this._prevTime,
            _ = this._duration,
            m = this._valuesStart,
            g = this._valuesEnd,
            b = this.object,
            T = this._isFinite,
            O = this._isPlaying,
            w = this.__render,
            k = this._chainedTweensCount,
            j = 0;
          if (_) {
            var A = (t = void 0 !== t ? t : C()) - v;
            if (this._prevTime = t, 250 < A && F() && x() && (t -= A - D), !O || t < d && !r) return !0;
            n = 1 < (n = (t - d) / _) ? 1 : n, n = y ? 1 - n : n;
          } else n = 1, l = 0;
          if (s || (this._rendered || (this.render(), this._rendered = !0), this.emit(G, b), this._onStartCallbackFired = !0), i = y && f || a, !b) return !0;
          for (o in g) {
            var S = m[o];
            if (null != S || q[o] && q[o].update) {
              var E = g[o],
                P = i[o] ? i[o](n) : ("function" == typeof i ? i : lt)(n),
                M = u[o] ? u[o] : "function" == typeof u ? u : ot.Linear;
              "number" == typeof E ? b[o] = S + (E - S) * P : !Array.isArray(E) || E.isString || Array.isArray(S) ? E && E.update ? E.update(P) : "function" == typeof E ? b[o] = E(P) : "string" == typeof E && "number" == typeof S ? b[o] = S + parseFloat(E[0] + E.substr(2)) * P : $(o, b, m, g, P, n) : b[o] = M(E, P, b[o]), q[o] && q[o].update && q[o].update.call(this, b[o], S, E, P, n, o), j++;
            }
          }
          if (!j) return N(this), !1;
          if (w && L.Renderer && L.Renderer.update && L.Renderer.update.call(this, b, n), this.emit(V, b, n, t), 1 === n || y && 0 === n) {
            if (0 < l && 0 < _) {
              if (T && this._repeat--, p) this._reversed = !y;else for (o in g) {
                var R = g[o];
                "string" == typeof R && "number" == typeof m[o] && (m[o] += parseFloat(R[0] + R.substr(2)));
              }
              return this.emit(p && !y ? Q : z, b), this._startTime = y && c ? t - c : t + h, !0;
            }
            if (e || (this._isPlaying = !1, N(this), ft--), this.emit(B, b), this._repeat = this._r, k) for (var I = 0; I < k; I++) this[U + I].start(t + _);
            return !1;
          }
          return !0;
        }
      }]), L;
    }(),
    ct = function () {
      function t() {
        _(this, t), this.totalTime = 0, this.labels = [], this.offsets = [];
      }
      return b(t, [{
        key: "parseLabel",
        value: function value(t, e) {
          var r = this.offsets,
            n = this.labels,
            i = n.indexOf(t);
          if ("string" == typeof t && -1 !== t.indexOf("=") && !e && -1 === i) {
            var o = t.substr(t.indexOf("=") - 1, 2),
              s = t.split(o);
            e = 2 === s.length ? o + s[1] : null, t = s[0], i = n.indexOf(t);
          }
          if (-1 !== i && t) {
            var a = r[i] || 0;
            if ("number" == typeof e) a = e;else if ("string" == typeof e && -1 !== e.indexOf("=")) {
              var u = e.charAt(0);
              e = Number(e.substr(2)), "+" === u || "-" === u ? a += parseFloat(u + e) : "*" === u ? a *= e : "/" === u ? a /= e : "%" === u && (a *= e / 100);
            }
            return a;
          }
          return "number" == typeof e ? e : 0;
        }
      }, {
        key: "addLabel",
        value: function value(t, e) {
          return this.labels.push(t), this.offsets.push(this.parseLabel(t, e)), this;
        }
      }, {
        key: "setLabel",
        value: function value(t, e) {
          var r = this.labels.indexOf(t);
          return -1 !== r && this.offsets.splice(r, 1, this.parseLabel(t, e)), this;
        }
      }, {
        key: "eraseLabel",
        value: function value(t) {
          var e = this.labels.indexOf(t);
          return -1 !== e && (this.labels.splice(e, 1), this.offsets.splice(e, 1)), this;
        }
      }]), t;
    }(),
    pt = 0,
    yt = function () {
      function r(t) {
        var e;
        return _(this, r), (e = A(this, w(r).call(this)))._duration = 0, e._startTime = t && void 0 !== t.startTime ? t.startTime : C(), e._tweens = [], e.elapsed = 0, e._id = pt++, e._defaultParams = t, e.position = new ct(), e.position.addLabel("afterLast", e._duration), e.position.addLabel("afterInit", e._startTime), e._onStartCallbackFired = !1, A(e, j(e));
      }
      return function (t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
        t.prototype = Object.create(e && e.prototype, {
          constructor: {
            value: t,
            writable: !0,
            configurable: !0
          }
        }), e && k(t, e);
      }(r, ht), b(r, [{
        key: "mapTotal",
        value: function value(t) {
          return t.call(this, this._tweens), this;
        }
      }, {
        key: "timingOrder",
        value: function value(t) {
          var r = t(this._tweens.map(function (t) {
            return t._startTime;
          }));
          return this._tweens.map(function (t, e) {
            t._startTime = r[e];
          }), this;
        }
      }, {
        key: "getTiming",
        value: function value(t, e, r, n) {
          var i = 3 < arguments.length && void 0 !== n ? n : 0;
          if ("reverse" === t) {
            var o = r.stagger,
              s = (o || 0) * (e.length - 1);
            return e.map(function (t, e) {
              return s - (o || 0) * e + i;
            });
          }
          if ("async" === t) return e.map(function (t) {
            return i;
          });
          if ("sequence" === t || "delayed" === t) {
            var a = r.stagger;
            return a = a || (r.duration || 1e3) / (e.length - 1), e.map(function (t, e) {
              return a * e + i;
            });
          }
          if ("oneByOne" === t) return e.map(function (t) {
            return r.duration;
          });
          if ("shuffle" === t) {
            var u = r.stagger;
            return function (t) {
              var e, r, n;
              for (n = t.length; n; --n) e = Math.floor(Math.random() * n), r = t[n - 1], t[n - 1] = t[e], t[e] = r;
              return t;
            }(e.map(function (t, e) {
              return (u || 0) * e + i;
            }));
          }
          var f = r.stagger;
          return e.map(function (t, e) {
            return (f || 0) * e + i;
          });
        }
      }, {
        key: "fromTo",
        value: function value(t, e, r, n) {
          if ((t = ut(t, !0, !0)) && t.length) {
            this._defaultParams && (n = n ? O({}, this._defaultParams, {}, n) : this._defaultParams);
            for (var i, o = n.label, s = "number" == typeof o ? o : this.position.parseLabel(void 0 !== o ? o : "afterLast", null), a = this.getTiming(n.mode, t, n, s), u = 0, f = t.length; u < f; u++) i = t[u], this.add(ht.fromTo(i, "function" == typeof e ? e(u, t.length) : "object" === m(e) && e ? O({}, e) : null, "function" == typeof r ? r(u, t.length) : r, "function" == typeof n ? n(u, t.length) : n), a[u]);
          }
          return this.start();
        }
      }, {
        key: "from",
        value: function value(t, e, r) {
          return this.fromTo(t, e, null, r);
        }
      }, {
        key: "to",
        value: function value(t, e, r) {
          return this.fromTo(t, null, e, r);
        }
      }, {
        key: "addLabel",
        value: function value(t, e) {
          return this.position.addLabel(t, e), this;
        }
      }, {
        key: "map",
        value: function value(t) {
          for (var e = 0, r = this._tweens.length; e < r; e++) {
            var n = this._tweens[e];
            t(n, e), this._duration = Math.max(this._duration, n._duration + n._startTime);
          }
          return this;
        }
      }, {
        key: "add",
        value: function value(t, e) {
          var r = this;
          if (Array.isArray(t)) return t.map(function (t) {
            r.add(t, e);
          }), this;
          "object" !== m(t) || t instanceof ht || (t = new ht(t.from).to(t.to, t));
          var n = this._defaultParams,
            i = this._duration;
          if (n) for (var o in n) "function" == typeof t[o] && t[o](n[o]);
          var s = "number" == typeof e ? e : this.position.parseLabel(void 0 !== e ? e : "afterLast", null);
          return t._startTime = Math.max(this._startTime, t._delayTime, s), t._delayTime = s, t._isPlaying = !0, this._duration = Math.max(i, Math.max(t._startTime + t._delayTime, t._duration)), this._tweens.push(t), this.position.setLabel("afterLast", this._duration), this;
        }
      }, {
        key: "restart",
        value: function value() {
          return this._startTime += C(), s(this), this.emit(P);
        }
      }, {
        key: "easing",
        value: function value(e) {
          return this.map(function (t) {
            return t.easing(e);
          });
        }
      }, {
        key: "interpolation",
        value: function value(e) {
          return this.map(function (t) {
            return t.interpolation(e);
          });
        }
      }, {
        key: "update",
        value: function value(t) {
          var e,
            r = this._tweens,
            n = this._duration,
            i = this._reverseDelayTime,
            o = this._startTime,
            s = this._reversed,
            a = this._yoyo,
            u = this._repeat,
            f = this._isFinite,
            l = this._isPlaying,
            h = this._prevTime,
            c = this._onStartCallbackFired,
            p = (t = void 0 !== t ? t : C()) - h;
          if (this._prevTime = t, 250 < p && F() && x() && (t -= p - D), !l || t < o) return !0;
          e = 1 < (e = (t - o) / n) ? 1 : e, e = s ? 1 - e : e, this.elapsed = e, c || (this.emit(G), this._onStartCallbackFired = !0);
          for (var y = t - o, d = s ? n - y : y, v = 0; v < r.length;) r[v].update(d), v++;
          if (this.emit(V, e, y), 1 === e || s && 0 === e) {
            if (u) {
              for (f && this._repeat--, this.emit(s ? Q : z), a && (this._reversed = !s, this.timingOrder(function (t) {
                return t.reverse();
              })), this._startTime = s && i ? t + i : t, v = 0; v < r.length;) r[v].reassignValues(t), v++;
              return !0;
            }
            return this.emit(B), this._repeat = this._r, N(this), this._isPlaying = !1;
          }
          return !0;
        }
      }, {
        key: "progress",
        value: function value(t) {
          return void 0 !== t ? this.update(t * this._duration) : this.elapsed;
        }
      }]), r;
    }();
  t.Easing = v, t.FrameThrottle = function (t) {
    y = 1.05 * (0 < arguments.length && void 0 !== t ? t : 120);
  }, t.Interpolation = ot, t.Interpolator = function (i, o) {
    var s = Array.isArray(i) && !i.isString,
      a = "string" == typeof i ? i : s ? i.slice() : O({}, i);
    if (s) for (var t = 0, e = i.length; t < e; t++) i[t] === o[t] && "number" == typeof i[t] && "number" != typeof o[t] || X(t, a, i, o);else if ("object" === m(i)) for (var r in i) i[r] === o[r] && "number" == typeof i[r] && "number" != typeof o[r] || X(r, a, i, o);else if ("string" == typeof i) {
      i = H(i), o = H(o);
      for (var n = 1; n < i.length;) i[n] === o[n] && "string" == typeof i[n - 1] ? (i.splice(n - 1, 2, i[n - 1] + i[n]), o.splice(n - 1, 2, o[n - 1] + o[n])) : n++;
    }
    return function (t) {
      if (s) for (var e = 0, r = i.length; e < r; e++) $(e, a, i, o, t);else if ("object" === m(a)) for (var n in i) $(n, a, i, o, t);else "string" == typeof a && (a = $(0, 0, i, o, t, t, !0));
      return a;
    };
  }, t.Plugins = q, t.Selector = ut, t.Timeline = yt, t.ToggleLagSmoothing = function (t) {
    d = !(0 < arguments.length && void 0 !== t) || t;
  }, t.Tween = ht, t.add = s, t.autoPlay = function (t) {
    l = t;
  }, t.get = e, t.getAll = function () {
    return u;
  }, t.has = function (t) {
    return null !== e(t);
  }, t.isRunning = F, t.now = C, t.onRequestTick = function (t) {
    h.push(t);
  }, t.onTick = function (t) {
    return u.push({
      update: t
    });
  }, t.remove = N, t.removeAll = function () {
    u.length = 0, a(o), f = !1;
  }, t.update = i, t.utils = it, Object.defineProperty(t, "__esModule", {
    value: !0
  });
});

/***/ },

/***/ 312
/*!*************************************************************!*\
  !*** ./node_modules/legra-glycan.js/js/main.js + 2 modules ***!
  \*************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  LegraCanvasRenderer: () => (/* reexport */ js_LegraCanvasRenderer)
});

// EXTERNAL MODULE: ./node_modules/glycan.js/js/main.js + 34 modules
var main = __webpack_require__(724);
// EXTERNAL MODULE: ./node_modules/legra/lib/legra.umd.js
var legra_umd = __webpack_require__(406);
var legra_umd_default = /*#__PURE__*/__webpack_require__.n(legra_umd);
;// ./node_modules/legra-glycan.js/js/fonts/nunitoFont.js


// Nunito, bold (700) weight (SIL OFL) - see LICENSE-nunito.md. Base64-
// embedded (not referenced by URL) for the same reason as Fiziko/
// Heraldic's fonts: an exported snapshot/canvas stays self-contained, with
// no dependency on the viewer's document or asset host still being
// reachable later.
var NUNITO_BASE64 = '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';
/* harmony default export */ const nunitoFont = (NUNITO_BASE64);
;// ./node_modules/legra-glycan.js/js/LegraCanvasRenderer.js
/*global HTMLCanvasElement, FontFace*/


function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
;
var CanvasCanvas = main.CanvasRenderer.Canvas;


var BLOCK_WIDTH = 8;

// Brick size (px) for a 1-2 residue glycan - today's familiar look, where
// each icon gets BLOCK_WIDTH bricks across.
var BASE_GRID_SIZE = 100 / BLOCK_WIDTH;
var BASE_RESIDUE_COUNT = 2;
// However large a glycan gets, bricks never grow coarser than this -
// keeps very large structures legible as "lego" rather than a handful of
// giant blocks.
var MAX_GRID_SIZE = BASE_GRID_SIZE * 4;
var roundFloat = (value, toNearest, fixed) => {
  return parseFloat((Math.round(value / toNearest) * toNearest).toFixed(fixed));
};

// Picking one fixed brick size regardless of residue count meant a two-
// residue disaccharide and an eighty-residue antenna cluster both got
// BLOCK_WIDTH bricks per icon - fine for the small case, but the bigger
// glycan's canvas (and, once the page's CSS fits a fixed-size box around
// it, its on-screen footprint) grows along with residue count while each
// brick stays pixel-sized, so the structure reads as noisy pixel mush
// rather than chunky lego. Scaling brick size by sqrt(residue count) (not
// linearly - a 4x bigger glycan shouldn't get bricks 4x the size) trades a
// little per-residue detail for a structure that still reads as "built
// from bricks" at any size. Cheap: O(1) given a residue count the caller
// already has on hand.
var computeGridSize = residueCount => {
  var n = Math.max(residueCount, 1);
  var scaleFactor = Math.sqrt(Math.max(n / BASE_RESIDUE_COUNT, 1));
  return Math.min(BASE_GRID_SIZE * scaleFactor, MAX_GRID_SIZE);
};
var wrap_gridsize = baselayout => {
  return class extends baselayout {
    static PerformLayout(renderable) {
      var layout = baselayout.PerformLayout.call(this, renderable);
      // Uses this one sugar's own residue count, which matches the
      // renderer-wide total paint() derives its brick size from as
      // long as a canvas only ever renders a single sugar - true for
      // every current caller (ccg-sviewer/ccg-sugarbuilder each render
      // one glycan per canvas). A canvas showing more than one sugar
      // would have each snap to its own grid size here while paint()
      // uses one shared brick size for the whole canvas, reintroducing
      // the misalignment this rounding exists to prevent - not a
      // configuration in use today, so not handled.
      var gridSize = LegraCanvasRenderer.ADAPTIVE_GRID_SIZE ? computeGridSize(renderable.composition().length) : BASE_GRID_SIZE;
      for (var res of renderable.composition()) {
        var pos = layout.get(res);
        if (!pos) {
          continue;
        }
        pos.x = roundFloat(pos.x, gridSize / 100, 3);
        pos.y = roundFloat(pos.y, gridSize / 100, 3);
      }
      return layout;
    }
  };
};

// Ser/Thr/Asn/Hyl carry their amino-acid name as hand-outlined letter paths
// baked into sugars.svg (no live <text> there, since the base icon set can't
// assume any particular font is available). Left alone, those letter paths
// get rasterized and then quantized into lego bricks along with everything
// else, turning legible text into a blurry smear - the same problem
// glycan.js's Fiziko renderer solves for its own (unrelated) texturing
// pipeline via FIZIKO_TEXT_LABELS in FizikoSVGCanvas.js. Mirrored here: drop
// the letter paths from the icon entirely and redraw the label as crisp,
// un-pixelated text once legra's quantization pass is done (see paint()).
var AMINO_ACID_ICON_LABELS = {
  ser: 'Ser',
  thr: 'Thr',
  asn: 'Asn',
  hyl: 'HyL'
};

// Built once per page (lazily, on first use) by stripping the filled letter
// paths out of sugars.svg's own symbol markup, keeping only the fill:none
// backbone line - cheap (a handful of DOM nodes, parsed once) and avoids
// mutating glycan.js's own shared per-class icon cache.
var blankAminoAcidIcons;
var getBlankAminoAcidIcons = doc => {
  if (!blankAminoAcidIcons) {
    blankAminoAcidIcons = {};
    var parser = doc.createElement('svg');
    parser.innerHTML = main.CanvasRenderer.SYMBOLS;
    for (var identifier of Object.keys(AMINO_ACID_ICON_LABELS)) {
      var symbol = parser.querySelector("#".concat(identifier));
      if (!symbol) {
        continue;
      }
      for (var path of [...symbol.querySelectorAll('path')]) {
        if (path.getAttribute('fill') !== 'none') {
          path.remove();
        }
      }
      var markup = symbol.innerHTML.replace(/#/g, '%23');
      blankAminoAcidIcons[identifier] = "data:image/svg+xml;utf8,<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0\" y=\"0\" width=\"100px\" height=\"100px\">".concat(markup, "</svg>");
    }
  }
  return blankAminoAcidIcons;
};

// Nunito (SIL OFL licensed - see fonts/LICENSE-nunito.md), bold weight.
// Originally Bungee, swapped for a more legible rounded sans - both stand in
// for the requested "Chalet" family, which is a commercial House Industries
// font that can't legally be bundled/redistributed the way Fondamento and
// Routed Gothic are for Heraldic/Fiziko.
var LEGRA_LABEL_FONT_FAMILY = "'Nunito', Helvetica, Verdana, Arial, sans-serif";

// Loaded once per page, like glycan.js's own module-level icon cache -
// every LegraCanvasRenderer instance shares the same registered FontFace
// rather than each re-decoding/re-registering the same base64 font.
var legraLabelFontPromise;
var ensureLegraLabelFont = doc => {
  if (!legraLabelFontPromise) {
    // Embedded file is already the bold (700) weight - declared as such so
    // `ctx.font` doesn't need a separate "bold" keyword to pick it up.
    var face = new FontFace('Nunito', "url(data:font/woff2;base64,".concat(nunitoFont, ")"), {
      weight: '700'
    });
    legraLabelFontPromise = face.load().then(loaded => {
      doc.fonts.add(loaded);
      return loaded;
    });
  }
  return legraLabelFontPromise;
};

// Funnels every piece of text drawn on the offscreen canvas - linkage/anomer
// labels (renderLinkageLabel) and repeat-count labels (Renderer.js's own
// direct canvas.text() call) alike - through one place, rather than patching
// each call site separately. Each label is kept out of the lego-quantized
// raster (its render() becomes a no-op) and stashed so paint() can redraw it
// crisply afterward, in LEGRA_LABEL_FONT_FAMILY, once legra's quantization
// pass is done.
class LegraLabelCanvas extends CanvasCanvas {
  constructor(canvas, pendingLabels) {
    super(canvas);
    this.pendingLabels = pendingLabels;
  }
  group(a_g) {
    if (!a_g) {
      a_g = new LegraLabelCanvas(undefined, this.pendingLabels);
      this.appendChild(a_g);
    }
    return a_g;
  }
  text(x, y, text) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var label = super.text(x, y, text, options);
    label.render = () => {};
    this.pendingLabels.push(label);
    return label;
  }
}
class LegraCanvasRenderer extends main.CanvasRenderer {
  constructor(container, layout) {
    var onscreen;
    if (!(container instanceof HTMLCanvasElement)) {
      onscreen = container.ownerDocument.createElement('canvas');
      container.appendChild(onscreen);
    } else {
      onscreen = container;
    }
    var offscreen = container.ownerDocument.createElement('canvas');
    offscreen.offscreen = 'offscreen';
    onscreen.offscreen = 'onscreen';
    super(onscreen, wrap_gridsize(layout));
    this.offscreen = offscreen;
    this.onscreen = onscreen;
    this.pendingLabels = [];
    // Sane default until the first refresh() computes the real,
    // residue-count-derived value - see refresh() below.
    this.gridSize = BASE_GRID_SIZE;
    Object.defineProperty(onscreen, 'screenToCanvasMatrix', {
      get: function get() {
        return offscreen.screenToCanvasMatrix;
      }
    });
    Object.defineProperty(offscreen, 'getBoundingClientRect', {
      get: function get() {
        return () => onscreen.getBoundingClientRect();
      }
    });
    this.offscreen.width = '1px';
    this.offscreen.height = '1px';
    this.element = new LegraLabelCanvas(this.offscreen, this.pendingLabels);
    var legra = new (legra_umd_default())(this.onscreen.getContext('2d'), BASE_GRID_SIZE);
    this.legra = legra;
  }

  // Computes this cycle's adaptive brick size once (O(residues), negligible)
  // rather than per-residue/per-linkage, and clears last cycle's crisp-label
  // stash - render_sugar() recreates every linkage (and so every linkage
  // label) on every refresh (see Renderer.js's FULL_REFRESH), so leaving the
  // old stash in place would mean labels for residues/linkages that no
  // longer exist keep getting redrawn forever.
  refresh() {
    var _this = this;
    return _asyncToGenerator(function* () {
      _this.pendingLabels.length = 0;
      _this.gridSize = _this.constructor.ADAPTIVE_GRID_SIZE ? computeGridSize(_this.sugars.reduce((n, sugar) => n + sugar.composition().length, 0)) : BASE_GRID_SIZE;
      return main.CanvasRenderer.prototype.refresh.call(_this);
    })();
  }
  renderIcon(container, identifier) {
    for (var _len = arguments.length, rest = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      rest[_key - 2] = arguments[_key];
    }
    var icon = main.CanvasRenderer.prototype.renderIcon.call(this, container, identifier, ...rest);
    var label = AMINO_ACID_ICON_LABELS[identifier];
    if (label) {
      var blanks = getBlankAminoAcidIcons(this.onscreen.ownerDocument);
      if (blanks[identifier]) {
        icon.src = blanks[identifier];
      }
      icon.labelText = label;
    }
    return icon;
  }
  renderLinkage() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    var retval = main.CanvasRenderer.prototype.renderLinkage.call(this, ...args);
    if (!retval) {
      return;
    }
    for (var obj of retval.torender) {
      if (obj.options && obj.options['stroke-width']) {
        obj.options['stroke-width'] = this.gridSize;
        obj.options.stroke = '#777';
      }
    }
    return retval;
  }
  paint() {
    main.CanvasRenderer.prototype.paint.call(this);
    // Snapshotting the offscreen canvas has to wait for every icon this
    // pass to have actually drawn, not just "the next tick" - a never-
    // before-seen icon type's image is still loading asynchronously when
    // paint() returns (see CanvasCanvas.js's render_icon()/iconsReady()),
    // and a setTimeout(0) here isn't guaranteed to run after that load
    // completes. Missing that race meant some shapes were silently absent
    // from the snapshot on the very first render of a given icon type
    // (then present on every later render, once ICONS_CACHE had it). The
    // label font has the same kind of first-use async load, so it waits
    // alongside the icons.
    var iconsReady = this.iconsReady;
    var fontReady = ensureLegraLabelFont(this.onscreen.ownerDocument);
    Promise.all([iconsReady, fontReady]).then(() => {
      this.onscreen.getContext('2d').clearRect(0, 0, this.onscreen.width, this.onscreen.height);
      var gridSize = this.gridSize;
      this.legra.defaultOptions.brickSize = gridSize;
      var actual_width = this.offscreen.width;
      var actual_height = this.offscreen.height;
      var target_width = Math.ceil(actual_width / gridSize) * gridSize;
      var target_height = Math.ceil(actual_height / gridSize) * gridSize;
      var padX = Math.round(0.5 * (target_width - actual_width));
      var padY = Math.round(0.5 * (target_height - actual_height));

      // legra's drawImage() destination-offset argument is a BRICK-grid
      // index, not a pixel offset - passing it this (sub-brick,
      // fractional) pixel centering delta directly, as this used to,
      // shifted every brick by that fraction of its own width, which is
      // why bricks could land slightly off the glycan's true outline.
      // Doing the centering ourselves in plain pixels, on an intermediate
      // canvas, means legra always gets an image already sized to an
      // exact multiple of its own brick grid, placed at offset [0,0] -
      // sidestepping the unit mismatch entirely.
      var padded = this.onscreen.ownerDocument.createElement('canvas');
      padded.width = target_width;
      padded.height = target_height;
      padded.getContext('2d').drawImage(this.offscreen, padX, padY);
      this.onscreen.width = target_width;
      this.onscreen.height = target_height;
      this.legra.drawImage(padded, [0, 0]);
      var imgdata = this.onscreen.getContext('2d').getImageData(0, 0, this.onscreen.width, this.onscreen.height);
      for (var i = 0; i < imgdata.data.length; i += 4) {
        if (imgdata.data[i] === 0 && imgdata.data[i + 1] === 0 && imgdata.data[i + 2] === 0) {
          imgdata.data[i + 3] = 0;
        }
      }
      this.onscreen.getContext('2d').putImageData(imgdata, 0, 0);
      this.drawCrispLabels(padX, padY);
    });
  }

  // Redraws every label kept out of the lego-quantized raster - linkage/
  // repeat labels (stashed via LegraLabelCanvas) and amino-acid icon labels
  // (read straight off this.iconset, so a residue that's since been removed
  // is skipped automatically rather than needing its own cleanup) - as
  // crisp text on top of the finished onscreen image.
  drawCrispLabels(padX, padY) {
    var ctx = this.onscreen.getContext('2d');
    // Same transform render() set up on the offscreen context for this
    // pass (translation by the glycan's own bounding-box origin) - reusing
    // it maps a label's raw layout-space position onto exactly the pixel
    // the lego-ified raster drew it at, before our own padding shift.
    var transform = this.offscreen.getContext('2d').getTransform();
    for (var label of this.pendingLabels) {
      this.paintLabel(ctx, transform, label.x, label.y, label.text, label.options, padX, padY);
    }
    for (var icon of this.iconset) {
      if (!icon.labelText) {
        continue;
      }
      // x=50,y=92.6,font-size=29 on a 0-100 viewBox is where sugars.svg's
      // own (now-stripped) baked-in label sat - same proportions here, just
      // scaled to this icon's actual size. Rotated ser/thr/asn/hyl icons
      // aren't accounted for (none of the current layouts rotate them).
      var cx = icon.x + icon.width / 2;
      var cy = icon.y + icon.height * 0.926;
      // textBaseline explicitly 'alphabetic' - matches the baked-in SVG
      // label it replaces (plain <text x="50" y="92.6" text-anchor="middle">,
      // SVG's default baseline), rather than the top/middle heuristic below
      // that's tailored to Renderer.js's own linkage-label options shape.
      this.paintLabel(ctx, transform, cx, cy, icon.labelText, {
        'font-size': Math.round(icon.width * 0.29),
        'text-anchor': 'middle',
        textBaseline: 'alphabetic'
      }, padX, padY);
    }
  }
  paintLabel(ctx, transform, x, y, text, options, padX, padY) {
    var pt = transform.transformPoint({
      x,
      y
    });
    ctx.save();
    // 'bold' here has to match the weight: '700' the FontFace was
    // registered with (ensureLegraLabelFont) - the embedded file only has
    // that one weight, so a plain-weight request wouldn't match it and
    // would silently fall through to the (non-bold) fallback fonts instead.
    ctx.font = "bold ".concat(options['font-size'] || 25, "px ").concat(LEGRA_LABEL_FONT_FAMILY);
    // SVG-style text-anchor values ('start'/'middle'/'end') are what the
    // rest of glycan.js's layout code passes around - 'middle' isn't a
    // valid canvas textAlign value though (only 'center' is), and silently
    // assigning it is a no-op that leaves textAlign at its previous value,
    // so it needs translating rather than passing straight through.
    var anchor = options['text-anchor'];
    ctx.textAlign = anchor === 'middle' ? 'center' : anchor || 'left';
    ctx.textBaseline = options.textBaseline || (options.dy ? 'middle' : 'top');
    ctx.fillStyle = options.fill || '#111';
    ctx.fillText(text, pt.x + padX, pt.y + padY);
    ctx.restore();
  }
}

// Set LegraCanvasRenderer.ADAPTIVE_GRID_SIZE = false to go back to a fixed
// BASE_GRID_SIZE brick for every glycan regardless of residue count - the
// behaviour this renderer had before computeGridSize(). Affects every
// instance (refresh()/wrap_gridsize both read it off the class, not a
// per-instance flag), so toggle it before constructing a renderer you want
// it to apply to.
LegraCanvasRenderer.ADAPTIVE_GRID_SIZE = false;
/* harmony default export */ const js_LegraCanvasRenderer = (LegraCanvasRenderer);
;// ./node_modules/legra-glycan.js/js/main.js



/***/ },

/***/ 406
/*!*********************************************!*\
  !*** ./node_modules/legra/lib/legra.umd.js ***!
  \*********************************************/
(module) {

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
!function (t, e) {
   true ? module.exports = e() : 0;
}(this, function () {
  "use strict";

  var t = [-.06405689286260563, .06405689286260563, -.1911188674736163, .1911188674736163, -.3150426796961634, .3150426796961634, -.4337935076260451, .4337935076260451, -.5454214713888396, .5454214713888396, -.6480936519369755, .6480936519369755, -.7401241915785544, .7401241915785544, -.820001985973903, .820001985973903, -.8864155270044011, .8864155270044011, -.9382745520027328, .9382745520027328, -.9747285559713095, .9747285559713095, -.9951872199970213, .9951872199970213],
    e = [.12793819534675216, .12793819534675216, .1258374563468283, .1258374563468283, .12167047292780339, .12167047292780339, .1155056680537256, .1155056680537256, .10744427011596563, .10744427011596563, .09761865210411388, .09761865210411388, .08619016153195327, .08619016153195327, .0733464814110803, .0733464814110803, .05929858491543678, .05929858491543678, .04427743881741981, .04427743881741981, .028531388628933663, .028531388628933663, .0123412297999872, .0123412297999872];
  function n(t, e) {
    var n = e(t),
      i = n[0] * n[0] + n[1] * n[1];
    return Math.sqrt(i);
  }
  class i {
    constructor(t, e, n, i) {
      this.points = [], this.dpoints = [], this._lut = [], this.order = 3, this.points.push(t, e, n), i && this.points.push(i), this.order = this.points.length - 1, this.update();
    }
    update() {
      this._lut = [], this.dpoints = function (t) {
        var e = [];
        for (var _n = t, _i = _n.length, _o = _i - 1; _i > 1; _i--, _o--) {
          var _t = [];
          var _i2 = [0, 0];
          for (var _e = 0; _e < _o; _e++) _i2 = [_o * (_n[_e + 1][0] - _n[_e][0]), _o * (_n[_e + 1][1] - _n[_e][1])], _t.push(_i2);
          e.push(_t), _n = _t;
        }
        return e;
      }(this.points);
    }
    length() {
      return function (i) {
        var o = 0;
        var s = t.length;
        for (var _h = 0; _h < s; _h++) {
          var _s = .5 * t[_h] + .5;
          o += e[_h] * n(_s, i);
        }
        return .5 * o;
      }(this.derivative.bind(this));
    }
    derivative(t) {
      var e = 1 - t;
      var n = 0,
        i = 0,
        o = 0,
        s = this.dpoints[0];
      return 2 === this.order ? (s = [s[0], s[1], [0, 0]], n = e, i = t) : 3 === this.order && (n = e * e, i = e * t * 2, o = t * t), [n * s[0][0] + i * s[1][0] + o * s[2][0], n * s[0][1] + i * s[1][1] + o * s[2][1]];
    }
    getLUT() {
      var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
      if (!t) return [];
      if (this._lut.length === t) return this._lut;
      this._lut = [], t--;
      for (var _e2 = 0; _e2 <= t; _e2++) this._lut.push(this.compute(_e2 / t));
      return this._lut;
    }
    compute(t) {
      return function (t, e) {
        if (0 === t) return e[0];
        var n = e.length - 1;
        if (1 === t) return e[n];
        var i = e;
        var o = 1 - t;
        if (0 === n) return e[0];
        if (1 === n) {
          return [o * i[0][0] + t * i[1][0], o * i[0][1] + t * i[1][1]];
        }
        if (n < 4) {
          var _e3 = o * o,
            _s2 = t * t;
          var _h2 = 0,
            _r = 0,
            _l = 0,
            _a = 0;
          return 2 === n ? (i = [i[0], i[1], i[2], [0, 0]], _r = _e3, _l = o * t * 2, _a = _s2) : 3 === n && (_r = _e3 * o, _l = _e3 * t * 3, _a = o * _s2 * 3, _h2 = t * _s2), [_r * i[0][0] + _l * i[1][0] + _a * i[2][0] + _h2 * i[3][0], _r * i[0][1] + _l * i[1][1] + _a * i[2][1] + _h2 * i[3][1]];
        }
        var s = JSON.parse(JSON.stringify(e));
        for (; s.length > 1;) {
          for (var _e4 = 0; _e4 < s.length - 1; _e4++) s[_e4] = [s[_e4][0] + (s[_e4 + 1][0] - s[_e4][0]) * t, s[_e4][1] + (s[_e4 + 1][1] - s[_e4][1]) * t];
          s.splice(s.length - 1, 1);
        }
        return s[0];
      }(t, this.points);
    }
  }
  var o = new Map();
  function s(t, e, n, i) {
    var s = i.brickSize,
      h = i.color;
    t.save(), t.fillStyle = h, t.shadowColor = "rgba(0,0,0,0.5)", t.shadowBlur = 3, t.shadowOffsetX = 1, t.shadowOffsetY = 1, t.beginPath(), t.rect(e, n, s, s), t.fill(), t.beginPath(), t.arc(e + s / 2, n + s / 2, function (t) {
      if (o.has(t)) return o.get(t);
      var e = Math.min(24, .5 * t / 2);
      return o.set(t, e), e;
    }(s), 0, 2 * Math.PI), t.fill(), t.restore();
  }
  function h(t, e, n, i) {
    var o = i.brickSize;
    s(n, t * o, e * o, i);
  }
  function r(t, e, n) {
    var i = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : !1;
    i && t.sort((t, e) => t[0] === e[0] ? t[1] < e[1] ? -1 : t[1] > e[1] ? 1 : 0 : t[0] < e[0] ? -1 : t[0] > e[0] ? 1 : 0);
    var o = n.brickSize;
    t.forEach(t => {
      s(e, t[0] * o, t[1] * o, n);
    });
  }
  function l(t, e, n, i) {
    var o = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : new Set();
    var s = [],
      h = t => {
        var e = t.join(",");
        o.has(e) || (o.add(e), s.push(t));
      };
    if (t === n) {
      var _n2 = Math.min(e, i),
        _o2 = Math.max(e, i);
      for (var _e5 = _n2; _e5 <= _o2; _e5++) h([t, _e5]);
    } else {
      var _o3 = i - e,
        _s3 = n - t,
        _r2 = _o3 / _s3,
        _l2 = e - _r2 * t;
      if (Math.abs(_s3) >= Math.abs(_o3)) {
        var _e6 = Math.min(t, n),
          _i3 = Math.max(t, n);
        for (var _t2 = _e6; _t2 <= _i3; _t2++) {
          h([_t2, Math.round(_r2 * _t2 + _l2)]);
        }
      } else {
        var _t3 = Math.min(e, i),
          _n3 = Math.max(e, i);
        for (var _e7 = _t3; _e7 <= _n3; _e7++) {
          h([Math.round((_e7 - _l2) / _r2), _e7]);
        }
      }
    }
    return s;
  }
  function a(t) {
    var e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();
    var n = [];
    for (var _i4 = 0; _i4 < t.length - 1; _i4++) {
      var _t$_i = _slicedToArray(t[_i4], 2),
        _o4 = _t$_i[0],
        _s4 = _t$_i[1],
        _t4 = _slicedToArray(t[_i4 + 1], 2),
        _h3 = _t4[0],
        _r3 = _t4[1],
        _a2 = l(_o4, _s4, _h3, _r3, e);
      n = [...n, ..._a2];
    }
    return n;
  }
  function c(t, e, n, i, o, s) {
    var r = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : !1;
    if (s.filled || r) for (var _r4 = 0; _r4 < n; _r4++) for (var _n4 = 0; _n4 < i; _n4++) h(t + _r4, e + _n4, o, s);else n > 0 && i > 0 && u([[t, e], [t + n - 1, e], [t + n - 1, e + i - 1], [t, e + i - 1], [t, e]], o, s);
  }
  function f(t, e, n, i, o, s) {
    r(l(t, e, n, i), o, s);
  }
  function u(t, e, n) {
    r(a(t), e, n, !0);
  }
  function d(t, e, n, i, o, s) {
    var h = 0,
      l = i;
    var a = n * n,
      f = i * i,
      u = -(a / 4 + n % 2 + f),
      d = -(f / 4 + i % 2 + a),
      p = -(f / 4 + i % 2);
    var g = -a * l,
      x = 2 * f * h,
      M = -2 * a * l;
    var m = 2 * f,
      y = 2 * a,
      b = () => {
        h++, g += x += m;
      },
      w = () => {
        l--, g += M += y;
      };
    if (s.filled) {
      var _r5 = [];
      var _x = h,
        _M = l,
        _m = 1,
        _y = 1;
      var S = (t, e, n, i) => {
        i < 0 && (e += i + 1, i = Math.abs(i)), _r5.push({
          x: t,
          y: e,
          width: n,
          height: i
        });
      };
      if (0 === i) S(t - 1, e, 2 * n + 1, 1);else {
        for (; l >= 0 && h <= n;) g + f * h <= u || g + a * l <= p ? (1 === _y || (2 * _M + 1 > 2 * (_y - 1) ? (S(t - _x, e - _M, _m, _y - 1), S(t - _x, e + _M, _m, 1 - _y), _M -= _y - 1, _y = 1) : (S(t - _x, e - _M, _m, 2 * _M + 1), _M -= _M, _y = 1)), b(), _x++, _m += 2) : g - a * l > d ? (w(), _y++) : (2 * _M + 1 > 2 * _y ? (S(t - _x, e - _M, _m, _y), S(t - _x, e + _M, _m, -_y)) : S(t - _x, e - _M, _m, 2 * _M + 1), b(), w(), _x++, _m += 2, _M -= _y, _y = 1);
        _M > _y ? (S(t - _x, e - _M, _m, _y), S(t - _x, e + _M + 1, _m, -_y)) : S(t - _x, e - _M, _m, 2 * _M + 1);
      }
      _r5.forEach(t => {
        t.height < 0 && (t.y += t.height + 1, t.height = Math.abs(t.height));
      }), _r5.sort((t, e) => t.y - e.y), _r5.forEach(t => c(t.x, t.y, t.width, t.height, o, s, !0));
    } else {
      var _i5 = [];
      for (; l >= 0 && h <= n;) _i5.push([t + h, e + l]), 0 === h && 0 === l || _i5.push([t - h, e - l]), 0 !== h && 0 !== l && (_i5.push([t + h, e - l]), _i5.push([t - h, e + l])), g + f * h <= u || g + a * l <= p ? b() : g - a * l > d ? w() : (b(), w());
      r(_i5, o, s, !0);
    }
  }
  function p(t, e, n) {
    if (0 === t.length) return;
    if (1 === t.length) return void h(t[0][0], t[0][1], e, n);
    if (2 === t.length) {
      var _t5 = _slicedToArray(t, 2),
        _t5$ = _slicedToArray(_t5[0], 2),
        _i6 = _t5$[0],
        _o5 = _t5$[1],
        _t5$2 = _slicedToArray(_t5[1], 2),
        _s5 = _t5$2[0],
        _h4 = _t5$2[1];
      return void f(_i6, _o5, _s5, _h4, e, n);
    }
    var i = [...t];
    if (i[0].join(",") !== i[i.length - 1].join(",") && i.push([i[0][0], i[0][1]]), n.filled) {
      var _t6 = new Set();
      var _o6 = a(i, _t6);
      var _s6 = [];
      for (var _t7 = 0; _t7 < i.length - 1; _t7++) {
        var _e8 = i[_t7],
          _n5 = i[_t7 + 1];
        if (_e8[1] !== _n5[1]) {
          var _t8 = Math.min(_e8[1], _n5[1]);
          _s6.push({
            ymin: _t8,
            ymax: Math.max(_e8[1], _n5[1]),
            x: _t8 === _e8[1] ? _e8[0] : _n5[0],
            islope: (_n5[0] - _e8[0]) / (_n5[1] - _e8[1])
          });
        }
      }
      _s6.sort((t, e) => t.ymin < e.ymin ? -1 : t.ymin > e.ymin ? 1 : t.x < e.x ? -1 : t.x > e.x ? 1 : t.ymax === e.ymax ? 0 : (t.ymax - e.ymax) / Math.abs(t.ymax - e.ymax));
      var _h5 = [],
        _c = _s6[0].ymin;
      for (; _h5.length || _s6.length;) {
        if (_s6.length) {
          var _t9 = -1;
          for (var _e9 = 0; _e9 < _s6.length && !(_s6[_e9].ymin > _c); _e9++) _t9 = _e9;
          _s6.splice(0, _t9 + 1).forEach(t => {
            _h5.push({
              s: _c,
              edge: t
            });
          });
        }
        if ((_h5 = _h5.filter(t => t.edge.ymax !== _c)).sort((t, e) => t.edge.x === e.edge.x ? 0 : (t.edge.x - e.edge.x) / Math.abs(t.edge.x - e.edge.x)), _h5.length > 1) for (var _e0 = 0; _e0 < _h5.length; _e0 += 2) {
          var _n6 = _e0 + 1;
          if (_n6 >= _h5.length) break;
          var _i7 = _h5[_e0].edge,
            _s7 = _h5[_n6].edge;
          _o6 = _o6.concat(l(Math.round(_i7.x), _c, Math.round(_s7.x), _c, _t6));
        }
        _c++, _h5.forEach(t => {
          t.edge.x = t.edge.x + t.edge.islope;
        });
      }
      r(_o6, e, n, !0);
    } else u(i, e, n);
  }
  return class {
    constructor(t) {
      var e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 24;
      var n = arguments.length > 2 ? arguments[2] : undefined;
      this.defaultOptions = {
        brickSize: 24,
        color: "#2196F3",
        filled: !1
      }, this.ctx = t, this.defaultOptions.brickSize = e, n && (n.color && (this.defaultOptions.color = n.color), "boolean" == typeof n.filled && (this.defaultOptions.filled = n.filled));
    }
    opt(t) {
      return t ? Object.assign({}, this.defaultOptions, t) : this.defaultOptions;
    }
    line(t, e, n, i, o) {
      f(t, e, n, i, this.ctx, this.opt(o));
    }
    linearPath(t, e) {
      u(t, this.ctx, this.opt(e));
    }
    rectangle(t, e, n, i, o) {
      c(t, e, n, i, this.ctx, this.opt(o));
    }
    circle(t, e, n, i) {
      !function (t, e, n, i, o) {
        d(t, e, n, n, i, o);
      }(t, e, n, this.ctx, this.opt(i));
    }
    ellipse(t, e, n, i, o) {
      d(t, e, n, i, this.ctx, this.opt(o));
    }
    polygon(t, e) {
      p(t, this.ctx, this.opt(e));
    }
    arc(t, e, n, i, o, s, h, r) {
      !function (t, e, n, i, o, s, h, r, l) {
        var a = Math.min(o, s),
          c = Math.max(o, s);
        if (a === c) return;
        if (n <= 0 || i <= 0) return;
        c - a > 2 * Math.PI && (a = 0, c = 2 * Math.PI);
        var f = Math.round(2 * Math.sqrt((n * n + i * i) / 2) * (c - a)),
          d = (c - a) / f,
          g = new Set(),
          x = [];
        for (var _o7 = 0; _o7 <= f; _o7++) {
          var _s8 = a + _o7 * d,
            _h6 = Math.cos(_s8),
            _r6 = Math.sin(_s8),
            _l3 = n * i / Math.sqrt(i * i * _h6 * _h6 + n * n * _r6 * _r6),
            _c2 = [t + Math.round(_l3 * _h6), e + Math.round(_l3 * _r6)],
            _f = _c2.join(",");
          g.has(_f) || (g.add(_f), x.push(_c2));
        }
        if (h) {
          var _n7 = [t, e],
            _i8 = _n7.join(",");
          g.has(_i8) || (g.add(_i8), x.push(_n7)), p(x, r, l);
        } else u(x, r, l);
      }(t, e, n, i, o, s, h, this.ctx, this.opt(r));
    }
    bezierCurve(t, e, n, o, s, h, r, l, a) {
      !function (t, e, n, o, s, h, r, l, a, c) {
        var f = new i([t, e], [n, o], [s, h], [r, l]),
          d = f.getLUT(f.length()).map(t => [Math.round(t[0]), Math.round(t[1])]);
        d.push([r, l]), c.filled ? p(d, a, c) : u(d, a, c);
      }(t, e, n, o, s, h, r, l, this.ctx, this.opt(a));
    }
    quadraticCurve(t, e, n, o, s, h, r) {
      !function (t, e, n, o, s, h, r, l) {
        var a = new i([t, e], [n, o], [s, h]),
          c = a.getLUT(a.length()).map(t => [Math.round(t[0]), Math.round(t[1])]);
        c.push([s, h]), l.filled ? p(c, r, l) : u(c, r, l);
      }(t, e, n, o, s, h, this.ctx, this.opt(r));
    }
    drawImage(t, e, n, i, o) {
      !function (t, e, n, i, o, s, r) {
        var l = e.brickSize;
        s || (s = [0, 0]), r || (r = [n.width, n.height]), o || (o = [Math.round(r[0] / l), Math.round(r[1] / l)]);
        var _o8 = o,
          _o9 = _slicedToArray(_o8, 2),
          a = _o9[0],
          c = _o9[1],
          f = "undefined" != typeof OffscreenCanvas ? new OffscreenCanvas(a, c) : document.createElement("canvas");
        f.width = a, f.height = c;
        var u = f.getContext("2d");
        u.drawImage(n, s[0], s[1], r[0], r[1], 0, 0, o[0], o[1]);
        var d = u.getImageData(0, 0, a, c);
        for (var _e1 = 0; _e1 < c; _e1++) for (var _n8 = 0; _n8 < a; _n8++) {
          var _o0 = {
            brickSize: l,
            color: "rgb(".concat(d.data[_e1 * a * 4 + 4 * _n8], ", ").concat(d.data[_e1 * a * 4 + 4 * _n8 + 1], ", ").concat(d.data[_e1 * a * 4 + 4 * _n8 + 2], ")"),
            filled: !1
          };
          h(i[0] + _n8, i[1] + _e1, t, _o0);
        }
      }(this.ctx, this.opt(), t, e, n, i, o);
    }
  };
});

/***/ },

/***/ 866
/*!**********************************!*\
  !*** ./node_modules/ms/index.js ***!
  \**********************************/
(module) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

/***/ },

/***/ 724
/*!********************************************************!*\
  !*** ./node_modules/glycan.js/js/main.js + 34 modules ***!
  \********************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  CanvasRenderer: () => (/* reexport */ js_CanvasRenderer),
  CondensedIupac: () => (/* reexport */ CondensedIupac_namespaceObject),
  CondensedLayout: () => (/* reexport */ js_CondensedLayout),
  FishEyeLayout: () => (/* binding */ main_FishEyeLayout),
  FragmentRenderer: () => (/* reexport */ FragmentRenderer),
  Fragmentor: () => (/* reexport */ js_Fragmentor),
  LinkageLayout: () => (/* reexport */ js_LinkageLayout),
  LinkageLayoutFishEye: () => (/* binding */ LinkageLayoutFishEye),
  MONOSACCHARIDE: () => (/* reexport */ MONOSACCHARIDE),
  Mass: () => (/* reexport */ Mass),
  Monosaccharide: () => (/* reexport */ Monosaccharide),
  REDUCING_END_2AB: () => (/* reexport */ REDUCING_END_2AB),
  Reaction: () => (/* reexport */ js_Reaction),
  ReactionGroup: () => (/* reexport */ ReactionGroup),
  ReactionSet: () => (/* reexport */ ReactionSet),
  Repeat: () => (/* reexport */ Repeat),
  SEQUENCE_CACHEKEY: () => (/* reexport */ SEQUENCE_CACHEKEY),
  SVGCanvas: () => (/* reexport */ js_SVGCanvas),
  SVGRenderer: () => (/* reexport */ js_SVGRenderer),
  Sugar: () => (/* reexport */ Sugar),
  SugarAwareLayout: () => (/* reexport */ SugarAwareLayout),
  SugarAwareLayoutFishEye: () => (/* binding */ SugarAwareLayoutFishEye),
  WobbleCanvasRenderer: () => (/* reexport */ js_WobbleCanvasRenderer),
  comparator: () => (/* reexport */ comparator),
  readGlycoCT: () => (/* reexport */ readGlycoCT),
  writeGlycoCT: () => (/* reexport */ writeGlycoCT)
});

// NAMESPACE OBJECT: ./node_modules/glycan.js/js/io/CondensedIupac.js
var CondensedIupac_namespaceObject = {};
__webpack_require__.r(CondensedIupac_namespaceObject);
__webpack_require__.d(CondensedIupac_namespaceObject, {
  Builder: () => (Builder),
  IO: () => (IO),
  Writer: () => (Writer)
});

// NAMESPACE OBJECT (decoupled): ./node_modules/glycan.js/js/mass_provider.js
var mass_provider_namespaceObject = {};
__webpack_require__.r(mass_provider_namespaceObject);
__webpack_require__.d(mass_provider_namespaceObject, {
  composition_to_mass: () => (composition_to_mass),
  importSymbols: () => (importSymbols)
});

;// ./node_modules/glycan.js/js/reference_monosaccharides.js
// No imports — pure constants only.

var MONOSACCHARIDE = Object.freeze({
  GlcNAc: 'GlcNAc',
  GalNAc: 'GalNAc',
  ManNAc: 'ManNAc',
  MurNAc: 'MurNAc',
  GlcN: 'GlcN',
  Glc: 'Glc',
  Gal: 'Gal',
  Galf: 'Galf',
  Man: 'Man',
  Fuc: 'Fuc',
  Xyl: 'Xyl',
  NeuAc: 'NeuAc',
  NeuAc9Ac: 'NeuAc9Ac',
  NeuGc: 'NeuGc',
  NeuGc9Ac: 'NeuGc9Ac',
  GlcA: 'GlcA',
  IdoA: 'IdoA',
  HSO3: 'HSO3'
});
;// ./node_modules/glycan.js/js/Monosaccharide.js


function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
;
var LINKAGES = {
  'O': -100,
  'N': -200
};
var anomer_symbol = Symbol('anomer');
var identifier_symbol = Symbol('identifier');
var parent_linkage_symbol = Symbol('parent_linkage');
var parent_symbol = Symbol('parent');
var unknown_count_symbol = Symbol('unknown_count');
var MAX_KNOWN_LINKAGE = 100;
var only_unique = (v, i, s) => s.indexOf(v) === i;
var _leaves_of_residue = function leaves_of_residue(residue) {
  if (residue.children.length == 0) {
    return [residue];
  }
  return Array.prototype.concat.apply([], residue.children.map(_leaves_of_residue));
};
var get_path_to_root = function get_path_to_root(roots, residue) {
  var result = [residue];
  while (roots.indexOf(result[0]) < 0) {
    result.unshift(result[0].parent);
  }
  return result;
};
var residue_sorter = function residue_sorter(a, b) {
  if (a.parent.linkageOf(a) !== b.parent.linkageOf(b)) {
    return a.parent.linkageOf(a) - b.parent.linkageOf(b);
  }
  if (a.identifier !== b.identifier) {
    return a.identifier.toUpperCase() < b.identifier.toUpperCase() ? -1 : 1;
  }
  return 0;
};
var path_sorter = function path_sorter(path_a, path_b) {
  var path_a_loop = [].concat(path_a);
  var path_b_loop = [].concat(path_b);
  while (path_a_loop.length > 0 && path_b_loop.length > 0) {
    var a = path_a_loop.shift();
    var b = path_b_loop.shift();
    var res = residue_sorter(a, b);
    if (res) {
      return res;
    }
  }
  // We want the longest path length, therefore -1 * diff
  return -1 * (path_a_loop.length - path_b_loop.length);
};
var reorder_kids = function reorder_kids(children) {
  var leaves = [];
  for (var child of children) {
    leaves = leaves.concat(_leaves_of_residue(child));
  }
  var paths = leaves.map(get_path_to_root.bind(null, children));
  var sorted_kids = paths.sort(path_sorter);
  return sorted_kids.map(path => path[0]).filter(only_unique);
};


/*   We basically want a barebones Monosacharide class that uses
  some common set of identifiers for each of the monosaccharide
  units. We can then mixin things like mass and sequence
  translation to edit the actual functionality for the sugar.
  Can even have a 'strict mode' sugar mixin that enforces
  rules.
*/

var linkage_map = new WeakMap();
var children_map = new WeakMap();
var tag_map = new WeakMap();
class Monosaccharide {
  static get LINKAGES() {
    return LINKAGES;
  }
  constructor(identifier) {
    if (!identifier) {
      throw new Error('Missing identifier');
    }
    // Accept any identifier - we can do
    // checking on validity of identifiers
    // via mixins.
    this[identifier_symbol] = identifier;
  }
  get depth() {
    var start = this;
    var count = 1;
    while (start.parent) {
      count++;
      start = start.parent;
    }
    return count;
  }
  get identifier() {
    return this[identifier_symbol];
  }
  get monosaccharide() {
    var _MONOSACCHARIDE$this$;
    return (_MONOSACCHARIDE$this$ = MONOSACCHARIDE[this.identifier]) !== null && _MONOSACCHARIDE$this$ !== void 0 ? _MONOSACCHARIDE$this$ : null;
  }
  get anomer() {
    return this[anomer_symbol];
  }
  // This should be a tristate variable a/b/?
  set anomer(anomer) {
    this[anomer_symbol] = anomer;
  }

  // parent linkage
  get parent_linkage() {
    return this[parent_linkage_symbol];
  }

  // Accept any number for the parent linkage. Also accept null for
  // unknown linkage
  set parent_linkage(linkage) {
    this[parent_linkage_symbol] = linkage;
  }
  get parent() {
    return this[parent_symbol];
  }

  // This should spit out an immutable array - force usage of the api
  // to add/remove children.
  get children() {
    return Object.freeze([].concat(children_map.get(this) || []));
  }
  get child_linkages() {
    var results = new Map();
    this.children.forEach(mono => {
      var position = linkage_map.get(mono);
      var real_position = position;
      if (position > MAX_KNOWN_LINKAGE) {
        real_position = 0;
      }
      var kids = results.get(real_position);
      if (!kids) {
        kids = [];
        results.set(real_position, kids);
      }
      kids.push(mono);
    });
    return results;
  }
  get siblings() {
    var self = this;
    if (!this.parent) {
      return [];
    }
    return this.parent.children.filter(mono => mono !== self);
  }
  balance() {
    var ascend = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    if (Object.isFrozen(this)) {
      throw new TypeError('Cannot balance child ordering of frozen monosaccharide');
    }
    var child_order = reorder_kids(this.children);
    this[unknown_count_symbol] = 0;
    var unknown_count = 0;
    for (var child of child_order) {
      if (linkage_map.get(child) > MAX_KNOWN_LINKAGE) {
        unknown_count += 1;
        linkage_map.set(child, MAX_KNOWN_LINKAGE + 1 + unknown_count);
      }
    }
    this[unknown_count_symbol] = unknown_count;
    children_map.set(this, child_order);
    var parent = this;
    if (!ascend) {
      return;
    }
    while (parent && parent.parent) {
      var parent_link = parent.parent.linkageOf(parent);
      if (parent.parent.child_linkages.get(parent_link).length > 0) {
        parent.parent.balance(false);
      }
      parent = parent.parent;
    }
  }

  // child linkages

  // methods:
  // add child
  addChild(linkage, child) {
    if (Object.isFrozen(this) || Object.isFrozen(child)) {
      throw new TypeError('Cannot add child on frozen monosaccharide');
    }
    if (typeof linkage !== 'number') {
      throw new Error('Linkage must be number');
    }
    if (linkage > MAX_KNOWN_LINKAGE) {
      throw new Error("Cannot set defined linkage greater than ".concat(MAX_KNOWN_LINKAGE));
    }
    if (linkage == 0) {
      this[unknown_count_symbol] = this[unknown_count_symbol] || 0;
      var unknown_count = this[unknown_count_symbol];
      this[unknown_count_symbol] = unknown_count + 1;
      linkage = MAX_KNOWN_LINKAGE + 1 + unknown_count;
    }

    // When we read in the sugar from
    // a sequence, we want to make addChild inaccessible
    // so that we can protect the ordering of the branches
    // and we can save some processing (especially since
    // IUPAC condensed delivers branch ordering as part
    // of the format).

    // BUT.. when we have a sugar that we are adding to
    // like when drawing, or programattically building a sugar
    // we should trigger branch ordering routines that
    // maintain the true ordering of branches.

    var insert_index = 0;
    for (var existing_child of this.children) {
      if (linkage_map.get(existing_child) <= linkage) {
        insert_index += 1;
      } else {
        break;
      }
    }
    linkage_map.set(child, linkage);

    // We should insert this child at the correct position in the children
    // map
    var current_children = children_map.get(this) || [];
    current_children.splice(insert_index, 0, child);
    children_map.set(this, current_children);

    // Each child references its parent.
    // When you clear this, you don't
    // have any strong references to this monosaccharide
    // and all its kids, so they will get GC'ed
    child[parent_symbol] = this;

    // jshint +W027
  }

  // remove child
  removeChild(new_linkage, target) {
    var self = this;
    if (Object.isFrozen(self)) {
      throw new TypeError('Cannot remove child on frozen monosaccharide');
    }
    var kids = children_map.get(self);
    var remover = child => {
      kids.splice(kids.indexOf(child), 1);
      linkage_map.delete(child);
      child[parent_symbol] = null;
      if (new_linkage == 0) {
        this[unknown_count_symbol] -= 1;
      }
    };
    var target_matcher = kid => target ? kid === target : true;
    for (var _ref3 of this.child_linkages) {
      var _ref2 = _slicedToArray(_ref3, 2);
      var linkage = _ref2[0];
      var children = _ref2[1];
      if (new_linkage == linkage) {
        children.filter(target_matcher).forEach(remover);
      }
    }
  }
  donateChildrenTo(parent) {
    if (Object.isFrozen(this) || Object.isFrozen(parent)) {
      throw new TypeError('Cannot adopt children on frozen monosaccharide');
    }
    for (var _ref6 of this.child_linkages) {
      var _ref5 = _slicedToArray(_ref6, 2);
      var children = _ref5[1];
      for (var kid of children) {
        parent.graft(kid);
      }
    }
  }
  replaceChild(child, new_child, override_position) {
    if (Object.isFrozen(this) || Object.isFrozen(new_child) || Object.isFrozen(child)) {
      throw new TypeError('Cannot replace child on frozen monosaccharide');
    }
    var position = this.linkageOf(child);
    var parent_pos = child.parent_linkage;
    var anomer = child.anomer;
    var new_self = this.removeChild(position, child);
    var parent = new_self ? new_self : this;
    new_child.parent_linkage = parent_pos;
    new_child.anomer = anomer;
    if (typeof override_position !== 'undefined') {
      parent.addChild(override_position, new_child);
    } else {
      parent.addChild(position, new_child);
    }
  }
  linkageOf(child) {
    var linkages = this.child_linkages.entries();
    var curr;
    for (curr of linkages) {
      if (curr[1].indexOf(child) >= 0) {
        return curr[0];
      }
    }
  }
  graft(child) {
    if (Object.isFrozen(this) || Object.isFrozen(child)) {
      throw new TypeError('Cannot graft child on frozen monosaccharide');
    }
    var old_parent = child.parent;
    var linkage = old_parent.linkageOf(child);
    old_parent.removeChild(linkage, child);
    this.addChild(linkage, child);
  }
  childAt(linkage) {
    var kids = this.child_linkages.get(linkage);
    return kids ? kids[0] : kids;
  }
  toString() {
    return this.identifier;
  }
  valueOf() {
    return this.identifier;
  }
  setTag(tagname, value) {
    if (!tag_map.has(this)) {
      tag_map.set(this, new Map());
    }
    var tag_set = tag_map.get(this);
    var tag_symbol = typeof tagname === 'symbol' ? tagname : Symbol(tagname);
    tag_set.set(tag_symbol, typeof value !== 'undefined' ? value : true);
    if (value === null) {
      tag_set.delete(tag_symbol);
    }
    return tag_symbol;
  }
  getTags() {
    if (!tag_map.has(this)) {
      return [];
    }
    return [...tag_map.get(this).keys()];
  }
  getTag(tag) {
    if (!tag_map.has(this)) {
      return;
    }
    var tag_set = tag_map.get(this);
    return tag_set.get(tag);
  }
  copyTagsFrom(residue) {
    if (!tag_map.has(this)) {
      tag_map.set(this, new Map());
    }
    var tag_set = tag_map.get(this);
    for (var tag of (tag_map.get(residue) || new Map()).keys()) {
      tag_set.set(tag, tag_map.get(residue).get(tag));
    }
  }
  clone() {
    var result = new this.constructor(this.identifier);
    result[anomer_symbol] = this[anomer_symbol];
    result[parent_linkage_symbol] = this[parent_linkage_symbol];
    result.copyTagsFrom(this);
    return result;
  }
  toSugar(sugarclass) {
    var temp_sugar = new sugarclass();
    temp_sugar.root = this;
    var return_value = temp_sugar.clone();
    temp_sugar.root = null;
    return return_value;
  }

  // cast to sugar (make monosaccharide a sugar/glycan class)
}
var StrictLinkages = superclass => class extends superclass {
  addChild(linkage, child) {
    if (this.childAt(linkage)) {
      this.removeChild(linkage);
    }
    return super.addChild(linkage, child);
  }
};
class StrictMonosaccharide extends StrictLinkages(Monosaccharide) {}
// EXTERNAL MODULE: ./node_modules/debug/src/browser.js
var browser = __webpack_require__(924);
;// ./node_modules/glycan.js/js/Debug.js

var cache = {};
function _get(t, k, r, name) {
  var defProp = Reflect.get(t, k, r) || Reflect.get(browser, k, r);
  if (defProp && defProp !== browser) {
    return defProp;
  } else {
    if (name) {
      k = "".concat(name, ":").concat(k);
    }
    return cache[k] || (cache[k] = debugAny(k));
  }
}
var set = (target, key, value) => Reflect.set(browser, key, value);
var debugAny = new Proxy(function (name) {
  for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }
  var result = new Proxy(browser(name, ...rest), {
    get: function get() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return _get(...args, name);
    },
    set
  });
  return result;
}, {
  get: _get,
  set
});

;// ./node_modules/glycan.js/js/Tracing.js




var module_string = 'glycanjs:tracing';
var log = debugAny(module_string);
var noop = () => {};
class TracedMonosaccharide extends Monosaccharide {
  constructor(original) {
    super(original.identifier);
    this.original = original;
    return this;
  }
  get anomer() {
    return this.original.anomer;
  }
  get parent_linkage() {
    return this.original.parent_linkage;
  }
  get identifier() {
    return this.original.identifier;
  }
  set anomer(ignore) {
    noop(ignore);
  }
  set parent_linkage(ignore) {
    noop(ignore);
  }
  set identifier(ignore) {
    noop(ignore);
  }
  linkageOf(node) {
    return this.original.linkageOf(node.original);
  }
  clone() {
    var cloned = new this.constructor(this.original);
    cloned.original = this.original;
    cloned.copyTagsFrom(this);
    return cloned;
  }
}
var initialise_sugar = function initialise_sugar(target, wanted) {
  var mono_class = target.constructor.Monosaccharide;
  target.root = new mono_class(wanted);
  return target;
};
var clone_and_add_monosaccharide = function clone_and_add_monosaccharide(wrapped_sugar, parent, child) {
  var new_sugar = wrapped_sugar.clone();
  parent = new_sugar.composition().filter(res => res.original === parent.original)[0];
  var wrapped_child = new wrapped_sugar.constructor.Monosaccharide(child);
  parent.addChild(parent.original.linkageOf(child), wrapped_child);
  return {
    sugar: new_sugar,
    child: wrapped_child
  };
};
var attach_via_cloning = (result_sugar, attachment, mapped_list, template_residue, child) => {
  var clone_results = clone_and_add_monosaccharide(result_sugar, attachment, child);
  clone_results.child.copyTagsFrom(template_residue);
  mapped_list.push(child);
  return clone_results.sugar;
};
var residues_in_mapping = (sugar, mapped_list) => {
  return sugar.composition().filter(residue => mapped_list.indexOf(residue.original) >= 0);
};
var trace_into_class = function trace_into_class(sugar, ResultClass) {
  var mapping = new Map();
  var traced = new ResultClass();
  traced.root = new ResultClass.Monosaccharide(sugar.root);
  mapping.set(sugar.root, traced.root);
  for (var residue of sugar.breadth_first_traversal()) {
    if (residue === sugar.root) {
      continue;
    }
    var wrapped_child = new ResultClass.Monosaccharide(residue);
    wrapped_child = Object.assign(wrapped_child, residue);
    mapping.set(residue, wrapped_child);
    mapping.get(residue.parent).addChild(residue.parent.linkageOf(residue), wrapped_child);
  }
  return traced;
};
var trace_sugar = function trace_sugar(ResultClass, search, search_root, template, comparator) {
  var cursor_mapping = new WeakMap();
  var sugar_sets = [];
  var attachment_to_sugar = new WeakMap();
  log.info('Tracing', template.sequence, 'onto', search.sequence, 'moving cursor over template');
  var successful_mappings = [...template.breadth_first_traversal(template.root, cursor => {
    log.info('Template cursor is positioned at', cursor.identifier);
    attachment_to_sugar = new WeakMap();
    if (!cursor.parent) {
      log.info('The cursor is at the root - the search sugar is at', search_root.identifier);
      sugar_sets.push(initialise_sugar(new ResultClass(), search_root));
      cursor_mapping.set(cursor, [sugar_sets[0].composition()[0].original]);
      sugar_sets[0].composition()[0].copyTagsFrom(cursor);
      log.info('Done with this cursor', cursor.identifier);
      return sugar_sets.length > 0;
    } else {
      cursor_mapping.set(cursor, []);
    }
    log.info('Residues in the search tree that correspond to the cursor parent are', cursor_mapping.get(cursor.parent).map(res => res.identifier));
    var wanted_linkage = cursor.parent.linkageOf(cursor);

    // If one of the result WrappedSugars doesn't contain the place where we will
    // attach monosaccharides (i.e. a monosaccharide wrapping the search sugar parent
    // corresponding to the parent of the cursor), we don't want that sugar

    sugar_sets = sugar_sets.filter(sug => residues_in_mapping(sug, cursor_mapping.get(cursor.parent)).length > 0);
    log.info('Current sets of sugars are', sugar_sets);

    // The attachment points on the results are found by finding the monosaccharides corresponding to cursor parent
    var attachment_points = sugar_sets.map(sugar => {
      var attach_point = residues_in_mapping(sugar, cursor_mapping.get(cursor.parent));
      if (attach_point.length > 1) {
        throw new Error('Tracing mapped a template residue to more than one residue in the search sugar');
      }
      attachment_to_sugar.set(attach_point[0], sugar);
      return attach_point[0];
    });
    sugar_sets = [];
    log.info('We need to find children of the attachment points linked via a', wanted_linkage, 'linkage');
    for (var attachment of attachment_points) {
      // Get all the children that could possibly match this linkage we are after
      var search_parent = attachment.original;
      log.info('Attachment point is a wrapped residue with identifier', search_parent.identifier);
      var search_kids = wanted_linkage == 0 ? search_parent.children : search_parent.child_linkages.get(wanted_linkage);
      log.info('We want to find a match for the cursor from within', (search_kids || []).length, 'possible child residues');

      // Check to find all the wrapped children of the attachment point matching against the cursor
      var valid_search_kids = [].concat(search_kids).filter(comparator.bind(null, cursor)).filter(res => res);
      if (valid_search_kids.length >= 1) {
        var attach_child_residue = attach_via_cloning.bind(null, attachment_to_sugar.get(attachment), attachment, cursor_mapping.get(cursor), cursor);
        log.info('Valid children in search sugar are', valid_search_kids.map(res => res.identifier));
        var sets_of_new_sugars = valid_search_kids.map(attach_child_residue);
        sugar_sets = sugar_sets.concat(sets_of_new_sugars);
      }
    }
    return sugar_sets.length > 0;
  })];
  log.info('We mapped', successful_mappings.length, 'out of', template.composition().length, 'residues');

  // Careful about which array we are pointing to here.
  log.info(sugar_sets.map(sug => sug.sequence));
  return sugar_sets;
};
class Tracer {
  static trace(source, start, template, comparator) {
    var own_constructor = source.constructor;
    var TracedClass = class extends own_constructor {
      static get Monosaccharide() {
        return TracedMonosaccharide;
      }
    };
    return trace_sugar(TracedClass, source, start, template, comparator);
  }
}

;// ./node_modules/glycan.js/lib/MixedTupleMap.js
// generate a random hash delimiter to avoid malicious hash collisions
function MixedTupleMap() {
  this.clear();
}
MixedTupleMap.prototype = {
  toString: function toString() {
    return '[object MixedTupleMap]';
  },
  // The difference between MixedTupleMap and WeakTupleMap is that this one has
  // a hash method that sorts key parts by putting non-primitive parts first.
  // This enables optimal garbage collection of values in the map.
  _hash: function _hash(tuple) {
    // Speed up hash generation for the folowing pattern:
    // if ( !cache.has(t) ) { cache.set( t, slowFn(t) ); }
    if (tuple === this._lastTuple) {
      return this._lastHash;
    }
    var l = tuple.length;
    var prim = [];
    var primOrder = [];
    var nonPrimOrder = [];
    for (var i = 0; i < l; i++) {
      var arg = tuple[i];
      var argType = typeof arg;
      if (argType !== null && (argType === 'object' || argType === 'function')) {
        nonPrimOrder.push(i);
      } else {
        prim.push(argType === 'string' ? '"' + arg + '"' : '' + arg);
        primOrder.push(i);
      }
    }
    if (nonPrimOrder.length === 0) {
      throw new Error('Tuple must have at least one non-primitive part');
    }
    prim.push('[' + nonPrimOrder.concat(primOrder).join() + ']');
    this._lastTuple = tuple;
    this._lastHash = {
      nonPrimOrder,
      // concatenate serialized arguments using a complex separator
      // (to avoid key collisions)
      primHash: prim.join('/<[MI_SEP]>/')
    };
    return this._lastHash;
  },
  has: function has(tuple) {
    var curr = this._cache;
    var hash = this._hash(tuple);
    var l = hash.nonPrimOrder.length;
    for (var i = 0; i < l; i++) {
      var arg = tuple[hash.nonPrimOrder[i]];
      if (curr.has && curr.has(arg)) {
        curr = curr.get(arg);
      } else {
        return false;
      }
    }
    return (curr.has || false) && curr.has(hash.primHash);
  },
  set: function set(tuple, value) {
    var curr = this._cache;
    var hash = this._hash(tuple);
    var l = hash.nonPrimOrder.length;
    var mustCreate = false;
    for (var i = 0; i < l; i++) {
      var arg = tuple[hash.nonPrimOrder[i]];
      if (!mustCreate && curr.has(arg)) {
        curr = curr.get(arg);
      } else {
        mustCreate = true;
        curr.set(arg, curr = i < l - 1 ? new WeakMap() : new Map());
      }
    }
    curr.set(hash.primHash, value);
    return this;
  },
  get: function get(tuple) {
    var curr = this._cache;
    var hash = this._hash(tuple);
    var l = hash.nonPrimOrder.length;
    for (var i = 0; i < l; i++) {
      var arg = tuple[hash.nonPrimOrder[i]];
      var ret = curr.get && curr.get(arg);
      if (ret === undefined) {
        return ret;
      } else {
        curr = ret;
      }
    }
    return curr.get && curr.get(hash.primHash);
  },
  clear: function clear() {
    this._cache = new WeakMap();
    delete this._lastTuple;
    delete this._lastHash;
  }
};
/* harmony default export */ const lib_MixedTupleMap = (MixedTupleMap);
;// ./node_modules/glycan.js/js/Repeat.js


var template_sugar = Symbol('template_sugar');
var last_residue = Symbol('last_residue');
var min_repeats = Symbol('min_repeats');
var max_repeats = Symbol('max_repeats');
var Repeat_identifier_symbol = Symbol('identifier');
var active_mode = Symbol('active_mode');
var MODE_EXPAND = Symbol('MODE_EXPAND');
var MODE_MINIMAL = Symbol('MODE_MINIMAL');
var Repeat_parent_symbol = Symbol('parent');
var sort_order_symbol = Symbol('sort_order');
var child_residue_symbol = Symbol('child_residue');
var repeat_symbol = Symbol('repeat');
var counter_symbol = Symbol('counter');




/*

// Usage:
// Create repeat unit from a sequence

// When we add child to a monosaccharide
// of a repeat sugar, the monosaccharide
// that gets added on should not be repeated
// too

// When we match a repeat, there should be
// two modes: Expand and minimal. Expand
// expands the repeat out to the max
// number of repeat units, and minimal
// only matches the minimal repeat unit

*/

var repeat_wraps = new lib_MixedTupleMap();
var counter_map = {};
class Counter {
  constructor() {}
  static get(counter) {
    if (!counter_map[counter]) {
      counter_map[counter] = new Counter();
    }
    return counter_map[counter];
  }
}
var get_wrapped_residue = (clazz, repeat, monosaccharide, parent, counter) => {
  var id_tuple = [repeat, Counter.get(counter), monosaccharide];
  if (!repeat_wraps.has(id_tuple)) {
    repeat_wraps.set(id_tuple, new clazz(monosaccharide, parent, repeat, counter));
  }
  return repeat_wraps.get(id_tuple);
};
var patch_parent = (residue, repeat) => {
  Object.defineProperty(residue, 'parent', {
    configurable: true,
    enumerable: true,
    get: () => {
      var max_count = repeat.mode === MODE_EXPAND ? repeat.max : repeat.mode === MODE_MINIMAL ? repeat.min : 1;
      var parent = get_wrapped_residue(repeat.constructor.Monosaccharide, repeat, repeat[last_residue], null, max_count);
      return parent;
    }
  });
};
var _repeat_iterator = function repeat_iterator(repeat) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : repeat.root;
  return function* () {
    yield start;
    if (!(start instanceof RepeatMonosaccharide)) {
      return;
    }
    var kids = start.children;
    for (var kid of kids) {
      for (var child of _repeat_iterator(repeat, kid)) {
        yield child;
      }
    }
  }();
};
var copy_children_skipping_residue;
class RepeatMonosaccharide extends TracedMonosaccharide {
  constructor(original, parent, repeat, counter) {
    super(original);
    this[Repeat_parent_symbol] = parent;
    this[repeat_symbol] = repeat;
    this[counter_symbol] = counter;
    return this;
  }
  static is_wrapped(r) {
    return r instanceof RepeatMonosaccharide;
  }
  static is_not_wrapped(r) {
    return !RepeatMonosaccharide.is_wrapped(r);
  }
  clone() {
    var result = new this.constructor(this.original, this[Repeat_parent_symbol], this[repeat_symbol].clone(), this[counter_symbol]);
    result.copyTagsFrom(this);
    return result;
  }
  get repeat() {
    return this[repeat_symbol];
  }
  get counter() {
    return this[counter_symbol];
  }
  balance() {
    var parent_linkages = this.children.map(res => {
      return {
        link: this.linkageOf(res),
        res: res
      };
    });
    parent_linkages.sort((a, b) => a.link - b.link);
    var all_children = parent_linkages.map(obj => obj.res);
    all_children = Object.freeze(reorder_kids(all_children));
    all_children.forEach((child, idx) => {
      child[sort_order_symbol] = idx + 1;
    });
  }
  addChild(linkage, child) {
    if (this.repeat.mode === MODE_EXPAND && (!this.endsRepeatUnit || this.counter < this.repeat.max)) {
      return super.addChild(linkage, child);
    }
    if (this.repeat[child_residue_symbol].children.indexOf(child) < 0) {
      this.repeat[child_residue_symbol].addChild(linkage, child);
      patch_parent(child, this.repeat);
    }
  }
  donateChildrenTo(parent) {
    if (this.counter === this.repeat.max && this.endsRepeatUnit) {
      for (var kid of this.repeat.children) {
        delete kid.parent;
        parent.graft(kid);
      }
    } else {
      copy_children_skipping_residue(this, parent);
    }
  }
  replaceChild(child, new_child, override_position) {
    if (this.repeat.mode === MODE_EXPAND) {
      return super.replaceChild(child, new_child, override_position);
    }
    if (!(child instanceof RepeatMonosaccharide)) {
      return super.replaceChild(child, new_child, override_position);
    }
    if (this.repeat[last_residue] === child.original) {
      this.repeat[last_residue] = new_child;
    }
    var replacement = this.original.replaceChild(child.original, new_child, override_position);
    return replacement;
  }
  removeChild(linkage, child) {
    if (this.repeat.mode === MODE_EXPAND) {
      // If this is the end of a repeat, we simply remove the child from the 
      // child of the repeat unit
      if (this.endsRepeatUnit && this.counter === this.repeat.max) {
        return this.repeat[child_residue_symbol].removeChild(linkage, child);
      } else {
        // Children added on to expanded repeat units aren't
        // controlled by the RepeatMonosaccharide children code

        if (!(child instanceof RepeatMonosaccharide)) {
          return super.removeChild(linkage, child);
        } else {
          // We are going to break the repeat by
          // cloning residues up to the end of the
          // last repeatUnit and grafting them 
          // onto the parent

          // Copy repeat from parent of child up to start of repeat
          // and then add to the repeat, grafting across children
          // when needed
          var parent = this;
          while (parent && parent instanceof RepeatMonosaccharide && !parent.endsRepeatUnit) {
            parent = parent.parent;
          }
          var res_class = this.original.constructor;
          var new_root = new res_class('temp_root');
          var clone_map = copy_children_skipping_residue(parent, new_root, child);
          if (!clone_map.get(this)) {
            clone_map.set(this, this);
          }
          var replaced_parent = clone_map.get(this);
          if (replaced_parent !== this) {
            this.balance = () => {
              return replaced_parent.balance();
            };
            replaced_parent.renderer = this.renderer;
          }
          if (parent instanceof RepeatMonosaccharide) {
            parent.repeat.max = parent.counter;
            parent.repeat.children = [...new_root.children];
          } else {
            for (var repeat_kid of parent.children.filter(res => res instanceof RepeatMonosaccharide)) {
              parent.removeChild(parent.linkageOf(repeat_kid), repeat_kid);
            }
            for (var _child of new_root.children) {
              parent.graft(_child);
            }
          }
          return replaced_parent;
        }
      }
    }
    if (this.repeat.mode === MODE_MINIMAL) {
      if (child instanceof RepeatMonosaccharide) {
        if (child.endsRepeatUnit) {
          child.original.parent.removeChild(child.original.parent.linkageOf(child.original), child.original);
          child.repeat.root.parent.replaceChild(child.repeat.root, child.repeat.root.original);
          return;
        }
        child.original.parent.removeChild(child.original.parent.linkageOf(child.original), child.original);
        return;
      } else {
        if (this.repeat.children.indexOf(child) >= 0) {
          this.repeat[child_residue_symbol].removeChild(linkage, child);
          delete child.parent;
          return;
        }
        throw new Error('REPEAT_UNREACHABLE');
      }
    }
    if (!this.endsRepeatUnit) {
      throw new Error('Removing a child that isnt at the end of a repeat');
    }
  }
  get endsRepeatUnit() {
    return this.original === this.repeat[last_residue];
  }
  get parent() {
    if (this[Repeat_parent_symbol]) {
      return this[Repeat_parent_symbol];
    }
    return super.parent;
  }
  linkageOf(child) {
    if (child instanceof RepeatMonosaccharide && child.repeat === this.repeat) {
      if (this.endsRepeatUnit && child.repeat === this.repeat && child.counter !== this.counter && child.original === this.repeat.root.original) {
        return this.repeat.root.parent.linkageOf(this.repeat.root);
      }
      return this.original.linkageOf(child.original);
    } else if (this.endsRepeatUnit && this.repeat.children.indexOf(child) >= 0) {
      return this.repeat[child_residue_symbol].linkageOf(child);
    } else {
      return new Monosaccharide(' ').linkageOf.call(this, child);
    }
  }
  get child_linkages() {
    var linkage_map = super.child_linkages;
    var results = new Map();
    for (var link of linkage_map.keys()) {
      for (var res of linkage_map.get(link).filter(RepeatMonosaccharide.is_wrapped)) {
        var wrapped_link = res.original.parent.linkageOf(res.original);
        results.set(wrapped_link, (results.get(wrapped_link) || []).concat(res));
      }
      for (var _res of linkage_map.get(link).filter(RepeatMonosaccharide.is_not_wrapped)) {
        results.set(link, (results.get(link) || []).concat(_res));
      }
    }
    return results;
  }
  get children() {
    var max_count = this.repeat.mode === MODE_EXPAND ? this.repeat.max : this.repeat.mode === MODE_MINIMAL ? this.repeat.min : 1;
    var original_kids = this.original.children;
    var self_kids = super.children;
    var repeat_end_kids = [];
    if (this.repeat.mode === MODE_MINIMAL) {
      self_kids = [];
    }
    if (this.endsRepeatUnit && this.counter >= max_count) {
      repeat_end_kids = this.repeat.children;
    }
    var results = [];
    if (this.endsRepeatUnit && this.counter < max_count) {
      results.push(get_wrapped_residue(this.constructor, this.repeat, this.repeat.root.original, this, this.counter + 1));
    }
    var wrapped_original = original_kids.map(child => get_wrapped_residue(this.constructor, this.repeat, child, this, this.counter));
    var mapped = Object.freeze([self_kids, repeat_end_kids, results].reduce((curr, newarr) => curr.concat(newarr), wrapped_original));
    if (mapped.length > 0 && mapped.every(child => child[sort_order_symbol])) {
      var sorted_mapped = Object.freeze(mapped.slice().sort((a, b) => a[sort_order_symbol] - b[sort_order_symbol]));
      return sorted_mapped;
    } else {
      return mapped;
    }
  }
}
copy_children_skipping_residue = (parent, newroot, toskip) => {
  var parent_repeat_kids = parent.children.filter(res => res !== toskip);
  var cloned_map = new Map();
  var graft_cloner = (newparent, res) => {
    var old_parent = res.parent;
    var linkage = old_parent.linkageOf(res);
    var toadd = res instanceof RepeatMonosaccharide ? res.original.clone() : res;
    if (old_parent instanceof RepeatMonosaccharide && old_parent.repeat[child_residue_symbol].children.indexOf(res) >= 0) {
      old_parent.repeat[child_residue_symbol].removeChild(linkage, res);
      delete res.parent;
    }
    cloned_map.set(res, toadd);
    if (newparent.children.indexOf(toadd) < 0) {
      newparent.addChild(linkage, toadd);
    }
  };
  parent_repeat_kids.forEach(graft_cloner.bind(null, newroot));
  for (var kid of parent_repeat_kids) {
    cloned_map = new Map([...cloned_map, ...copy_children_skipping_residue(kid, cloned_map.get(kid), toskip)]);
  }
  return cloned_map;
};
class Repeat {
  constructor(sugar, attachment) {
    var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    this[template_sugar] = sugar;
    var main_branch_residue = sugar.leaves()[0];
    if (sugar.root.identifier === 'Root') {
      sugar.root = sugar.root.children[0];
    }
    this[last_residue] = main_branch_residue;
    if (!attachment) {
      if (sugar.leaves.length !== 1) {
        throw new Error('Too many leaves on repeat without defined attachment site');
      }
    } else {
      this[last_residue] = typeof attachment === 'string' && !(attachment instanceof Monosaccharide) ? sugar.locate_monosaccharide(attachment) : attachment;
    }
    if (typeof attachment !== 'string') {
      attachment = sugar.location_for_monosaccharide(this[last_residue]);
    }
    this[min_repeats] = min;
    this[max_repeats] = max;
    this[child_residue_symbol] = new Monosaccharide('Root');
  }
  clone() {
    var cloned = new this.constructor(this[template_sugar], this[last_residue], this.min, this.max);
    cloned.identifier = this.identifier;
    if (this.mode) {
      cloned.mode = this.mode;
    }
    return cloned;
  }
  get off_main() {
    return this[last_residue] !== this[template_sugar].leaves()[0];
  }
  static get Monosaccharide() {
    return RepeatMonosaccharide;
  }
  static addToSugar(sugar, start, end, mode) {
    var min = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    var max = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
    if (!(start instanceof Monosaccharide) && typeof start === 'string') {
      start = sugar.locate_monosaccharide(start);
    }
    if (!(end instanceof Monosaccharide) && typeof end === 'string') {
      end = sugar.locate_monosaccharide(end);
    }
    var temp_end = new Monosaccharide('Root');
    for (var kid of end.children) {
      temp_end.graft(kid);
    }
    var parent = start.parent;
    var parent_link = parent.linkageOf(start);
    parent.removeChild(parent_link, start);
    if (parent instanceof RepeatMonosaccharide) {
      var new_start = start.clone();
      for (var _kid of start.children) {
        new_start.graft(_kid);
      }
      start = new_start;
    }
    var temp_sugar = new sugar.constructor();
    temp_sugar.root = new Monosaccharide('Root');
    temp_sugar.root.addChild(parent_link, start);
    var repeat = new Repeat(temp_sugar, end, min, max);
    repeat.mode = mode;
    for (var _kid2 of temp_end.children) {
      repeat[child_residue_symbol].graft(_kid2);
      patch_parent(_kid2, repeat);
    }
    parent.addChild(parent_link, repeat.root);
    return repeat;
  }
  static get MODE_EXPAND() {
    return MODE_EXPAND;
  }
  static get MODE_MINIMAL() {
    return MODE_MINIMAL;
  }
  get template() {
    return this[template_sugar];
  }
  get root() {
    var root = get_wrapped_residue(RepeatMonosaccharide, this, this[template_sugar].root, null, this.min);
    if (this[template_sugar].root.parent && !root.parent) {
      var target_linkage = this[template_sugar].root.parent.linkageOf(this[template_sugar].root);
      var placeholder = this[template_sugar].root.parent.clone();
      placeholder.removeChild(target_linkage, this[template_sugar].root);
      placeholder.addChild(target_linkage, root);
    }
    return root;
  }
  get attachment() {
    return this.template.location_for_monosaccharide(this[last_residue]);
  }
  get identifier() {
    return this[Repeat_identifier_symbol] || '';
  }
  set identifier(id) {
    this[Repeat_identifier_symbol] = id;
  }
  get mode() {
    return this[active_mode];
  }
  set mode(mode) {
    if ([MODE_MINIMAL, MODE_EXPAND].indexOf(mode) < 0) {
      throw new Error('Invalid mode');
    }
    this[active_mode] = mode;
  }
  get min() {
    return this[min_repeats];
  }
  get max() {
    return this[max_repeats];
  }
  set max(max) {
    this[max_repeats] = max;
  }
  get children() {
    return this[child_residue_symbol].children;
  }
  set children(children) {
    var root = this[child_residue_symbol];
    for (var kid of root.children.filter(kid => children.indexOf(kid) < 0)) {
      root.removeChild(root.linkageOf(kid), kid);
    }
    for (var residue of children.filter(kid => root.children.indexOf(kid) < 0)) {
      if (residue.parent) {
        root.graft(residue);
      } else {
        root.addChild(0, residue);
      }
      patch_parent(residue, this);
    }
  }
}
;// ./node_modules/glycan.js/js/TupleCache.js
var uuid_path = Symbol('uuid');
var uuid_map = new WeakMap();
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}
class TupleCache {
  constructor() {
    this._cache = new Map();
  }
  has(tuple) {
    return this._cache.get(tuple.map(obj => uuid_map.get(obj)).join('#')) != null;
  }
  get(tuple) {
    return this._cache.get(tuple.map(obj => uuid_map.get(obj)).join('#'));
  }
  set(tuple, value) {
    var uuids = tuple.map(obj => {
      var curr_uuid = uuid_map.get(obj);
      if (!curr_uuid) {
        curr_uuid = uuidv4();
        uuid_map.set(obj, curr_uuid);
      }
      return curr_uuid;
    });
    this._cache.set(uuids.join('#'), value);
  }
}
/* harmony default export */ const js_TupleCache = (TupleCache);
;// ./node_modules/glycan.js/js/Searching.js



// import MixedTupleMap from '../lib/MixedTupleMap';

var Searching_module_string = 'glycanjs:searching';
var Searching_log = debugAny(Searching_module_string);
var SKIP_CACHE_TAG = Symbol('skip_cache');
var flatten = array => [].concat.apply([], array);
var onlyUnique = function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
};
var global_match_subpath = function global_match_subpath(path_pattern, comparator, path) {
  var test_residue = null;
  var loop_pattern = [].concat(path_pattern);
  var loop_path = [].concat(path);
  while (test_residue = loop_pattern.shift()) {
    var pattern_residues_remaining = loop_pattern.length > 0;
    loop_path = loop_path.filter(comparator.bind(null, test_residue));
    if (pattern_residues_remaining) {
      loop_path = loop_path.map(matched => matched.parent);
    }
    loop_path = loop_path.filter(residue => residue !== null && typeof residue !== 'undefined');
  }
  // We get back the elements of the paths where we match the pattern
  return loop_path.map(start => path.indexOf(start)).map(start_idx => path.slice(start_idx - path_pattern.length + 1, start_idx + 1));
};
var match_fixed_paths = function match_fixed_paths(sugar, pattern, comparator) {
  var paths = sugar.paths();
  var search_paths = pattern.paths();
  var potential_roots = [];
  var search_path_match_count = new WeakMap();
  var match_roots = match => match.map(residues => residues[residues.length - 1]);
  search_paths.forEach(search_path => {
    var matcher = global_match_subpath.bind(null, search_path, comparator);
    var subpaths = paths.map(matcher);
    potential_roots = potential_roots.concat(flatten(subpaths.map(match_roots))).filter(onlyUnique);
    var matched_residues = flatten(flatten(subpaths)).filter(onlyUnique);
    matched_residues.forEach(res => {
      search_path_match_count.set(res, (search_path_match_count.get(res) || 0) + 1);
    });
  });
  var wanted_roots = potential_roots.filter(res => search_path_match_count.get(res) == pattern.leaves().length);
  return wanted_roots;
};
var map_leaf_originals = function map_leaf_originals(trees, wildcard_symbol) {
  var result = new WeakMap();
  for (var tree of trees) {
    Searching_log.info('For a Root tree match', tree.sequence, 'we are finding wildcard leaves');
    for (var leaf of tree.leaves()) {
      if (leaf.getTag(wildcard_symbol)) {
        result.set(leaf.original, tree);
        Searching_log.info('Adding leaf', leaf.original.identifier, ' to tree mapping');
        if (leaf.parent) {
          result.set(leaf.parent.original, tree);
          Searching_log.info('Adding leaf parent', leaf.parent.original.identifier, ' to tree mapping');
        }
      }
    }
  }
  return result;
};
var wildcard_matcher = function wildcard_matcher(pattern, wildcard) {
  return wildcard.children.map(kid => {
    var new_sugar = kid.toSugar(pattern.constructor);
    new_sugar.linkage = wildcard.linkageOf(kid);
    new_sugar.parent_link = wildcard.parent ? wildcard.parent.linkageOf(wildcard) : 0;
    return new_sugar;
  });
};
var match_wildcard_paths = function match_wildcard_paths(sugar, pattern, comparator) {
  var wildcard_symbol = Symbol('wildcard');
  Searching_log.info('Wildcard matching', sugar.sequence, pattern.sequence);
  var wildcard_residues = pattern.composition().filter(res => res.identifier === '*');
  var wildcard_subtrees = wildcard_residues.map(wildcard_matcher.bind(null, pattern));
  var root_sugar = pattern.clone();
  root_sugar.composition().filter(res => res.identifier === '*').forEach(wildcard => {
    wildcard.children.map(kid => wildcard.removeChild(wildcard.linkageOf(kid), kid));
    wildcard.setTag(wildcard_symbol, true);
  });
  Searching_log.info('Root sugar for wildcard matching', root_sugar.sequence);
  Searching_log.info('We have', wildcard_subtrees.length, 'wildcard subtrees to ensure matches for');
  wildcard_subtrees.forEach(subtree_set => subtree_set.forEach(subtree => {
    var mono_class = subtree.constructor.Monosaccharide;
    var new_root = new mono_class('*');
    new_root.addChild(subtree.linkage, subtree.root);
    subtree.root = new_root;
    Searching_log.info('Wildcard subtree sequence:', subtree.sequence);
  }));
  var root_result = match_fixed_paths(sugar, root_sugar, comparator);

  // Get a set of subtrees for the matches
  // for the matched root
  var root_trees = flatten(root_result.map(root => {
    return sugar.trace(root_sugar, root, comparator);
  }));
  Searching_log.info('RESULTS from matching Root sugar, total of', root_trees.length, 'trees matched');
  root_trees.forEach(rt => {
    Searching_log.info('RESULT Root sugar match sequence', rt.sequence);
    var wildcard = rt.composition_for_tag(wildcard_symbol)[0];
    Searching_log.info('The residue acting as wildcard is', wildcard, 'with parent', wildcard.parent ? wildcard.parent.identifier : '(No root)');
  });
  // Grab the original leaves for the root match subtrees
  var root_trees_by_leaf_original = map_leaf_originals(root_trees, wildcard_symbol);
  var result = wildcard_subtrees.map(function subtree_set_filterer(subtree_set) {
    return subtree_set.map(function subtree_filter(subtree) {
      var roots = match_fixed_paths(sugar, subtree, comparator);
      Searching_log.info('For subtree', subtree.sequence, 'we matched roots', roots.map(r => r.identifier));
      Searching_log.info('We should be able to match each of these roots with a Root sugar match');
      roots = roots.filter(root => !root.parent || subtree.parent_link == 0 || root.parent.linkageOf(root) == subtree.parent_link).map(root => {
        Searching_log.info('The parents of ', root.identifier, root.parent, ' are being checked for being leaves of any root tree');
        var parents = [...sugar.residues_to_root(root)];
        for (var parent of parents) {
          if (root_trees_by_leaf_original.get(parent)) {
            return {
              root: root,
              parent_leaf: parent
            };
          }
        }
      }).filter(r => r);
      Searching_log.info('Number of subtrees that are a parent of a root match', roots.length);
      var result_trees = roots.map(root_pair => {
        var subtree_results = sugar.trace(subtree, root_pair.root, comparator);
        var traced_parent = root_trees_by_leaf_original.get(root_pair.parent_leaf);
        var wildcard_res = root_sugar.composition_for_tag(wildcard_symbol)[0];
        var grafted_results = [];
        Searching_log.info('Matched after tracing', subtree_results);
        for (var traced_subtree of subtree_results) {
          var result_tree = traced_parent.clone();
          var graft_residue = result_tree.composition_for_tag(wildcard_symbol)[0];
          traced_subtree.root.original = wildcard_res;
          if (graft_residue === result_tree.root) {
            result_tree.root = traced_subtree.root;
          } else {
            traced_subtree.root.copyTagsFrom(graft_residue);
            graft_residue.parent.replaceChild(graft_residue, traced_subtree.root, 0);
          }
          grafted_results.push(result_tree);
        }
        return grafted_results;
      });
      return flatten(result_trees);
    });
  });
  Searching_log.info('Found', flatten(flatten(result)).length, 'matching trees');
  return flatten(flatten(result));
};
class Searcher {
  static search(source, pattern, comparator) {
    if (pattern.composition().filter(res => res.identifier === '*').length > 0) {
      return this.search_wildcard_paths(source, pattern, comparator);
    }
    return this.search_fixed_paths(source, pattern, comparator);
  }
  static search_wildcard_paths(source, pattern, comparator) {
    return match_wildcard_paths(source, pattern, comparator);
  }
  static search_fixed_paths(source, pattern, comparator) {
    return match_fixed_paths(source, pattern, comparator);
  }
}
var cache_symbol = Symbol('cache_symbol');
var WILDCARD = {
  type: 'wildcard'
};
var FIXED = {
  type: 'fixed'
};
var COMPOSITION = {
  type: 'composition'
};
var TRACE = {
  type: 'trace'
};
function not_null(val) {
  return val !== null && typeof val !== 'undefined';
}
class CachingSearcher extends Searcher {
  static get Cache() {
    if (!this[cache_symbol]) {
      this[cache_symbol] = new js_TupleCache(); //MixedTupleMap();
    }
    return this[cache_symbol];
  }
  static search(source, pattern, comparator) {
    if (!Object.isFrozen(source) || !Object.isFrozen(pattern)) {
      return super.search(source, pattern, comparator);
    }
    if ([...source.composition_for_tag(SKIP_CACHE_TAG)].length > 0) {
      return super.search(source, pattern, comparator);
    }
    var source_tuple = [source, COMPOSITION];
    var pattern_tuple = [pattern, COMPOSITION];
    var pattern_composition = this.Cache.get(pattern_tuple);
    var source_composition = this.Cache.get(source_tuple);
    if (!source_composition) {
      source_composition = source.composition().map(res => res.identifier);
      this.Cache.set(source_tuple, source_composition);
    }
    if (!pattern_composition) {
      pattern_composition = pattern.composition().map(res => res.identifier);
      this.Cache.set(pattern_tuple, pattern_composition);
    }
    var composition_match = pattern_composition.every(res => res === '*' || not_null(source_composition.find(source_res => source_res === res)));
    if (!composition_match) {
      return [];
    }
    return super.search(source, pattern, comparator);
  }
  static search_wildcard_paths(source, pattern, comparator) {
    if (!Object.isFrozen(source) || !Object.isFrozen(pattern)) {
      return super.search_wildcard_paths(source, pattern, comparator);
    }
    if ([...source.composition_for_tag(SKIP_CACHE_TAG)].length > 0) {
      return super.search_wildcard_paths(source, pattern, comparator);
    }
    var tuple = [source, pattern, comparator, WILDCARD];
    if (this.Cache.has(tuple)) {
      return this.Cache.get(tuple);
    }
    this.Cache.set(tuple, super.search_wildcard_paths(source, pattern, comparator));
    return this.Cache.get(tuple);
  }
  static search_fixed_paths(source, pattern, comparator) {
    if (!Object.isFrozen(source) || !Object.isFrozen(pattern)) {
      return super.search_fixed_paths(source, pattern, comparator);
    }
    if ([...source.composition_for_tag(SKIP_CACHE_TAG)].length > 0) {
      return super.search_fixed_paths(source, pattern, comparator);
    }
    var tuple = [source, pattern, comparator, FIXED];
    if (this.Cache.has(tuple)) {
      return this.Cache.get(tuple);
    }
    this.Cache.set(tuple, super.search_fixed_paths(source, pattern, comparator));
    return this.Cache.get(tuple);
  }
}
var CacheTrace = (sugar, pattern, root, comparator) => {
  if (!Object.isFrozen(sugar) || !Object.isFrozen(pattern)) {
    return sugar.trace(pattern, root, comparator);
  }
  if ([...sugar.composition_for_tag(SKIP_CACHE_TAG)].length > 0) {
    return sugar.trace(pattern, root, comparator);
  }
  var tuple = [sugar, pattern, root, comparator, TRACE];
  var cache = CachingSearcher.Cache;
  if (!cache.has(tuple)) {
    cache.set(tuple, sugar.trace(pattern, root, comparator));
  }
  return cache.get(tuple).map(traced => traced.clone());
};

;// ./node_modules/glycan.js/js/residue_chords.js
var get_first_sibling = node => {
  var curr = node;
  while (curr.parent) {
    var curr_siblings = curr.parent.children;
    var next_sibling = curr_siblings[curr_siblings.indexOf(curr) + 1];
    if (next_sibling) {
      return next_sibling;
    } else {
      curr = curr.parent;
    }
  }
  return null;
};
var get_residue_pairs = function* get_residue_pairs(sugar) {
  var node_order = [...sugar.depth_first_traversal()];
  var curridx = 0;
  while (curridx < node_order.length) {
    var curr = node_order[curridx];
    var next_sibling = get_first_sibling(curr);
    if (!next_sibling) {
      next_sibling = curr;
    }
    var endidx = node_order.indexOf(next_sibling);
    var reducing_end_pairs = node_order.slice(curridx + 1, endidx);
    var nonreducing_pairs = node_order.slice(endidx === curridx ? endidx + 1 : endidx);
    if (endidx === curridx) {
      for (var res of nonreducing_pairs) {
        yield {
          root: curr,
          chord: [curr, res]
        };
      }
    } else {
      for (var _res of nonreducing_pairs) {
        yield {
          root: sugar.root,
          chord: [curr, _res]
        };
      }
      for (var _res2 of reducing_end_pairs) {
        yield {
          root: curr,
          chord: [curr, _res2]
        };
      }
    }
    curridx += 1;
  }
};
var expand_residue_chords_iterative = function* expand_residue_chords_iterative(sugar, n) {
  if (n < 2) {
    throw new Error('Cannot expand chord set when n < 2');
  }
  var chord_set = [...get_residue_pairs(sugar, 2)];
  var nextnode_pairs = chord_set.filter(chord => chord.root === sugar.root && chord.chord[0] !== sugar.root);
  var nextnodes = {};
  for (var pair of nextnode_pairs) {
    nextnodes[pair.chord[0]] = nextnodes[pair.chord[0]] || [];
    nextnodes[pair.chord[0]].push(pair.chord[1]);
  }
  var added = 0;
  for (var chord of chord_set) {
    yield chord;
  }
  while (added < n - 2 && chord_set.length > 0) {
    var new_chords = [];
    for (var _chord of chord_set) {
      for (var next_node of nextnodes[_chord.chord[_chord.chord.length - 1]] || []) {
        if (sugar.composition(_chord.root).indexOf(next_node) >= 0) {
          var new_chord = {
            root: _chord.root
          };
          new_chord.chord = _chord.chord.concat(next_node);
          yield new_chord;
          new_chords.push(new_chord);
        }
      }
    }
    chord_set = new_chords;
    added += 1;
  }
};
var get_residue_chords = function get_residue_chords(sugar) {
  var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  return function* () {
    if (n >= 1) {
      yield* sugar.depth_first_traversal(sugar.root, res => {
        return {
          root: sugar.root,
          chord: [res]
        };
      });
      yield* sugar.depth_first_traversal(sugar.root, res => {
        return res === sugar.root ? null : {
          root: res,
          chord: [res]
        };
      });
    }
    if (n >= 2) {
      yield* expand_residue_chords_iterative(sugar, n);
    }
  }();
};
/* harmony default export */ const residue_chords = (get_residue_chords);
;// ./node_modules/glycan.js/js/Sugar.js


function Sugar_slicedToArray(r, e) { return Sugar_arrayWithHoles(r) || Sugar_iterableToArrayLimit(r, e) || Sugar_unsupportedIterableToArray(r, e) || Sugar_nonIterableRest(); }
function Sugar_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function Sugar_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return Sugar_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Sugar_arrayLikeToArray(r, a) : void 0; } }
function Sugar_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function Sugar_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function Sugar_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
;




var root_symbol = Symbol('root');
var getPropertyDescriptor = function getPropertyDescriptor(object, descriptor) {
  var retval = null;
  while (!(retval = Object.getOwnPropertyDescriptor(object, descriptor)) && Object.getPrototypeOf(object)) {
    object = Object.getPrototypeOf(object);
  }
  return retval;
};
var Sugar_flatten = array => [].concat.apply([], array);
var Sugar_onlyUnique = function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
};
var has_tag = (tag, res) => res.getTag(tag);
var frozen_sequence_symbol = Symbol('frozen_sequence');
var frozen_composition_symbol = Symbol('frozen_composition');
var _find_repeat_unit_for_original = function find_repeat_unit_for_original(start, counter, original) {
  for (var child of start.children.filter(res => res instanceof Repeat.Monosaccharide)) {
    if (child.counter == counter && child.original == original) {
      return child;
    }
    if (child.counter > counter) {
      continue;
    }
    var child_result = _find_repeat_unit_for_original(child, counter, original);
    if (child_result) {
      return child_result;
    }
  }
};
class Sugar {
  constructor() {}
  set root(residue) {
    this[root_symbol] = residue;
  }
  get root() {
    return this[root_symbol];
  }
  static get Monosaccharide() {
    return Monosaccharide;
  }
  freeze() {
    var _this = this;
    for (var res of this.breadth_first_traversal()) {
      Object.freeze(res);
    }
    this[frozen_sequence_symbol] = this.sequence;
    this[frozen_composition_symbol] = this.composition();
    Object.defineProperty(this, 'composition', {
      value: function value() {
        var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.root;
        if (root === _this.root) {
          return _this[frozen_composition_symbol];
        } else {
          return _this.constructor.prototype.composition.call(_this, root);
        }
      }
    });
    Object.defineProperty(this, 'sequence', {
      get: () => this[frozen_sequence_symbol]
    });
    Object.freeze(this);
  }
  get repeats() {
    var repeat_residues = this.composition(this.root).filter(res => res instanceof Repeat.Monosaccharide);
    return repeat_residues.map(res => res.repeat).filter((o, i, a) => a.indexOf(o) === i);
  }
  paths() {
    var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.root;
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.leaves(root);
    var self = this;
    return [].concat(start).map(leaf => Array.from(self.residues_to_root(leaf)));
  }
  leaves() {
    var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.root;
    return this.composition(root).filter(mono => mono.children.length === 0);
  }
  locate_monosaccharide(location) {
    var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.root;
    var _location$match = location.match(/[a-zA-Z]+|[0-9]+/g),
      _location$match2 = Sugar_slicedToArray(_location$match, 3),
      depth = _location$match2[1],
      branch = _location$match2[2];
    depth = parseInt(depth);
    branch = branch.charCodeAt(0) - 'a'.charCodeAt(0);
    var depth_residues = this.paths(root).map(path => path.reverse()[depth - 1]).filter(residue => residue).filter(Sugar_onlyUnique);
    if (depth_residues.length == 1 && depth_residues[0] === root) {
      return root;
    }
    return depth_residues[branch];
  }
  location_for_monosaccharide(residue) {
    var depth_siblings = [...this.breadth_first_traversal()].filter(res => res.depth === residue.depth);
    var branch_position = depth_siblings.indexOf(residue);
    return 'y' + residue.depth + String.fromCharCode('a'.charCodeAt(0) + branch_position);
  }

  // FIXME to use a well defined traversal alogirthm (DFS or BFS)
  composition() {
    var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.root;
    var self = this;
    if (!root) {
      return [];
    }
    var return_value = [[root]].concat(root.children.map(child => self.composition(child)));
    return return_value.reduce((a, b) => a.concat(b));
  }
  composition_for_tag(tag) {
    return this.composition().filter(has_tag.bind(null, tag));
  }
  clone(visitor) {
    var cloned = new WeakMap();
    var cloned_repeats = new WeakMap();
    var nodes = this.breadth_first_traversal(this.root, visitor);
    for (var node of nodes) {
      // When we are cloning, we are going to delegate the generation
      // of clones of repeat residues to the Repeat class, so we should
      // only clone the root of the repeat unit

      if (node instanceof Repeat.Monosaccharide && node.repeat.root !== node) {
        continue;
      }
      if (!cloned.has(node)) {
        cloned.set(node, node.clone());
      }
      var node_clone = cloned.get(node);

      // If this is the repeat root (the only time the code should reach this point)
      // we should set the clone residue to be the root of the repeat that
      // we generate when we do the cloning

      if (node_clone instanceof Repeat.Monosaccharide) {
        cloned_repeats.set(node.repeat, node_clone.repeat);
        cloned.set(node, node_clone.repeat.root);
        node_clone = cloned.get(node);
      }

      // If this is a child of a repeat, and this is a child at the end of the repeat
      // we should add them to the end of the new clone repeat

      if (node.parent instanceof Repeat.Monosaccharide && node.parent.repeat.children.indexOf(node) >= 0) {
        var repeat = cloned_repeats.get(node.parent.repeat);

        // We add the residue to a placeholder residue
        // so that there's a way to graft this residue and read
        // the linkage

        var res = new Monosaccharide('Root');
        res.addChild(node.parent.linkageOf(node), node_clone);
        repeat.children = repeat.children.concat(node_clone);
        continue;
      }

      // Add this child onto the parent
      if (node.parent && cloned.get(node.parent)) {
        cloned.get(node.parent).addChild(node.parent.linkageOf(node), node_clone);
        cloned.get(node.parent).balance();
      } else {
        // In the case where the parent is a repeat monosaccharide, and the
        // parent hasn't been cloned yet, we should look for the corresponding
        // repeat unit based on counter and the original monosaccharide

        if (node.parent && node.parent instanceof Repeat.Monosaccharide) {
          var new_repeat = cloned_repeats.get(node.parent.repeat);
          var _res = _find_repeat_unit_for_original(new_repeat.root, node.parent.counter, node.parent.original);
          _res.addChild(node.parent.linkageOf(node), node_clone);
          _res.balance();
        }
      }
    }
    var new_sugar = new this.constructor();
    new_sugar.root = cloned.get(this.root);
    return new_sugar;
  }
  match_sugar_pattern(pattern, comparator) {
    var return_roots = CachingSearcher.search(this, pattern, comparator);
    if (pattern.composition().map(res => res.identifier).filter(id => id === '*').length > 0) {
      return return_roots;
    }
    var return_sugars = Sugar_flatten(return_roots.map(root => CacheTrace(this, pattern, root, comparator)));
    return return_sugars;
  }
  trace(template) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.root;
    var comparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (a, b) =>  true || 0;
    return Tracer.trace(this, start, template, comparator);
  }
  breadth_first_traversal() {
    var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.root;
    var visitor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x => x;
    return function* () {
      if (!start) {
        return;
      }
      var queue = [];
      queue.push(start);
      while (queue.length > 0) {
        var curr = queue.shift();
        queue = queue.concat(curr.children);
        if (visitor) {
          curr = visitor(curr);
        }
        if (curr) {
          yield curr;
        }
      }
    }();
  }
  depth_first_traversal() {
    var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.root;
    var visitor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x => x;
    return function* () {
      if (!start) {
        return;
      }
      var stack = [];
      stack.push(start);
      while (stack.length > 0) {
        var curr = stack.shift();
        var children = curr.children;
        stack = children.concat(stack);
        var visited = visitor ? visitor(curr) : curr;
        if (visited) {
          yield visited;
        }
      }
    }();
  }
  chords() {
    var _this2 = this;
    var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
    return function* () {
      yield* residue_chords(_this2, n);
    }();
  }

  // Math functions
  // FIXME - Union - Create a union sugar from two sugars
  // FIXME - Subtract - Get residues that aren't common

  residues_to_root() {
    var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.root;
    return function* () {
      yield start;
      while (start.parent) {
        start = start.parent;
        yield start;
      }
    }();
  }
  static CopyIO(sugar) {
    // We want to copy the IO methods from
    // the given object, and apply them
    // to the current class (using an anonymous
    // class to deliver the functionality)
    var base = this;
    var parser_function = getPropertyDescriptor(sugar, 'sequence').set;
    var writer_function = getPropertyDescriptor(sugar, 'sequence').get;
    return class extends base {
      get sequence() {
        return writer_function.call(this);
      }
      set sequence(sequence) {
        parser_function.call(this, sequence);
      }
    };
  }
}
;// ./node_modules/glycan.js/js/Epimerisation.js

var epimerised_identifier_symbol = Symbol('epimerised_identifier');
var original_residue_symbol = Symbol('original');
var Epimerisation_noop = () => {};
var epimerisation_status = new WeakMap();
class EpimerisableMonosaccharide extends Monosaccharide {
  constructor(original, identifier) {
    var epimerised = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    super(identifier);
    this[original_residue_symbol] = original;
    this[epimerised_identifier_symbol] = identifier;
    epimerisation_status.set(this, epimerised);
  }
  get identifier() {
    return this.epimerised ? this[epimerised_identifier_symbol] : this[original_residue_symbol].identifier;
  }
  get epimerised() {
    return epimerisation_status.get(this);
  }
  disable() {
    epimerisation_status.set(this, false);
  }
  enable() {
    epimerisation_status.set(this, true);
  }
  get anomer() {
    return this[original_residue_symbol].anomer;
  }
  get parent_linkage() {
    return this[original_residue_symbol].parent_linkage;
  }
  set anomer(ignore) {
    Epimerisation_noop(ignore);
  }
  set parent_linkage(ignore) {
    Epimerisation_noop(ignore);
  }
  set identifier(ignore) {
    Epimerisation_noop(ignore);
  }
  clone() {
    var cloned = new this.constructor(this[original_residue_symbol], this[epimerised_identifier_symbol], this.epimerised);
    cloned.copyTagsFrom(this);
    return cloned;
  }
}

;// ./node_modules/glycan.js/js/ReactionSet.js





var reactions = Symbol('reactions');
var reactionset = Symbol('reactionset');
var ReactionSet_module_string = 'glycanjs:reactionset';
var ReactionSet_log = debugAny(ReactionSet_module_string);
var EPIMERISED_TAG = Symbol('has_been_epimerised');
var clean_tags = tag => {
  return res => res.setTag(tag, null);
};
var not_in_array = array => {
  return el => array.indexOf(el) < 0;
};
var ReactionSet_only_unique = (v, i, s) => s.indexOf(v) === i;
var match_root_original = res => {
  return tree => tree.root.original === res;
};
var identifier_comparator = (a, b) => {
  if (a.getTag(EPIMERISED_TAG) === b.identifier) {
    return true;
  }
  if (b.getTag(EPIMERISED_TAG) === a.identifier) {
    return true;
  }
  return a.identifier === b.identifier;
};
var comparator = (a, b) => {
  if (!a || !b) {
    return false;
  }
  if (a.identifier === '*' || b.identifier === '*') {
    return true;
  }
  var same_id = identifier_comparator(a, b);
  var same_linkage = false;
  var same_anomer = false;
  if (a.parent && b.parent) {
    if (a.parent.linkageOf(a) === 0 || b.parent.linkageOf(b) === 0) {
      same_linkage = true;
    } else {
      same_linkage = a.parent.linkageOf(a) === b.parent.linkageOf(b);
    }
    if (a.anomer === b.anomer || a.anomer === 'u' || b.anomer === 'u') {
      same_anomer = true;
    }
  }
  if (!a.parent && !b.parent) {
    same_linkage = true;
    same_anomer = true;
  }
  return same_id && same_linkage && same_anomer;
};
var filter_with_delta = function filter_with_delta(attachments, sugar) {
  var delta = this.delta;
  var matched_attachments = attachments.map(res => {
    var trees = CacheTrace(sugar, delta, res, comparator);
    trees = trees.filter(match_root_original(res));
    return trees;
  }).filter(trace_result => trace_result.length > 0);
  return matched_attachments;
};
var find_sugar_substrates = function find_sugar_substrates(sugar) {
  var cacheKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var result_attachments = [];
  for (var reaction of this.positive) {
    var current_attachment = Symbol('curr_attachment');
    reaction.tagSubstrateResidues(sugar, current_attachment, cacheKey);
    var attachments = sugar.composition_for_tag(current_attachment);
    attachments.forEach(clean_tags(current_attachment));
    result_attachments = result_attachments.concat(attachments);
  }
  if (result_attachments.length < 1) {
    return result_attachments;
  }
  for (var _reaction of this.negative) {
    var _current_attachment = Symbol('curr_attachment');
    _reaction.tagSubstrateResidues(sugar, _current_attachment, cacheKey);
    var _attachments = sugar.composition_for_tag(_current_attachment);
    _attachments.forEach(clean_tags(_current_attachment));
    result_attachments = result_attachments.filter(not_in_array(_attachments));
    if (result_attachments.length < 1) {
      return result_attachments;
    }
  }
  return result_attachments;
};
class ReactionSet {
  constructor() {
    this[reactions] = [];
  }
  get delta() {
    return this.positive[0].delta;
  }
  get positive() {
    return this[reactions].filter(reac => !reac.negative);
  }
  get negative() {
    return this[reactions].filter(reac => reac.negative);
  }
  addReactionRule(reaction) {
    this[reactions].push(reaction);
  }
  tagSubstrateResidues(sugar) {
    var tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Symbol('substrate');
    var cacheKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    for (var residue of find_sugar_substrates.call(this, sugar, cacheKey)) {
      residue.setTag(tag);
    }
    return tag;
  }
  tagAvailableSubstrateResidues(sugar) {
    var tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Symbol('substrate');
    var attachments = find_sugar_substrates.call(this, sugar);
    var unavailable = filter_with_delta.call(this, attachments, sugar);
    unavailable = [].concat.apply([], unavailable);
    unavailable = unavailable.map(tree => tree.root.original);
    var available = attachments.filter(res => unavailable.indexOf(res) < 0);
    for (var residue of available) {
      if (!residue.parent && residue.children.length > 0 && residue.linkageOf(residue.children[0]) < 0) {
        continue;
      }
      residue.setTag(tag);
    }
    return tag;
  }
  worksOn(sugar) {
    return find_sugar_substrates.call(this, sugar).length > 0;
  }
  execute() {}
  generate() {}
}
var create_reaction = (reaction_class, cache, reac) => {
  if (reac.length < 1) {
    return;
  }
  var set = new ReactionSet();
  for (var seq of reac) {
    var reac_obj = null;
    if (cache.has(seq)) {
      reac_obj = cache.get(seq);
    } else {
      reac_obj = new reaction_class();
      reac_obj.sequence = seq;
      cache.set(seq, reac_obj);
    }
    set.addReactionRule(reac_obj);
  }
  return set;
};
function getAllSupportedActions(sugar, reactions) {
  var possible_linkages = [];
  var possible_anomers = [];
  var possible_donors = [];
  var _loop = function _loop() {
    var substrates = sugar.composition_for_tag(reaction.tagAvailableSubstrateResidues(sugar));
    if (substrates.length > 0) {
      var donor_res = reaction.delta.root.children[0];
      var reac_linkage = reaction.delta.root.linkageOf(donor_res);
      if (!substrates.some(res => res.childAt(reac_linkage) === undefined)) {
        return 1; // continue
      }
      var donor_seq = reaction.delta.root.identifier !== 'Root' ? reaction.delta.sequence : donor_res.toSugar(reaction.delta.constructor).sequence;
      possible_linkages.push(reac_linkage);
      possible_donors.push(donor_seq);
      possible_anomers.push(donor_res.anomer);
    }
  };
  for (var reaction of reactions) {
    if (_loop()) continue;
  }
  possible_anomers = possible_anomers.filter(ReactionSet_only_unique);
  possible_linkages = possible_linkages.filter(ReactionSet_only_unique);
  possible_donors = possible_donors.filter(ReactionSet_only_unique);
  return {
    anomer: possible_anomers,
    linkage: possible_linkages,
    donor: possible_donors,
    substrate: []
  };
}
var reaction_cache = new Map();
class ReactionGroup {
  constructor() {
    this[reactionset] = [];
  }
  static groupFromJSON(json, sugarclass) {
    var epimerases = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var reaction_group = new this();
    var reaction_class = js_Reaction.CopyIO(new sugarclass());
    var genes = Object.keys(json);
    genes = epimerases.filter(gene => genes.indexOf(gene) >= 0).concat(genes.filter(gene => epimerases.indexOf(gene) < 0));
    for (var gene of genes) {
      if (json[gene].reactions.length > 0) {
        for (var set of json[gene].reactions.map(create_reaction.bind(null, reaction_class, reaction_cache))) {
          if (set) {
            reaction_group.addReactionSet(set);
          }
        }
      }
    }
    return reaction_group;
  }
  get reactions() {
    return this[reactionset];
  }
  addReactionSet(reaction) {
    if (this[reactionset].indexOf(reaction) < 0) {
      this[reactionset].push(reaction);
    }
    return reaction;
  }
  tagSubstrateResidues(sugar) {
    var reactions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.reactions;
    var tag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Symbol('substrate');
    var cacheKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    for (var reaction of reactions) {
      reaction.tagSubstrateResidues(sugar, tag, cacheKey = null);
    }
    return tag;
  }
  tagAvailableSubstrateResidues(sugar) {
    var reactions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.reactions;
    var tag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Symbol('substrate');
    for (var reaction of reactions) {
      reaction.tagAvailableSubstrateResidues(sugar, tag);
    }
    return tag;
  }

  /* What possible linkages can be made on this sugar at the 
     given sugar, donor, linkage and substrate
   */

  supportsLinkageAt(sugar, donor, linkage, substrate) {
    var reactions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this.reactions;
    if (!donor) {
      return getAllSupportedActions(sugar, reactions);
    }
    var possible_linkages = [];
    var possible_anomers = [];
    var possible_donors = [];
    var donor_filtered = this.reactions.filter(reaction => {
      var donor_res = reaction.delta.root.children[0];
      if (!donor_res) {
        return false;
      }
      var donor_seq = donor_res.toSugar(reaction.delta.constructor).sequence;
      var reac_linkage = reaction.delta.root.linkageOf(donor_res);
      var matching_donor = !donor || donor_seq === donor;
      return matching_donor;
    });
    var possible_substrates_for_reaction = new WeakMap();
    donor_filtered.forEach(reaction => {
      var substrates = sugar.composition_for_tag(reaction.tagAvailableSubstrateResidues(sugar));
      if (substrates.length > 0) {
        var donor_res = reaction.delta.root.children[0];
        var reac_linkage = reaction.delta.root.linkageOf(donor_res);
        var free_substrate_children = substrates.filter(res => res.childAt(reac_linkage) === undefined);
        possible_substrates_for_reaction.set(reaction, free_substrate_children);
        if (free_substrate_children.length > 0) {
          possible_linkages.push(reac_linkage);
          possible_anomers.push(donor_res.anomer);
        }
      }
    });
    var used_linkage_filtered = donor_filtered.filter(reac => (possible_substrates_for_reaction.get(reac) || []).length > 0);
    var filtered_reactions = used_linkage_filtered;
    possible_anomers = possible_anomers.filter(ReactionSet_only_unique);
    possible_linkages = possible_linkages.filter(ReactionSet_only_unique);
    ReactionSet_log.info("Remaining reactions after filtering by donor ".concat(donor_filtered.length));
    ReactionSet_log.info("Remaining reactions after filtering by used_linakge ".concat(used_linkage_filtered.length));

    // If there isn't a linkage specified - what are the possible
    // linkages that this reaction set supports

    if (used_linkage_filtered.length < 1 || typeof linkage === 'undefined' && typeof substrate === 'undefined') {
      var substrates = used_linkage_filtered.map(reac => possible_substrates_for_reaction.get(reac)).flat().filter(ReactionSet_only_unique);
      return used_linkage_filtered.length > 0 ? {
        anomer: possible_anomers,
        linkage: possible_linkages,
        substrate: substrates
      } : {
        anomer: [],
        linkage: [],
        substrate: []
      };
    }

    // If there is a linkage - filter the reactions down to the
    // reactions that support the linkage we want

    if (typeof linkage !== 'undefined') {
      var linkage_filtered = filtered_reactions.filter(reaction => {
        var donor_res = reaction.delta.root.children[0];
        var reac_linkage = reaction.delta.root.linkageOf(donor_res);
        return reac_linkage === 0 || reac_linkage === linkage;
      });
      filtered_reactions = linkage_filtered;
      ReactionSet_log.info("Remaining reactions after filtering by linkage ".concat(linkage_filtered.length));
      if (linkage_filtered.length < 1) {
        return linkage_filtered.length > 0 ? {
          anomer: possible_anomers,
          linkage: [linkage],
          substrate: []
        } : {
          anomer: [],
          linkage: [],
          substrate: []
        };
      }
    }
    if (substrate) {
      possible_linkages = [];
      possible_anomers = [];
    }
    var possible_anomer_linkages = [];
    for (var reaction of filtered_reactions) {
      var _substrates = possible_substrates_for_reaction.get(reaction);
      if (_substrates.indexOf(substrate) >= 0) {
        var donor_res = reaction.delta.root.children[0];
        var reac_linkage = reaction.delta.root.linkageOf(donor_res);
        possible_linkages.push(reac_linkage);
        possible_anomers.push(donor_res.anomer);
        possible_anomer_linkages.push(donor_res.anomer + reac_linkage);
      }
    }
    possible_anomers = possible_anomers.filter(ReactionSet_only_unique);
    possible_linkages = possible_linkages.filter(ReactionSet_only_unique);
    if (possible_linkages.length > 0 && possible_anomers.length > 0 && substrate) {
      return {
        anomer: possible_anomers,
        linkage: possible_linkages,
        anomerlinks: possible_anomer_linkages,
        substrate: [substrate]
      };
    } else {
      return {
        anomer: possible_anomers,
        linkage: possible_linkages,
        substrate: []
      };
    }
  }
  supportLinkages(sugar) {
    var reactions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.reactions;
    var with_support = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Symbol('with_support');
    var cacheKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var symbol_map = new WeakMap();
    for (var to_reset of sugar.composition_for_tag(EPIMERISED_TAG)) {
      to_reset.setTag(EPIMERISED_TAG, null);
      to_reset.setTag(SKIP_CACHE_TAG, null);
    }
    for (var reaction of reactions) {
      if (!symbol_map.has(reaction)) {
        symbol_map.set(reaction, {
          substrate: Symbol('substrate'),
          residue: Symbol('residue')
        });
      }
      var is_epimerisation_reaction = false;
      if (reaction instanceof ReactionSet) {
        for (var single_reaction of reaction.positive) {
          var epimerisable = single_reaction.composition().filter(res => res instanceof EpimerisableMonosaccharide);
          if (epimerisable.length > 0) {
            is_epimerisation_reaction = true;
            single_reaction.delta.root.setTag(EPIMERISED_TAG, epimerisable[0].identifier);
          }
          epimerisable.forEach(res => {
            res.enable();
          });
        }
      }
      reaction.tagSubstrateResidues(sugar, symbol_map.get(reaction).substrate, cacheKey);
      if (reaction instanceof ReactionSet) {
        for (var _single_reaction of reaction.positive) {
          var _epimerisable = _single_reaction.composition().filter(res => res instanceof EpimerisableMonosaccharide);
          _epimerisable.forEach(res => res.disable());
        }
      }
      var attachments = sugar.composition_for_tag(symbol_map.get(reaction).substrate);
      var trees = filter_with_delta.call(reaction, attachments, sugar);
      var supported = trees.map(tree => {
        var tree_root = tree[0];
        var part_supported = tree_root.composition(tree_root.root.children[0]);
        return part_supported.map(res => res.original);
      });
      if (is_epimerisation_reaction) {
        for (var tree of trees.flat()) {
          for (var epimerised of tree.composition_for_tag(EPIMERISED_TAG)) {
            epimerised.original.setTag(EPIMERISED_TAG, epimerised.getTag(EPIMERISED_TAG));
            epimerised.original.setTag(SKIP_CACHE_TAG, true);
          }
        }
      }
      for (var residue of [].concat.apply([], supported)) {
        if (residue.getTag(EPIMERISED_TAG) && is_epimerisation_reaction) {
          // We should skip supporting this specific residue because it's
          // only an epimerisation reaction, and not telling us anything
          // about the original residue
          continue;
        }
        residue.setTag(symbol_map.get(reaction).residue);
        residue.setTag(with_support);
      }
    }
    this.map = symbol_map;
    return with_support;
  }
}

;// ./node_modules/glycan.js/js/Reaction.js
function Reaction_slicedToArray(r, e) { return Reaction_arrayWithHoles(r) || Reaction_iterableToArrayLimit(r, e) || Reaction_unsupportedIterableToArray(r, e) || Reaction_nonIterableRest(); }
function Reaction_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function Reaction_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return Reaction_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Reaction_arrayLikeToArray(r, a) : void 0; } }
function Reaction_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function Reaction_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function Reaction_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
;



var comment_symbol = Symbol('comment_string');
var negative_symbol = Symbol('is_negative');
var reaction_sugar = Symbol('reaction_sugar');
var reaction_position = Symbol('reaction_position');
var reaction_position_string = Symbol('reaction_position_string');
var validate_location = (sugar, location) => sugar.locate_monosaccharide(location);
var SEQUENCE_CACHEKEY = Symbol('Sequence Cache');

// We rewrite the sequence to
// get rid of the placeholder Root
// root monosaccharide.

var rewrite_sequence = base => {
  return class extends base {
    get sequence() {
      var seq = super.sequence;
      return seq.replace(/Root/, '');
    }
    set sequence(seq) {
      super.sequence = seq;
      return;
    }
  };
};
var parseReaction = sugar => {
  var comment = sugar[comment_symbol];
  var negative_flag = false;
  if (comment.indexOf('!') === 0) {
    comment = comment.substring(1);
    negative_flag = true;
  }
  var _comment$split = comment.split('@'),
    _comment$split2 = Reaction_slicedToArray(_comment$split, 2),
    subseq = _comment$split2[0],
    location = _comment$split2[1];
  subseq = subseq.replace(/[{}]/g, '');
  var minimal_subclass = class extends Sugar {
    static get Monosaccharide() {
      return sugar.constructor.Monosaccharide;
    }
  };
  var reaction_class = rewrite_sequence(minimal_subclass.CopyIO(sugar));
  var subsugar = new reaction_class();
  sugar[negative_symbol] = negative_flag;
  subsugar.sequence = subseq;
  sugar[reaction_sugar] = subsugar;
  sugar[reaction_position] = validate_location(sugar, location);
  if (!sugar[reaction_position]) {
    throw new Error('Cannot locate attachment point');
  }
  if (subsugar.root.identifier !== 'Root') {
    var attachment = sugar[reaction_position];
    var epimierisable = new EpimerisableMonosaccharide(attachment, subsugar.root.identifier, false);
    attachment.donateChildrenTo(epimierisable);
    epimierisable.copyTagsFrom(attachment);
    if (attachment.parent) {
      attachment.parent.replaceChild(attachment, epimierisable);
    } else {
      sugar.root = epimierisable;
    }
    sugar[reaction_position] = epimierisable;
  }
  sugar[reaction_position_string] = location;
  sugar.attachment_tag = Symbol('attachment');
  sugar[reaction_position].setTag(sugar.attachment_tag);
};
var Reaction_cache_symbol = Symbol('search_cache');
var find_sugar_substrates_caches = new Map();
var Reaction_find_sugar_substrates = function find_sugar_substrates(sugar, cacheKey) {
  var sugar_caches;
  var sugar_cache;
  var use_seqs = cacheKey === SEQUENCE_CACHEKEY;
  if (cacheKey) {
    if (!find_sugar_substrates_caches.has(cacheKey)) {
      sugar_caches = use_seqs ? new Map() : new WeakMap();
      find_sugar_substrates_caches.set(cacheKey, sugar_caches);
    } else {
      sugar_caches = find_sugar_substrates_caches.get(cacheKey);
    }
    sugar_cache = sugar_caches.get(use_seqs ? sugar.sequence : sugar);
    if (!sugar_cache) {
      sugar_cache = new Map();
      sugar_caches.set(use_seqs ? sugar.sequence : sugar, sugar_cache);
    }
  }
  var is_epimerase = this.composition().some(res => res instanceof EpimerisableMonosaccharide);
  var cache_lookup_key = this.sequence + this[reaction_position_string];
  var cache_hit = sugar_cache ? sugar_cache.has(cache_lookup_key) : false;
  var results = sugar_cache ? sugar_cache.has(cache_lookup_key) ? sugar_cache.get(cache_lookup_key) : null : null;

  // The attachment tag is part of the reaction
  if (!results) {
    var substrates = sugar.match_sugar_pattern(this, comparator) || [];
    results = substrates.map(match => {
      var first_tagged = match.composition_for_tag(this.attachment_tag)[0];
      if (!first_tagged) {
        return;
      }
      return first_tagged.original;
    }).filter(r => r);
    if (sugar_cache && (!is_epimerase || results.length == 0)) {
      if (use_seqs) {
        sugar_cache.set(cache_lookup_key, results.map(res => sugar.location_for_monosaccharide(res)));
      } else {
        sugar_cache.set(cache_lookup_key, results);
      }
    }
  }
  if (use_seqs && results[0] && typeof results[0] === 'string') {
    results = results.map(pos => sugar.locate_monosaccharide(pos));
  }
  return results;
};
var execute = function execute(sugar, residue) {
  var all_locations;
  if (!residue) {
    all_locations = [...Reaction_find_sugar_substrates.call(this, sugar)].map(res => sugar.location_for_monosaccharide(res));
  } else {
    all_locations = [sugar.location_for_monosaccharide(residue)];
  }
  var added = new Set();
  for (var attachment_location of all_locations) {
    var attachment = sugar.locate_monosaccharide(attachment_location);
    var addition = this[reaction_sugar].clone();
    if (addition.root.identifier !== 'Root') {
      var epimierisable = new EpimerisableMonosaccharide(attachment, addition.root.identifier, true);
      if (attachment instanceof Repeat.Monosaccharide && attachment.repeat.mode == Repeat.MODE_MINIMAL && !(attachment.parent instanceof Repeat.Monosaccharide)) {
        // Special case starting repeat
        var current_parent = attachment.parent;
        var current_repeat = attachment.repeat;
        attachment.original.donateChildrenTo(epimierisable);
        current_repeat.template.root.parent.replaceChild(attachment.original, epimierisable);
        current_repeat.template.root = epimierisable;
        current_parent.replaceChild(attachment, current_repeat.root);
        attachment = epimierisable;
        added.add(epimierisable);
        for (var kid of addition.root.children) {
          attachment.graft(kid);
          [...addition.composition(kid)].forEach(added.add, added);
        }
        var cloned = current_repeat.clone();
        cloned.children = current_repeat.children;
        current_repeat.root.parent.replaceChild(current_repeat.root, cloned.root);
      } else {
        for (var _kid of addition.root.children) {
          attachment.graft(_kid);
          [...addition.composition(_kid)].forEach(added.add, added);
        }
        attachment.donateChildrenTo(epimierisable);
        epimierisable.copyTagsFrom(attachment);
        attachment = sugar.locate_monosaccharide(attachment_location);
        if (attachment !== sugar.root) {
          attachment.parent.replaceChild(attachment, epimierisable);
        } else {
          sugar.root = epimierisable;
          attachment = epimierisable;
        }
        added.add(epimierisable);
      }
    } else {
      if (attachment instanceof Repeat.Monosaccharide && attachment.repeat.mode == Repeat.MODE_MINIMAL) {
        attachment = attachment.original;
      }

      // Simple addition of residues

      for (var _kid2 of addition.root.children) {
        attachment.graft(_kid2);
        [...addition.composition(_kid2)].forEach(added.add, added);
      }
    }
  }
  return [...added];
};
var execute_all = function execute_all(sugar) {
  var results = [];
  var attach_symbol = Symbol('attach');
  for (var attachment of Reaction_find_sugar_substrates.call(this, sugar)) {
    var addition = this[reaction_sugar].clone();
    attachment.setTag(attach_symbol, true);
    var new_sugar = sugar.clone();
    var new_attachment = new_sugar.composition_for_tag(attach_symbol)[0];
    for (var kid of addition.root.children) {
      new_attachment.graft(kid);
    }
    attachment.setTag(attach_symbol, null);
    new_attachment.setTag(attach_symbol, null);
    results.push(new_sugar);
  }
  return results;
};
var filter_delta_exists = function filter_delta_exists(attachments, sugar) {
  var delta = this.delta;
  var unmatched_attachments = attachments.filter(res => {
    return sugar.trace(delta, res, comparator).length == 0;
  });
  return unmatched_attachments;
};
class Reaction extends Sugar {
  set comment(comment) {
    this[comment_symbol] = comment;
    parseReaction(this);
    this.freeze();
    this.delta.freeze();
  }
  get comment() {
    if (this.delta) {
      return undefined;
    }
    return this[comment_symbol];
  }
  get delta() {
    return this[reaction_sugar];
  }
  get negative() {
    return this[negative_symbol];
  }

  // Move to a container class with positive and negative assertions
  tagSubstrateResidues(sugar) {
    var tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Symbol('substrate');
    var cacheKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var test_result = Reaction_find_sugar_substrates.call(this, sugar, cacheKey);
    if (this.negative) {
      var without_delta = filter_delta_exists.call(this, test_result, sugar);
      test_result = test_result.filter(res => without_delta.indexOf(res) < 0);
    }
    test_result.forEach(res => res.setTag(tag));
    return tag;
  }
  tagAvailableSubstrateResidues(sugar) {
    var tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Symbol('substrate');
    var test_result = Reaction_find_sugar_substrates.call(this, sugar);
    var without_delta = filter_delta_exists.call(this, test_result, sugar);
    test_result = test_result.filter(res => without_delta.indexOf(res) < 0);
    test_result.forEach(res => res.setTag(tag));
    return tag;
  }
  worksOn(sugar) {
    var test_result = Reaction_find_sugar_substrates.call(this, sugar);
    if (test_result.length < 1) {
      return this.negative || false;
    }
    if (this.negative) {
      var unmatched_attachments = filter_delta_exists.call(this, test_result, sugar);
      return unmatched_attachments.length > 0;
    } else {
      return true;
    }
  }

  // Move to a container class with positive and negative assertions
  execute(sugar, residue) {
    return execute.call(this, sugar, residue);
  }
  generate(sugar) {
    return execute_all.call(this, sugar);
  }
}
Reaction.Comparator = comparator;
/* harmony default export */ const js_Reaction = (Reaction);

;// ./node_modules/glycan.js/js/io/CondensedIupac.js
function CondensedIupac_slicedToArray(r, e) { return CondensedIupac_arrayWithHoles(r) || CondensedIupac_iterableToArrayLimit(r, e) || CondensedIupac_unsupportedIterableToArray(r, e) || CondensedIupac_nonIterableRest(); }
function CondensedIupac_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function CondensedIupac_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return CondensedIupac_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? CondensedIupac_arrayLikeToArray(r, a) : void 0; } }
function CondensedIupac_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function CondensedIupac_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function CondensedIupac_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
;



// Map alternative identifier strings to canonical MONOSACCHARIDE values so
// that sequences from sources such as Glygen (which uses Neu5Ac/Neu5Gc) are
// recognised without requiring a separate conversion step.
var IDENTIFIER_ALIASES = {
  'Neu5Ac': MONOSACCHARIDE.NeuAc,
  'Neu5Gc': MONOSACCHARIDE.NeuGc,
  'Neu5Ac9Ac': MONOSACCHARIDE.NeuAc9Ac,
  'Neu5Gc9Ac': MONOSACCHARIDE.NeuGc9Ac
};

// The reducing end's own linkage, open to the aglycone, as GlyGen and
// GlyTouCan write it ("...GlcNAc(b1-"). Without this the root was read as one
// unknown residue "GlcNAc(b1-". Read as the root's anomer; the root has no
// parent, so the sequence is written without it.
var OPEN_REDUCING_END_RE = /\(([abu?])[0-9?]-$/;

// Sulfate position digit extracted from shorthands like GlcNAc6S, GalNAc4S.
// Only positions 3, 4 and 6 are recognised.
var SULFATE_RE = /^(.+?)([346])S$/;
var follow_bold_branch, create_bold_tree;
var write_link = link => {
  if (link < 0) {
    if (link === Monosaccharide.LINKAGES.O) {
      return 'O';
    }
    if (link === Monosaccharide.LINKAGES.N) {
      return 'N';
    }
  }
  return link <= 0 ? '?' : '' + link;
};
var parse_link = link_string => {
  if (Monosaccharide.LINKAGES[link_string]) {
    return Monosaccharide.LINKAGES[link_string];
  }
  return link_string == '?' ? 0 : parseInt(link_string);
};
var get_monosaccharide = (sugar, proto) => {
  var _IDENTIFIER_ALIASES$p;
  var mono_class = sugar.constructor.Monosaccharide;

  // Check for sulfate position shorthand before alias resolution,
  // e.g. GlcNAc6S → GlcNAc with HSO3 child at position 6.
  var sulfateMatch = proto.match(SULFATE_RE);
  if (sulfateMatch) {
    var _IDENTIFIER_ALIASES$s;
    var baseId = (_IDENTIFIER_ALIASES$s = IDENTIFIER_ALIASES[sulfateMatch[1]]) !== null && _IDENTIFIER_ALIASES$s !== void 0 ? _IDENTIFIER_ALIASES$s : sulfateMatch[1];
    var sulfPos = parseInt(sulfateMatch[2]);
    var mono = new mono_class(baseId);
    var hso3 = new mono_class(MONOSACCHARIDE.HSO3);
    hso3.anomer = 'u';
    hso3.parent_linkage = 0; // unknown; written as '?'
    mono.addChild(sulfPos, hso3);
    return mono;
  }

  // Apply identifier alias (e.g. Neu5Ac → NeuAc).
  var canonical = (_IDENTIFIER_ALIASES$p = IDENTIFIER_ALIASES[proto]) !== null && _IDENTIFIER_ALIASES$p !== void 0 ? _IDENTIFIER_ALIASES$p : proto;
  return new mono_class(canonical);
};
follow_bold_branch = (sugar, units) => {
  var unit = units.shift();
  if (!unit) {
    throw new Error('Empty branch');
  }
  var _unit$split = unit.split('('),
    _unit$split2 = CondensedIupac_slicedToArray(_unit$split, 2),
    child_root = _unit$split2[0],
    linkage = _unit$split2[1];
  var child = get_monosaccharide(sugar, child_root);
  create_bold_tree(sugar, child, units);
  return [child, linkage];
};
create_bold_tree = (sugar, root, units) => {
  var waiting_children = [];
  var child_adder = (parent, pair) => parent.addChild(pair[0], pair[1]);
  while (units.length > 0) {
    var unit = units.shift();
    if (unit == ']') {
      var _follow_bold_branch = follow_bold_branch(sugar, units),
        _follow_bold_branch2 = CondensedIupac_slicedToArray(_follow_bold_branch, 2),
        child = _follow_bold_branch2[0],
        linkage = _follow_bold_branch2[1];
      var _split = (linkage || '').split(''),
        _split2 = CondensedIupac_slicedToArray(_split, 4),
        anomer = _split2[0],
        parent_link = _split2[1],
        child_link = _split2[3];
      child.anomer = anomer;
      child.parent_linkage = parse_link(parent_link);
      waiting_children.push([parse_link(child_link), child]);
    } else if (unit == '[') {
      waiting_children.reverse().forEach(child_adder.bind(null, root));
      waiting_children.length = 0;
      return;
    } else {
      var _unit$split3 = unit.split('('),
        _unit$split4 = CondensedIupac_slicedToArray(_unit$split3, 2),
        child_root = _unit$split4[0],
        _linkage = _unit$split4[1];
      var _split3 = (_linkage || '').split(''),
        _split4 = CondensedIupac_slicedToArray(_split3, 4),
        _anomer = _split4[0],
        _parent_link = _split4[1],
        _child_link = _split4[3];
      var _child = get_monosaccharide(sugar, child_root);
      _child.anomer = _anomer;
      _child.parent_linkage = parse_link(_parent_link);
      root.addChild(parse_link(_child_link), _child);
      waiting_children.reverse().forEach(child_adder.bind(null, root));
      waiting_children.length = 0;
      root = _child;
    }
  }
};
var reverse = function reverse(string) {
  return string.split('').reverse().join('');
};
var matches_repeat = key => {
  return res => {
    return res.identifier === "Repeat".concat(key);
  };
};
var create_repeat_objects = (sugar, definitions) => {
  var residues = sugar.composition();
  for (var key of Object.keys(definitions)) {
    var repeat_placeholder = residues.filter(matches_repeat(key)).shift();
    if (!repeat_placeholder) {
      continue;
    }
    var repeat_seq = definitions[key].seq;
    var max_repeats = 1;
    var variable_identifier = '';
    if (definitions[key].variable.match(/^\d+$/)) {
      max_repeats = parseInt(definitions[key].variable);
      variable_identifier = '' + max_repeats;
    }
    if (definitions[key].variable.match(/[a-z]/)) {
      variable_identifier = definitions[key].variable;
    }
    var clazz = sugar.constructor;
    var repeat_sug = new clazz();
    repeat_sug.sequence = repeat_seq;
    var location = definitions[key].attachment;
    if (!location) {
      var repeat_end = repeat_sug.root;
      while (repeat_end.children && repeat_end.children.length > 0) {
        repeat_end = repeat_end.children[0];
      }
      location = repeat_sug.location_for_monosaccharide(repeat_end);
    }
    var repeat = new Repeat(repeat_sug, location, 1, max_repeats);
    repeat.mode = Repeat.MODE_MINIMAL;
    if (variable_identifier) {
      repeat.identifier = variable_identifier;
    }
    var target = repeat_placeholder.parent;
    target.removeChild(target.linkageOf(repeat_placeholder), repeat_placeholder);
    target.graft(repeat.root);
    if (repeat_placeholder.children.length > 0) {
      repeat.children = repeat_placeholder.children;
    }
  }
  // Traverse the tree to make sure parents are set
  residues = sugar.composition();
};
var parse_sequence = function parse_sequence(sequence) {
  var comment = '';
  if (sequence !== '') {
    var _sequence$match = sequence.match(/([^+]+)(?:\+(".+"))*/);
    var _sequence$match2 = CondensedIupac_slicedToArray(_sequence$match, 3);
    sequence = _sequence$match2[1];
    comment = _sequence$match2[2];
  }
  comment = (comment || '').replace(/^"/, '').replace(/"$/, '');
  var repeat_re = /{([^}@]+)(?:@([a-z]\d+[a-z]))?}([a-z]|\d+)/g;
  var repeat_match;
  var repeat_count = 0;
  var repeat_definitions = {};
  var repeat_free_seq = sequence;
  while ((repeat_match = repeat_re.exec(sequence)) !== null) {
    repeat_free_seq = repeat_free_seq.replace(repeat_match[0], "Repeat".concat(++repeat_count, "(u?-?)"));
    repeat_definitions[repeat_count] = {
      seq: repeat_match[1],
      attachment: repeat_match[2],
      variable: repeat_match[3]
    };
  }
  sequence = repeat_free_seq;
  var open_end = sequence.match(OPEN_REDUCING_END_RE);
  if (open_end) {
    sequence = sequence.slice(0, -open_end[0].length);
  }
  if (sequence.match(/[\])]$/)) {
    sequence = "".concat(sequence, "Root");
  }
  sequence = sequence + ')';
  var units = sequence.split(/([[\]])/);

  // Reverse ordering of branches so we see closer residues first
  units = units.map(unit => unit.split(/\)(?=[A-Za-z*])/).reverse().join(')')).map(unit => unit.match(/\d$/) ? unit + ')' : unit);

  // We wish to split the units by the linkages
  units = [].concat.apply([], units.map(unit => reverse(unit).split(')').filter(unit => unit.length).map(reverse))).reverse();
  this.root = null;
  if (units.length > 0) {
    var root = get_monosaccharide(this, units.shift());
    if (open_end) {
      root.anomer = open_end[1];
    }
    create_bold_tree(this, root, units);
    this.root = root;
  }
  create_repeat_objects(this, repeat_definitions);
  if (comment) {
    this.comment = comment;
  }
  return this.root;
};
var write_monosaccharide = mono => {
  var name = mono.toString();
  if (mono instanceof Repeat.Monosaccharide) {
    if (mono.repeat.mode === Repeat.MODE_MINIMAL) {
      return "{".concat(mono.repeat.template.sequence.replace(/\([a-z]\d+-$/, ''));
    }
    if (mono.repeat.mode === Repeat.MODE_EXPAND) {
      return "".concat(name);
    }
  }
  return name;
};
var write_linkage = mono => {
  if (!mono.parent) {
    return '';
  }
  return '(' + mono.anomer + write_link(mono.parent_linkage) + '-';
};
var link_expander = function link_expander(links) {
  var position = links[0];
  return links[1].map(mono => [position, mono]);
};
var cap_repeat = res => {
  if (res instanceof Repeat.Monosaccharide && res.repeat.root === res && res.repeat.mode === Repeat.MODE_MINIMAL) {
    return (res.repeat.off_main ? "@".concat(res.repeat.attachment) : '') + "}".concat(res.repeat.identifier);
  }
  return '';
};
var _write_sequence = function write_sequence() {
  var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.root;
  if (!start) {
    return;
  }

  // Write the sequences for each of the children of this residue
  // making sure that we place the children in square brackets
  // if they are off the main branch

  var child_links = [];
  if (start instanceof Repeat.Monosaccharide && start.repeat.mode === Repeat.MODE_MINIMAL && start.repeat.root === start) {
    var repeat_kids = start.repeat.children;
    if (repeat_kids.length > 0) {
      child_links = [].concat.apply([], [...repeat_kids[0].parent.child_linkages].map(_ref => {
        var _ref2 = CondensedIupac_slicedToArray(_ref, 2),
          linkage = _ref2[0],
          kids = _ref2[1];
        return [linkage, kids.filter(child => !(child instanceof Repeat.Monosaccharide && child.repeat === start.repeat))];
      }).sort((a, b) => a[0] - b[0]).map(link_expander));
    } else {
      child_links = [];
    }
  } else {
    child_links = [].concat.apply([], [...start.child_linkages].sort((a, b) => a[0] - b[0]).map(link_expander));
  }
  var child_sequence = '' + child_links.map(kid => _write_sequence.call(this, kid[1]) + write_link(kid[0]) + ')' + cap_repeat(kid[1])).reduce((curr, next) => curr ? curr + '[' + next + ']' : next, '');
  var seq = child_sequence + write_monosaccharide(start, this) + write_linkage(start);
  if (start === this.root && this.comment) {
    return "".concat(seq, "+\"").concat(this.comment, "\"");
  } else {
    return seq;
  }
};
var CondensedIupac_getPropertyDescriptor = function getPropertyDescriptor(object, descriptor) {
  var retval = null;
  while (!(retval = Object.getOwnPropertyDescriptor(object, descriptor)) && Object.getPrototypeOf(object)) {
    object = Object.getPrototypeOf(object);
  }
  return retval;
};
var Builder = function Builder(superclass) {
  var getter = (CondensedIupac_getPropertyDescriptor(superclass.prototype, 'sequence') || {
    'get': null
  }).get;
  var setter = function setter(sequence) {
    parse_sequence.call(this, sequence);
  };
  var methods = {};
  if (getter) {
    methods.get = getter;
  }
  if (setter) {
    methods.set = setter;
  }
  Object.defineProperty(superclass.prototype, 'sequence', methods);
  return class extends superclass {};
};
var Writer = function Writer(superclass) {
  var setter = (CondensedIupac_getPropertyDescriptor(superclass.prototype, 'sequence') || {
    'set': null
  }).set;
  var getter = function getter() {
    return _write_sequence.call(this, this.root);
  };
  var methods = {};
  if (getter) {
    methods.get = getter;
  }
  if (setter) {
    methods.set = setter;
  }
  Object.defineProperty(superclass.prototype, 'sequence', methods);
  return class extends superclass {};
};
var anonymous_class = superclass => {
  return class extends superclass {};
};
var IO = superclass => Builder(Writer(anonymous_class(superclass)));

;// ./node_modules/glycan.js/lib/QuadTree.js
/*jslint vars: true, nomen: true, plusplus: true, continue:true, forin:true */

/*
  The MIT License

  Copyright (c) 2011 Mike Chambers

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the 'Software'), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

/**
* A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.
* @module QuadTree
**/


/************** Node ********************/
function Node(bounds, depth, maxDepth, maxChildren) {
  this._bounds = bounds;
  this.children = [];
  this.nodes = [];
  if (maxChildren) {
    this._maxChildren = maxChildren;
  }
  if (maxDepth) {
    this._maxDepth = maxDepth;
  }
  if (depth) {
    this._depth = depth;
  }
}

//subnodes
Node.prototype.nodes = null;
Node.prototype._classConstructor = Node;

//children contained directly in the node
Node.prototype.children = null;
Node.prototype._bounds = null;

//read only
Node.prototype._depth = 0;
Node.prototype._maxChildren = 4;
Node.prototype._maxDepth = 4;
Node.TOP_LEFT = 0;
Node.TOP_RIGHT = 1;
Node.BOTTOM_LEFT = 2;
Node.BOTTOM_RIGHT = 3;
Node.prototype.insert = function (item) {
  if (this.nodes.length) {
    var index = this._findIndex(item);
    this.nodes[index].insert(item);
    return;
  }
  this.children.push(item);
  var len = this.children.length;
  if (this._depth < this._maxDepth && len > this._maxChildren) {
    this.subdivide();
    var i;
    for (i = 0; i < len; i++) {
      this.insert(this.children[i]);
    }
    this.children.length = 0;
  }
};
Node.prototype.retrieve = function (item) {
  if (this.nodes.length) {
    var index = this._findIndex(item);
    return this.nodes[index].retrieve(item);
  }
  return this.children;
};
Node.prototype._findIndex = function (item) {
  var b = this._bounds;
  var left = item.x > b.x + b.width / 2 ? false : true;
  var top = item.y > b.y + b.height / 2 ? false : true;

  //top left
  var index = Node.TOP_LEFT;
  if (left) {
    //left side
    if (!top) {
      //bottom left
      index = Node.BOTTOM_LEFT;
    }
  } else {
    //right side
    if (top) {
      //top right
      index = Node.TOP_RIGHT;
    } else {
      //bottom right
      index = Node.BOTTOM_RIGHT;
    }
  }
  return index;
};
Node.prototype.subdivide = function () {
  var depth = this._depth + 1;
  var bx = this._bounds.x;
  var by = this._bounds.y;

  //floor the values
  var b_w_h = this._bounds.width / 2; //todo: Math.floor?
  var b_h_h = this._bounds.height / 2;
  var bx_b_w_h = bx + b_w_h;
  var by_b_h_h = by + b_h_h;

  //top left
  this.nodes[Node.TOP_LEFT] = new this._classConstructor({
    x: bx,
    y: by,
    width: b_w_h,
    height: b_h_h
  }, depth, this._maxDepth, this._maxChildren);

  //top right
  this.nodes[Node.TOP_RIGHT] = new this._classConstructor({
    x: bx_b_w_h,
    y: by,
    width: b_w_h,
    height: b_h_h
  }, depth, this._maxDepth, this._maxChildren);

  //bottom left
  this.nodes[Node.BOTTOM_LEFT] = new this._classConstructor({
    x: bx,
    y: by_b_h_h,
    width: b_w_h,
    height: b_h_h
  }, depth, this._maxDepth, this._maxChildren);

  //bottom right
  this.nodes[Node.BOTTOM_RIGHT] = new this._classConstructor({
    x: bx_b_w_h,
    y: by_b_h_h,
    width: b_w_h,
    height: b_h_h
  }, depth, this._maxDepth, this._maxChildren);
};
Node.prototype.clear = function () {
  this.children.length = 0;
  var len = this.nodes.length;
  var i;
  for (i = 0; i < len; i++) {
    this.nodes[i].clear();
  }
  this.nodes.length = 0;
};

/******************** BoundsQuadTree ****************/

function BoundsNode(bounds, depth, maxChildren, maxDepth) {
  Node.call(this, bounds, depth, maxChildren, maxDepth);
  this._stuckChildren = [];
}
BoundsNode.prototype = new Node();
BoundsNode.prototype._classConstructor = BoundsNode;
BoundsNode.prototype._stuckChildren = null;

//we use this to collect and conctenate items being retrieved. This way
//we dont have to continuously create new Array instances.
//Note, when returned from QuadTree.retrieve, we then copy the array
BoundsNode.prototype._out = [];
BoundsNode.prototype.insert = function (item) {
  if (this.nodes.length) {
    var index = this._findIndex(item);
    var node = this.nodes[index];

    //todo: make _bounds bounds
    if (item.x >= node._bounds.x && item.x + item.width <= node._bounds.x + node._bounds.width && item.y >= node._bounds.y && item.y + item.height <= node._bounds.y + node._bounds.height) {
      this.nodes[index].insert(item);
    } else {
      this._stuckChildren.push(item);
    }
    return;
  }
  this.children.push(item);
  var len = this.children.length;
  if (this._depth < this._maxDepth && len > this._maxChildren) {
    this.subdivide();
    var i;
    for (i = 0; i < len; i++) {
      this.insert(this.children[i]);
    }
    this.children.length = 0;
  }
};
BoundsNode.prototype.getChildren = function () {
  return this.children.concat(this._stuckChildren);
};
BoundsNode.prototype.retrieve = function (item) {
  var out = this._out;
  out.length = 0;
  if (this.nodes.length) {
    var index = this._findIndex(item);
    var node = this.nodes[index];
    if (item.x >= node._bounds.x && item.x + item.width <= node._bounds.x + node._bounds.width && item.y >= node._bounds.y && item.y + item.height <= node._bounds.y + node._bounds.height) {
      out.push.apply(out, this.nodes[index].retrieve(item));
    } else {
      //Part of the item are overlapping multiple child nodes. For each of the overlapping nodes, return all containing objects.

      if (item.x <= this.nodes[Node.TOP_RIGHT]._bounds.x) {
        if (item.y <= this.nodes[Node.BOTTOM_LEFT]._bounds.y) {
          out.push.apply(out, this.nodes[Node.TOP_LEFT].getAllContent());
        }
        if (item.y + item.height > this.nodes[Node.BOTTOM_LEFT]._bounds.y) {
          out.push.apply(out, this.nodes[Node.BOTTOM_LEFT].getAllContent());
        }
      }
      if (item.x + item.width > this.nodes[Node.TOP_RIGHT]._bounds.x) {
        //position+width bigger than middle x
        if (item.y <= this.nodes[Node.BOTTOM_RIGHT]._bounds.y) {
          out.push.apply(out, this.nodes[Node.TOP_RIGHT].getAllContent());
        }
        if (item.y + item.height > this.nodes[Node.BOTTOM_RIGHT]._bounds.y) {
          out.push.apply(out, this.nodes[Node.BOTTOM_RIGHT].getAllContent());
        }
      }
    }
  }
  out.push.apply(out, this._stuckChildren);
  out.push.apply(out, this.children);
  return out;
};

//Returns all contents of node.
BoundsNode.prototype.getAllContent = function () {
  var out = this._out;
  if (this.nodes.length) {
    var i;
    for (i = 0; i < this.nodes.length; i++) {
      this.nodes[i].getAllContent();
    }
  }
  out.push.apply(out, this._stuckChildren);
  out.push.apply(out, this.children);
  return out;
};
BoundsNode.prototype.clear = function () {
  this._stuckChildren.length = 0;

  //array
  this.children.length = 0;
  var len = this.nodes.length;
  if (!len) {
    return;
  }
  var i;
  for (i = 0; i < len; i++) {
    this.nodes[i].clear();
  }

  //array
  this.nodes.length = 0;

  //we could call the super clear function but for now, im just going to inline it
  //call the hidden super.clear, and make sure its called with this = this instance
  //Object.getPrototypeOf(BoundsNode.prototype).clear.call(this);
};

/****************** QuadTree ****************/

/**
* QuadTree data structure.
* @class QuadTree
* @constructor
* @param {Object} An object representing the bounds of the top level of the QuadTree. The object
* should contain the following properties : x, y, width, height
* @param {Boolean} pointQuad Whether the QuadTree will contain points (true), or items with bounds
* (width / height)(false). Default value is false.
* @param {Number} maxDepth The maximum number of levels that the quadtree will create. Default is 4.
* @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.
**/
function QuadTree(bounds, pointQuad, maxDepth, maxChildren) {
  var node;
  if (pointQuad) {
    node = new Node(bounds, 0, maxDepth, maxChildren);
  } else {
    node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
  }
  this.root = node;
}

/**
* The root node of the QuadTree which covers the entire area being segmented.
* @property root
* @type Node
**/
QuadTree.prototype.root = null;

/**
* Inserts an item into the QuadTree.
* @method insert
* @param {Object|Array} item The item or Array of items to be inserted into the QuadTree. The item should expose x, y 
* properties that represents its position in 2D space.
**/
QuadTree.prototype.insert = function (item) {
  if (item instanceof Array) {
    var len = item.length;
    var i;
    for (i = 0; i < len; i++) {
      this.root.insert(item[i]);
    }
  } else {
    this.root.insert(item);
  }
};

/**
* Clears all nodes and children from the QuadTree
* @method clear
**/
QuadTree.prototype.clear = function () {
  this.root.clear();
};

/**
* Retrieves all items / points in the same node as the specified item / point. If the specified item
* overlaps the bounds of a node, then all children in both nodes will be returned.
* @method retrieve
* @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape
* with dimensions (x, y, width, height) properties.
**/
QuadTree.prototype.retrieve = function (item) {
  //get a copy of the array of items
  var out = this.root.retrieve(item).slice(0);
  return out;
};
/* harmony default export */ const lib_QuadTree = (QuadTree);
;// ./node_modules/glycan.js/js/CondensedLayout.js


var CondensedLayout_module_string = 'glycanjs:condensedlayout';
var CondensedLayout_log = debugAny(CondensedLayout_module_string);
var BASE_DELTA_X = 1;
var BASE_DELTA_Y = 1;
var calculate_position = function calculate_position(sugar, item) {
  var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    dx: 0,
    dy: 0,
    r: 0.5
  };
  var parent_position = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var DELTA_Y = this.DELTA_Y;
  var DELTA_X = this.DELTA_X;

  // upwards = positive y

  position.collision = [];
  if (item.children.length > 1 && !position.spread_count) {
    position.spread_count = item.children.length;
    position.spread = 1;
  }
  if (!item.parent) {
    return position;
  }
  position.dy = -1 * DELTA_Y;
  position.dx = 0;
  if (!position.item_index && parent_position.spread_count) {
    var parent_kids = item.parent.children;
    position.item_index = parent_kids.indexOf(item) + 1;
  }
  if (parent_position.spread) {
    position.dy = -1 * parent_position.spread * DELTA_Y;
    position.dx = parent_position.spread * DELTA_X * (position.item_index - 1 - Math.floor(parent_position.spread_count / 2) + 0.5 * (1 - parent_position.spread_count % 2));
  }

  // Make room for linkage
  if (!parent_position.spread || parent_position.spread < 2) {
    position.dy += -1 * position.r;
  }
  if (parent_position.grid_spread) {
    position.dx = DELTA_X * position.item_index;
  }
  return position;
};
var derive_position_glycoconjugate = position => {
  position.x = -1 * position.r;
  position.y = BASE_DELTA_Y;
  position.width = 2 * position.r;
  position.height = 2 * position.r;
};
var derive_position = (position, parent_position) => {
  position.x = -1 * position.r;
  position.y = -1 * position.r;
  position.width = 2 * position.r;
  position.height = 2 * position.r;
  if (!parent_position) {
    return;
  }
  position.x += parent_position.x + parent_position.width / 2 + position.dx;
  position.y += parent_position.y + parent_position.height / 2 + position.dy;
};
var check_overlaps = positions => {
  var xpositions = positions.map(pos => pos.position.x);
  var min_x = Math.min(...xpositions);
  var width = Math.max(...xpositions) - min_x;
  var min_y = Math.min(...xpositions);
  var height = Math.max(...xpositions) - min_y;
  var quad = new lib_QuadTree({
    x: min_x,
    y: min_y,
    width: width,
    height: height
  });
  for (var position of positions.map((pos, idx) => Object.assign({
    idx: idx
  }, pos.position))) {
    // Skip this if ignore_overlap is true
    if (position.ignore_overlap === true) {
      continue;
    }
    quad.insert(position);
  }
  for (var i = 0; i < positions.length; i++) {
    if (positions[i].position.ignore_overlap === true) {
      continue;
    }
    var check_position = positions[i].position;
    var items = quad.retrieve(check_position);
    for (var item of items) {
      if (item.idx === i) {
        continue;
      }
      if (positions[i].item.parent == positions[item.idx].item) {
        continue;
      }
      if (positions[item.idx].item.parent == positions[i].item) {
        continue;
      }
      var item_position = positions[item.idx].position;
      if (item_position.collision.indexOf(check_position) >= 0 && check_position.collision.indexOf(item_position) >= 0) {
        continue;
      }
      var dx = check_position.x - item_position.x;
      var dy = check_position.y - item_position.y;
      var radii = check_position.r + item_position.r;
      var colliding = dx * dx + dy * dy < radii * radii;
      if (colliding) {
        item_position.collision.push(check_position);
        check_position.collision.push(item_position);
      }
    }
  }
};
var derive_item_position = (layout, item) => {
  if (!item.parent && item.children.length == 1 && item.linkageOf(item.children[0]) < 0) {
    derive_position_glycoconjugate(layout.get(item), item.identifier);
    return {
      position: layout.get(item),
      item: item
    };
  }
  derive_position(layout.get(item), item.parent ? layout.get(item.parent) : null);
  CondensedLayout_log.info('Position for', item.identifier, layout.get(item).x, layout.get(item).y);
  return {
    position: layout.get(item),
    item: item
  };
};
var is_not_resolved = (resolved, overlapping) => !resolved[overlapping];
var map_get_item = (map, item) => map.get(item);
var path_to_root = (sugar, start) => [...sugar.residues_to_root(start)];
var CondensedLayout = class {
  static get DELTA_X() {
    if (this.LINKS) {
      return BASE_DELTA_X;
    } else {
      return BASE_DELTA_X;
    }
  }
  static get DELTA_Y() {
    if (this.LINKS) {
      return BASE_DELTA_Y;
    } else {
      return 0.5 * BASE_DELTA_Y;
    }
  }
  static get SPREAD_DELTA() {
    return 1;
  }
  static LayoutMonosaccharide(renderable, monosaccharide, position, parent_position) {
    return calculate_position.call(this, renderable, monosaccharide, position, parent_position);
  }
  static CalculateIdentifier(residue) {
    return residue.identifier.toLowerCase();
  }
  static PerformLayout(renderable) {
    var layout = new WeakMap();
    // Items in the tree based upon
    // increasing depth
    var items = [...renderable.breadth_first_traversal()];
    var overlap_tries_remaining = 20;
    while (overlap_tries_remaining >= 0) {
      CondensedLayout_log.info('Looping to resolve overlaps on loop', overlap_tries_remaining--);
      for (var item of items) {
        var current_layout = layout.has(item) ? layout.get(item) : undefined;
        var parent_layout = item.parent && layout.has(item.parent) ? layout.get(item.parent) : undefined;
        layout.set(item, this.LayoutMonosaccharide(renderable, item, current_layout, parent_layout, layout));
      }
      var positions = items.map(derive_item_position.bind(null, layout));
      check_overlaps(positions);
      var overlapping = positions.filter(position => position.position.collision.length > 0).map(overlap => overlap.item);
      var positions_overlap_map = new WeakMap();
      for (var _item of overlapping) {
        positions_overlap_map.set(layout.get(_item), _item);
      }
      if (overlapping.length < 1) {
        CondensedLayout_log.info('No overlaps to resolve - breaking');
        break;
      }
      var overlap_roots = new WeakMap();
      for (var _item2 of overlapping) {
        var colliding_parents = [].concat.apply([], layout.get(_item2).collision.map(map_get_item.bind(null, positions_overlap_map)).map(path_to_root.bind(null, renderable)));
        CondensedLayout_log.info(_item2.identifier, 'collides with', colliding_parents[0].identifier, 'at', layout.get(_item2).x, layout.get(_item2).y, layout.get(_item2).collision.map(coll => [coll.x, coll.y]), 'which is a child of', colliding_parents.map(res => res.identifier));
        for (var parent of renderable.residues_to_root(_item2)) {
          if (parent === _item2) {
            continue;
          }
          if (!overlap_roots.has(parent)) {
            overlap_roots.set(parent, []);
          }
          // First parent this residue collides with
          if (colliding_parents.indexOf(parent) >= 0) {
            CondensedLayout_log.info('Overlap root of', parent.identifier, 'for', _item2.identifier);
            overlap_roots.get(parent).push(_item2);
            break;
          }
        }
      }
      var resolved = {};
      for (var _item3 of [].concat(items).reverse()) {
        if (overlap_roots.has(_item3)) {
          var unresolved = overlap_roots.get(_item3).filter(is_not_resolved.bind(null, resolved));
          for (var to_resolve of unresolved) {
            resolved[to_resolve] = true;
          }
          if (unresolved.length > 0) {
            layout.get(_item3).spread = (layout.get(_item3).spread || 0) + this.SPREAD_DELTA;
            CondensedLayout_log.info('Increasing spread for', _item3.identifier, 'to', layout.get(_item3).spread);
          }
        }
      }
    }
    if (CondensedLayout_log.enabled) {
      CondensedLayout_log.info('Done layout for', renderable.sequence);
      for (var _item4 of items) {
        CondensedLayout_log.info('Laid out', _item4.identifier, layout.get(_item4));
      }
    }

    // layout the root
    // layout children
    return layout;
  }
};
CondensedLayout.LINKS = true;
/* harmony default export */ const js_CondensedLayout = (CondensedLayout);
;// ./node_modules/glycan.js/js/SugarAwareLayout.js






var not_sulf = res => res.identifier !== 'HSO3';
var horizontal_identifiers = ['Xyl', 'HSO3', 'Rbo', 'P', 'GlcN'];
class IupacSugar extends IO(Sugar) {}
var NLINKED_CORE = new IupacSugar();
NLINKED_CORE.sequence = 'Man(a1-3)[Man(a1-6)]Man(b1-4)GlcNAc(b1-4)GlcNAc';
var SugarAwareLayout_identifier_comparator = (a, b) => {
  if (!a || !b) {
    return false;
  }
  return a.identifier === b.identifier;
};
var calculate_layout_hso3 = function calculate_layout_hso3(res, position, DELTA_X, DELTA_Y) {
  var SULF_DELTA_X = this.LINKS ? 2 / 3 * 5 / 4 * DELTA_X : 2 * DELTA_X / 3;
  var SULF_DELTA_Y = this.LINKS ? 2 / 3 * 2 / 3 * DELTA_Y : 2 * DELTA_Y / 3;
  position.r = 1 / 4 * DELTA_X;
  var linkage_pos = res.parent.linkageOf(res);
  if (linkage_pos === 2 || linkage_pos === 6 || linkage_pos === Monosaccharide.LINKAGES.N) {
    position.dy = 0 * SULF_DELTA_Y;
    position.dx = 0.5 * SULF_DELTA_X;
    if (linkage_pos === 2 || linkage_pos === Monosaccharide.LINKAGES.N) {
      position.dx *= -1;
    }
  }
  if (linkage_pos === 3 || linkage_pos === 4) {
    position.dy = -1 * SULF_DELTA_Y;
    position.dx = 0.5 * SULF_DELTA_X;
    if (linkage_pos === 3) {
      position.dx *= -1;
    }
    if (linkage_pos === 4) {
      position.dx = 0 * SULF_DELTA_X;
    }
  }
  position.ignore_overlap = true;
  return position;
};
var CHECKED_NLINKED = new WeakMap();
class SugarAwareLayout extends js_CondensedLayout {
  static CalculateIdentifier(residue) {
    var residue_id = residue.identifier.toLowerCase();
    var parent_linkage = residue.parent ? residue.parent.linkageOf(residue) : null;
    if (parent_linkage === Monosaccharide.LINKAGES.N) {
      parent_linkage = 'N';
    }
    if (parent_linkage === Monosaccharide.LINKAGES.O) {
      parent_linkage = 'O';
    }
    var residue_suffix = residue.parent && (residue_id === 'hso3' || residue_id == 'me') && parent_linkage ? '.' + parent_linkage : '';
    return "".concat(residue_id).concat(residue_suffix);
  }
  static get DELTA_X() {
    return super.DELTA_X * 1.25;
  }
  static get DELTA_Y() {
    return super.DELTA_Y * 1.25;
  }
  static get SPREAD_DELTA() {
    return super.SPREAD_DELTA * 0.25;
  }
  static LayoutMonosaccharide(sugar, res, position, parent_position, layout) {
    var DELTA_Y = this.DELTA_Y;
    var DELTA_X = this.DELTA_X;
    position = js_CondensedLayout.LayoutMonosaccharide.call(this, sugar, res, position, parent_position);
    if (horizontal_identifiers.indexOf(res.identifier) >= 0) {
      position.keep_horizontal = true;
    }
    if (!CHECKED_NLINKED.get(position) && !this.LINKS && !position.ignore_overlap) {
      var matches = sugar.match_sugar_pattern(NLINKED_CORE, SugarAwareLayout_identifier_comparator);
      CHECKED_NLINKED.set(position, true);
      if (matches.length > 0) {
        if (matches[0].composition().map(traced => traced.original).indexOf(res) >= 0) {
          if (!this.LINKS) {
            position.ignore_overlap = true;
          }
        }
      }
    }
    var sibs = res.siblings;
    if (sibs.filter(not_sulf).length == 1 && (res.monosaccharide === MONOSACCHARIDE.Fuc || res.monosaccharide === MONOSACCHARIDE.NeuAc) || res.parent && res.parent.endsRepeatUnit && res.parent.repeat.mode == Repeat.MODE_MINIMAL && res.monosaccharide === MONOSACCHARIDE.Fuc) {
      // Stubby NeuAc and Fuc along a chain
      // Stubby Fuc at the end of a repeat unit
      if (res.monosaccharide === MONOSACCHARIDE.NeuAc && sibs.filter(not_sulf)[0].monosaccharide === MONOSACCHARIDE.Fuc) {
        position.dx = 0;
        position.dy = -1 * DELTA_Y;
        position.dy -= position.r; // Make room for linkage
        return position;
      }
      position.dy = 0;
      position.dx = [2, 3].indexOf(res.parent.linkageOf(res)) >= 0 ? -1 * DELTA_X : DELTA_X;
      if (res.monosaccharide === MONOSACCHARIDE.Fuc) {
        position.rotate = position.dx < 0 ? 90 : -90;
        position.dx = position.dx < 0 ? -0.75 : 0.75;
        return position;
      }
      if (this.LINKS) {
        position.dx += (position.dx < 0 ? -1 : 1) * DELTA_X / 4;
      }
      return position;
    }
    if (res.identifier === 'PI') {
      position.r = 0.75;
    }
    if (res.identifier === 'GlcN' && res.parent.identifier === 'PI') {
      position.dx = 0.5 * DELTA_X;
      return position;
    }
    if (res.identifier === 'EtNP') {
      var linkage_pos = res.parent.linkageOf(res);
      if (linkage_pos === 2) {
        position.dy = 0;
        position.dx = -0.66 * DELTA_X;
        position.rotate = -90;
      }
      if (linkage_pos === 6 && res.parent.children.length === 1) {
        position.dy = -1.25 * DELTA_Y;
        position.dx = 0;
      }
      if (linkage_pos === 6 && res.parent.children.length > 1) {
        position.dx = 0.66 * DELTA_X;
        position.dy = 0;
        position.rotate = 90;
      }
      position.ignore_overlap = true;
    }
    if (res.identifier === 'HSO3' || res.identifier === 'Me') {
      return calculate_layout_hso3.call(this, res, position, DELTA_X, DELTA_Y);
    }
    if (sibs.length == 1 && res.identifier === 'P') {
      position.dy = 0;
      position.dx = res.parent.linkageOf(res) >= 0 ? DELTA_X : -1 * DELTA_X;
      if (this.LINKS) {
        position.dx += (position.dx < 0 ? -1 : 1) * DELTA_X / 4;
      }
      return position;
    }

    // Make Type I chains linear
    if (sibs.length == 1 && res.identifier === 'GlcNAc' && sibs[0].identifier == 'GlcNAc') {
      if (res.parent.linkageOf(res) === 3) {
        position.dx = 0;
      }
      return position;
    }

    // If only a single sibling is Fuc or NeuAc make it a stub
    if (sibs.filter(not_sulf).filter(sibling => sibling.monosaccharide !== MONOSACCHARIDE.Fuc && sibling.monosaccharide !== MONOSACCHARIDE.NeuAc).length == 0 && sibs.filter(not_sulf).filter(sibling => sibling.monosaccharide === MONOSACCHARIDE.Fuc || sibling.monosaccharide === MONOSACCHARIDE.NeuAc).length <= 1) {
      position.dx = 0;
    }
    if (sibs.length === 1 && ['P', 'HSO3', 'EtNP'].indexOf(sibs[0].identifier) >= 0) {
      position.dx = 0;
    }
    if (sibs.length === 2 && [res].concat(sibs).some(r => r.monosaccharide === MONOSACCHARIDE.Fuc) && [res].concat(sibs).map(r => r.identifier).indexOf('HSO3') >= 0 && res.monosaccharide === MONOSACCHARIDE.Fuc) {
      position.dy = 0;
      position.dx = res.parent.linkageOf(res) >= 4 ? DELTA_X : -1 * DELTA_X;
      if (res.monosaccharide === MONOSACCHARIDE.Fuc) {
        position.rotate = position.dx < 0 ? 90 : -90;
        position.ignore_overlap = true;
      }
      if (this.LINKS) {
        position.dx += (position.dx < 0 ? -1 : 1) * DELTA_X / 4;
      }
      return position;
    }
    if (res.identifier === 'Man' && res.siblings.length > 0) {
      var sibling_spreads = res.siblings.map(sib => layout.get(sib)).filter(lay => lay).map(lay => lay.spread).filter(x => x);
      if (position.spread) {
        sibling_spreads.push(position.spread);
      }
      var max_spread = Math.max(...sibling_spreads);
      if (isFinite(max_spread)) {
        for (var sib of res.siblings) {
          if (sib.children.length > 0 && layout.get(sib)) {
            layout.get(sib).spread = max_spread;
          }
        }
        position.spread = max_spread;
      }
    }
    return position;
  }
}

;// ./node_modules/glycan.js/js/LinkageLayout.js




class LinkageLayout_IupacSugar extends IO(Sugar) {}
var LinkageLayout_identifier_comparator = (a, b) => {
  if (!a || !b) {
    return false;
  }
  return a.identifier === b.identifier;
};
var LinkageLayout_NLINKED_CORE = new LinkageLayout_IupacSugar();
LinkageLayout_NLINKED_CORE.sequence = 'Man(a1-3)[Man(a1-6)]Man(b1-4)GlcNAc(b1-4)GlcNAc';
var OLINKED_CORE = new LinkageLayout_IupacSugar();
OLINKED_CORE.sequence = 'Gal(b1-3)GalNAc';
var LINEARISE_CHAINS = false;
class LinkageLayout extends SugarAwareLayout {
  static LayoutMonosaccharide(sugar, res, position, parent_position, layout) {
    var DELTA_Y_SCALE = 2;
    var DELTA_Y = DELTA_Y_SCALE * this.DELTA_Y;
    var DELTA_X = this.DELTA_X;
    position = SugarAwareLayout.LayoutMonosaccharide.call(this, sugar, res, position, parent_position, layout);
    if (!res.parent) {
      return position;
    }
    if (res.identifier === 'HSO3' || res.identifier == 'Me') {
      return calculate_layout_hso3.call(this, res, position, DELTA_X, DELTA_Y / DELTA_Y_SCALE);
    }
    var matches = sugar.match_sugar_pattern(LinkageLayout_NLINKED_CORE, LinkageLayout_identifier_comparator);
    if (matches.length > 0) {
      if (matches[0].composition().map(traced => traced.original).indexOf(res) >= 0) {
        if (!this.LINKS) {
          if (res.identifier == 'Man' && res.parent.identifier == 'Man') {
            position.ignore_overlap = false;
            position.dx = 0.5 * position.dx;
            position.dy = 0.5 * position.dy;
          }
        }
        return position;
      }
    }
    matches = sugar.match_sugar_pattern(OLINKED_CORE, LinkageLayout_identifier_comparator);
    if (matches.length > 0) {
      if (LINEARISE_CHAINS && res.identifier === 'GlcNAc' && res.parent.linkageOf(res) === 3 && res.siblings.length === 0) {
        return position;
      }
      var in_core = matches[0].composition().map(traced => traced.original);
      if (in_core[0] && in_core[0].parent && ['Ser', 'Thr', 'Tyr'].indexOf(in_core[0].parent.identifier) < 0) {} else {
        if (in_core.indexOf(res) >= 0) {
          return position;
        }
        if (res.siblings.filter(sib => in_core.indexOf(sib) >= 0).length > 0) {
          return position;
        }
      }
    }
    var linkage = res.parent.linkageOf(res);
    var is_fucose = res.identifier === 'Fuc';
    switch (linkage) {
      case 0:
        position.dx = 0;
        position.dy = -1 * DELTA_Y;
        break;
      case 2:
        position.dx = -1 * DELTA_X * (parent_position.spread || 1);
        position.dy = 0;
        if (is_fucose) {
          position.rotate = 90;
        }
        break;
      case 3:
        position.dx = -1 * DELTA_X;
        position.dy = -1 * DELTA_Y;
        if (is_fucose) {
          position.rotate = 0;
        }
        break;
      case 4:
        position.dx = 0;
        position.dy = -1 * DELTA_Y;
        if (is_fucose) {
          position.rotate = 180;
        }
        break;
      case 6:
        position.dx = 1 * DELTA_X;
        position.dy = -1 * DELTA_Y;
        if (is_fucose) {
          position.rotate = this.LINKS ? 206 : 225;
        }
        break;
      case 8:
        position.dx = 1 * DELTA_X;
        position.dy = 0;
        break;
    }
    return position;
  }
}
/* harmony default export */ const js_LinkageLayout = (LinkageLayout);
;// ./node_modules/glycan.js/js/FishEyeLayout.js


var FishEyeLayout_module_string = 'glycanjs:fisheyelayout';
var FishEyeLayout_log = debugAny(FishEyeLayout_module_string);
var radius = 2,
  distortion = 3,
  k0,
  k1,
  FishEyeLayout_focus = [-100, -3];
var residue_only = true;
function rescale() {
  k0 = Math.exp(distortion);
  k0 = k0 / (k0 - 1) * radius;
  k1 = distortion / radius;
}
rescale();
function fisheye(d) {
  var dx = d.x - FishEyeLayout_focus[0],
    dy = d.y - FishEyeLayout_focus[1],
    dd = Math.sqrt(dx * dx + dy * dy);
  if (!dd || dd >= radius) {
    return {
      x: d.x,
      y: d.y,
      z: dd >= radius ? 1 : 10
    };
  }
  var k = k0 * (1 - Math.exp(-dd * k1)) / dd * 0.75 + 0.25;
  return {
    x: FishEyeLayout_focus[0] + dx * k,
    y: FishEyeLayout_focus[1] + dy * k,
    z: Math.min(k, 10)
  };
}
var MakeFishEye = baseclass => {
  return class FishEyeLayout extends baseclass {
    static get focus() {
      return [].concat(FishEyeLayout_focus);
    }
    static set focus(newfocus) {
      FishEyeLayout_focus[0] = newfocus[0];
      FishEyeLayout_focus[1] = newfocus[1];
      rescale();
    }
    static get zoom() {
      return distortion;
    }
    static set zoom(zoom) {
      distortion = zoom;
      rescale();
    }
    static get lock_residues() {
      return residue_only;
    }
    static set lock_residues(flag) {
      residue_only = flag;
    }
    static PerformLayout(renderable) {
      FishEyeLayout_log('Performing FishEyeLayout');
      var layout = baseclass.PerformLayout.call(this, renderable);
      for (var res of renderable.composition()) {
        var position = layout.get(res);
        var _ref = [position.x, position.y, position.width, position.height],
          x = _ref[0],
          y = _ref[1],
          width = _ref[2],
          height = _ref[3];
        var scaled_center = fisheye({
          x: x + width / 2,
          y: y + height / 2
        });
        var scaled_top = fisheye({
          x: x + width / 2,
          y: y + height
        });
        var scaled_edge = fisheye({
          x: x + width,
          y: y + height / 2
        });
        var new_size = Math.max(2 * (scaled_top.y - scaled_center.y), 2 * (scaled_edge.x - scaled_center.x));
        if (residue_only) {
          position.x = position.x - (new_size - width) / 2;
          position.y = position.y - (new_size - height) / 2;
        } else {
          position.x = scaled_center.x - new_size / 2;
          position.y = scaled_center.y - new_size / 2;
        }
        position.z = scaled_center.z;
        position.width = new_size;
        position.height = new_size;
      }
      return layout;
    }
  };
};
/* harmony default export */ const FishEyeLayout = (MakeFishEye(SugarAwareLayout));

;// ./node_modules/glycan.js/js/SVGCanvas.js



var SVGCanvas_module_string = 'glycanjs:svgcanvas';
var SVGCanvas_log = debugAny(SVGCanvas_module_string);
var SVGNS = 'http://www.w3.org/2000/svg';
var PRECISION = 1;
var str = num => num.toFixed(PRECISION);

// Lazy symbol copies. A renderer's canvas used to receive a copy of every
// symbol in sugars.svg (~200 nodes) to draw the handful a glycan uses.
// Canvases that opt in instead keep a reference to the shared, parsed
// symbol sets (see SVGRenderer.AppendSymbols) and copy a symbol into their
// own <defs> the first time use() references it.
//
// Opt-in is per class, through an *own* static LAZY_SYMBOLS getter, so a
// subclass that looks symbols up in the canvas DOM itself (e.g.
// rough-glycan.js's RoughSVGCanvas) keeps getting the full copy until it
// declares LAZY_SYMBOLS and calls findSymbol() instead.
var lazy_canvases = new WeakMap(); // <svg> element -> its SVGCanvas
var lazy_state = Symbol('lazy_symbols');

// Per parsed symbol set (a detached <defs>): id -> <symbol>, built once.
var symbol_indexes = new WeakMap();
var symbol_index = source => {
  var index = symbol_indexes.get(source);
  if (!index) {
    index = new Map();
    for (var symbol of source.children) {
      var id = symbol.getAttribute('id');
      if (id && !index.has(id)) {
        index.set(id, symbol);
      }
    }
    symbol_indexes.set(source, index);
  }
  return index;
};
class SVGCanvas {
  constructor(container) {
    SVGCanvas_log.info('Creating canvas element');
    var is_defs = container.nodeName === 'DEFS';
    this.canvas = this.createElement(is_defs ? 'symbol' : 'svg', container.ownerDocument);
    this.canvas.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    container.appendChild(this.canvas);
    if (Object.prototype.hasOwnProperty.call(this.constructor, 'LAZY_SYMBOLS')) {
      // One object, only ever mutated: group() hands out Object.create(this)
      // proxies, and assigning a field through one would land on the proxy.
      this[lazy_state] = {
        sources: [],
        copies: new Map(),
        defs: null,
        wanted: new Set()
      };
      lazy_canvases.set(this.canvas, this);
    }
  }
  static get LAZY_SYMBOLS() {
    return true;
  }

  // The lazily-copying SVGCanvas drawing into `element`, if there is one.
  static lazyCanvasFor(element) {
    return lazy_canvases.get(element);
  }

  // Registers a parsed symbol set. Symbols already referenced by use()
  // before it arrived (AppendSymbols is async) are copied in now.
  addSymbolSource(source) {
    var state = this[lazy_state];
    if (state.sources.includes(source)) {
      return;
    }
    state.sources.push(source);
    for (var id of state.wanted) {
      this.findSymbol(id);
    }
  }

  // The <symbol> for `ref` ("#id" or "id") in this canvas, copying it in
  // from the registered symbol sets on first use. Earlier sources win,
  // matching document order when every set was copied in full.
  // Cost: a Map lookup when already copied; one deep clone the first time.
  findSymbol(ref) {
    var id = ref.replace(/^#/, '');
    var state = this[lazy_state];
    // No registered set: either no lazy state, or AppendSymbols ran from a
    // different copy of glycan.js (nested node_modules) and copied the full
    // set into the DOM instead - look there.
    if (!state || state.sources.length === 0) {
      var found = null;
      try {
        found = this.canvas.querySelector("#".concat(id));
      } catch (ex) {
        found = null;
      }
      if (!found && state) {
        // Drawn before AppendSymbols resolved: copy it in once it does.
        state.wanted.add(id);
      }
      return found;
    }
    var copy = state.copies.get(id);
    if (copy && this.canvas.contains(copy)) {
      return copy;
    }
    for (var source of state.sources) {
      var symbol = symbol_index(source).get(id);
      if (!symbol) {
        continue;
      }
      if (!state.defs || !this.canvas.contains(state.defs)) {
        state.defs = this.createElement('defs');
        this.canvas.appendChild(state.defs);
      }
      var imported = this.canvas.ownerDocument.importNode(symbol, true);
      state.defs.appendChild(imported);
      state.copies.set(id, imported);
      state.wanted.delete(id);
      return imported;
    }
    state.wanted.add(id);
    return null;
  }
  createElement(tag) {
    var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.canvas.ownerDocument;
    return doc.createElementNS(SVGNS, tag);
  }
  appendChild(element) {
    this.canvas.appendChild(element);
  }
  group(a_g) {
    if (!a_g) {
      a_g = this.canvas.ownerDocument.createElementNS(SVGNS, 'g');
      this.appendChild(a_g);
    }
    return Object.create(this, {
      appendChild: {
        value: el => a_g.appendChild(el)
      },
      setAttribute: {
        value: (name, val) => a_g.setAttribute(name, val)
      },
      setAttributeNS: {
        value: (ns, name, val) => a_g.setAttributeNS(ns, name, val)
      },
      element: {
        value: a_g
      }
    });
  }
  use(ref, x, y, width, height) {
    if (this[lazy_state]) {
      this.findSymbol(ref);
    }
    var a_use = this.canvas.ownerDocument.createElementNS(SVGNS, 'use');
    a_use.setAttribute('x', str(x));
    a_use.setAttribute('y', str(y));
    a_use.setAttribute('width', str(width));
    a_use.setAttribute('height', str(height));
    a_use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', ref);
    this.appendChild(a_use);
    return a_use;
  }
  rect(x, y, width, height) {
    var a_rect = this.canvas.ownerDocument.createElementNS(SVGNS, 'rect');
    a_rect.setAttribute('x', str(x));
    a_rect.setAttribute('y', str(y));
    a_rect.setAttribute('width', str(width));
    a_rect.setAttribute('height', str(height));
    this.appendChild(a_rect);
    return a_rect;
  }
  line(x, y, x2, y2) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var a_line = this.canvas.ownerDocument.createElementNS(SVGNS, 'line');
    a_line.setAttribute('x1', str(x));
    a_line.setAttribute('y1', str(y));
    a_line.setAttribute('x2', str(x2));
    a_line.setAttribute('y2', str(y2));
    for (var key of Object.keys(options)) {
      a_line.setAttribute(key, options[key]);
    }
    var fill_style = options.fill ? "fill: var(--fill-color,".concat(options.fill, ");") : '',
      stroke_style = options.stroke ? "stroke: var(--stroke-color,".concat(options.stroke, ");") : '',
      stroke_width = options['stroke-width'] ? "stroke-width: var(--stroke-width,".concat(options['stroke-width'], ")") : '';
    a_line.setAttribute('style', "".concat(fill_style).concat(stroke_style).concat(stroke_width));
    a_line.setAttribute('stroke-linecap', 'round');
    this.appendChild(a_line);
    return a_line;
  }
  text(x, y, text) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var a_text = this.canvas.ownerDocument.createElementNS(SVGNS, 'text');
    var a_tspan = this.canvas.ownerDocument.createElementNS(SVGNS, 'tspan');
    if (typeof text != 'string') {
      a_text.appendChild(text);
    } else {
      a_text.appendChild(a_tspan);
      a_tspan.textContent = text;
      a_tspan.setAttribute('dy', '0');
    }
    a_text.style.fontFamily = 'Helvetica, Verdana, Arial, Sans-serif';
    a_text.setAttribute('x', str(x));
    a_text.setAttribute('y', str(y));
    for (var optkey of ['font-size', 'text-anchor']) {
      if (options[optkey]) {
        a_text.setAttribute(optkey, options[optkey]);
      }
    }
    for (var _optkey of ['dy', 'dx']) {
      if (options[_optkey]) {
        a_tspan.setAttribute(_optkey, options[_optkey]);
      }
    }
    this.appendChild(a_text);
    return a_text;
  }
  sendToBack(element) {
    if (element.element) {
      element = element.element;
    }
    var parent = element.parentNode;
    parent.insertBefore(element, parent.firstChild);
    return element;
  }
  sendToFront(element) {
    if (element.element) {
      element = element.element;
    }
    var parent = element.parentNode;
    parent.insertBefore(element, null);
    return element;
  }
}
/* harmony default export */ const js_SVGCanvas = (SVGCanvas);
;// ./node_modules/glycan.js/js/Renderer.js




var Renderer_module_string = 'glycanjs:renderer';
var Renderer_log = debugAny(Renderer_module_string);
var canvas_symbol = Symbol('canvas');
var layout_cache = Symbol('cached_layout');
var layout_engine = Symbol('layout');
var rendered_sugars_symbol = Symbol('rendered_sugars');
var rendered_symbol = Symbol('rendered_elements');
var group_tag_symbol = Symbol('group_tag');
var rotate_symbol = Symbol('rotate');
var SCALE = 100;
var Renderer_PRECISION = 1;
var FULL_REFRESH = true;
var Renderer_str = num => num.toFixed(Renderer_PRECISION);
var BRACKET_STROKE_DEFAULT_COLOR = 'rgba(153,153,153,1)';
var LINKAGE_STROKE_DEFAULT_COLOR = 'light-dark(rgba(51,51,51,1), var(--text-color, #ddd))';
var calculate_moved_residues = function calculate_moved_residues(layout, residue) {
  if (!layout) {
    // We don't have a layout specified, so we
    // should skip moving any residues around!
    return false;
  }
  var current = this[layout_cache].get(residue);
  var updated = layout.get(residue);
  if (!current) {
    this[layout_cache].set(residue, layout.get(residue));
    return true;
  }
  this[layout_cache].set(residue, updated);
  return !(current.x === updated.x && current.y === updated.y && current.width === updated.width && current.height === updated.height && current.z === updated.z);
};
var generic_long_axis_size = res => res.height;
var generic_short_axis_size = res => res.width;
var render_link_label = function render_link_label(anomer, linkage, child_pos, parent_pos, canvas) {
  var ROTATE = this.rotate;
  var LTR = this.leftToRight;
  var get_long_axis_size = ROTATE ? generic_short_axis_size : generic_long_axis_size;
  var get_short_axis_size = ROTATE ? generic_long_axis_size : generic_short_axis_size;
  var fancy_anomer = '?';
  if (anomer === 'b') {
    fancy_anomer = '\u03B2';
  }
  if (anomer === 'a') {
    fancy_anomer = '\u03B1';
  }
  linkage = linkage || '?';
  if (linkage < 0) {
    linkage = '';
  }
  var child_cx = child_pos.x + child_pos.width / 2,
    child_cy = child_pos.y + child_pos.height / 2,
    parent_cx = parent_pos.x + parent_pos.width / 2,
    parent_cy = parent_pos.y + parent_pos.height / 2;
  var long_axis = ROTATE ? child_cx - parent_cx : child_cy - parent_cy;
  var short_axis = ROTATE ? child_cy - parent_cy : child_cx - parent_cx;
  var long_axis_size = get_long_axis_size(child_pos) + get_long_axis_size(parent_pos);
  var short_axis_base = ROTATE ? parent_cy : parent_cx;
  var long_axis_base = ROTATE ? child_pos.x : child_pos.y;
  var short_axis_direction = ROTATE ? child_pos.y - parent_pos.y : child_pos.x - parent_pos.x;
  var long_axis_direction = ROTATE ? child_pos.x - parent_pos.x : child_pos.y - parent_pos.y;
  var gradient = short_axis / long_axis;
  if (!isFinite(gradient)) {
    gradient = -1;
    if (short_axis_direction > 0) {
      gradient = 1;
    }
  }
  var residue_distance = long_axis;
  var ratio = 1;
  var child_distance = residue_distance * ratio;
  if (Math.abs(residue_distance) >= long_axis_size / 2) {
    residue_distance -= long_axis_size / 2;
    child_distance = residue_distance * ratio + get_long_axis_size(parent_pos) / 2;
  } else if (residue_distance == 0) {
    child_distance = 0.425 * Math.abs(short_axis);
  }
  var short_axis_pos = gradient * child_distance;
  if (short_axis_pos === 0) {
    short_axis_pos += get_short_axis_size(child_pos) / 10;
  }
  var short_axis_coord = SCALE * (short_axis_base + short_axis_pos);
  var long_axis_coord = SCALE * (long_axis_base + (LTR ? 0 : 1) * get_long_axis_size(child_pos));
  if (long_axis_direction === 0) {
    long_axis_coord = SCALE * (long_axis_base + get_long_axis_size(child_pos) / 8);
    if (long_axis_coord > SCALE / 4) {
      long_axis_coord = SCALE / 4;
    }
  }
  var label = this.renderLinkageLabel(canvas, ROTATE ? long_axis_coord : short_axis_coord, ROTATE ? short_axis_coord : long_axis_coord, fancy_anomer + linkage, ROTATE, short_axis_pos, Math.abs(gradient) < 1 ? LTR : false);
  canvas.sendToBack(label);
  return label;
};
var point_along_line = (x0, y0, x1, y1, t) => {
  return [(1 - t) * x0 + t * x1, (1 - t) * y0 + t * y1];
};
var perpendicular_line = (x0, y0, x1, y1, length) => {
  var x = y0 - y1; // as vector at 90 deg to the line
  var y = x1 - x0;
  var len = length / Math.hypot(x, y);
  x *= len;
  y *= len;
  return [x0 + x, y0 + y, x0 - x, y0 - y];
};
var half_perpendicular_line = (x0, y0, x1, y1, length) => {
  var x = y0 - y1; // as vector at 90 deg to the line
  var y = x1 - x0;
  var len = length / Math.hypot(x, y);
  x *= len;
  y *= len;
  return [x0 - x, y0 - y, x0, y0];
};
var render_linkage = function render_linkage(child_pos, parent_pos, child, parent, sugar, canvas) {
  var show_labels = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
  if (!parent_pos) {
    return;
  }
  var positions = [SCALE * (child_pos.x + child_pos.width / 2), SCALE * (child_pos.y + child_pos.height / 2), SCALE * (parent_pos.x + parent_pos.width / 2), SCALE * (parent_pos.y + parent_pos.height / 2)];
  var group = this.renderLinkageGroup(canvas, sugar, child);
  canvas.sendToBack(group);
  group.line(...positions, {
    'stroke-width': Renderer_str(SCALE / 100),
    'stroke': LINKAGE_STROKE_DEFAULT_COLOR
  });
  if (show_labels) {
    render_link_label.call(this, child.anomer, parent.linkageOf(child), child_pos, parent_pos, group);
  }
  var child_repeat = child instanceof Repeat.Monosaccharide && child.repeat.mode !== Repeat.MODE_EXPAND;
  var parent_repeat = parent instanceof Repeat.Monosaccharide && parent.repeat.mode !== Repeat.MODE_EXPAND;
  var different_repeats = child_repeat && parent_repeat && child.repeat !== parent.repeat;
  if (child_repeat && child.endsRepeatUnit && child.children.filter(res => ['Fuc', 'HSO3'].indexOf(res.identifier) < 0).length === 0) {
    var extents = [SCALE * (child_pos.x + child_pos.width / 2), SCALE * (child_pos.y + child_pos.height / 2), SCALE * (parent_pos.x + parent_pos.width / 2), SCALE * (parent_pos.y + parent_pos.height / 2)];
    var reverse_cap = -1;
    var bracket_scale = 0.25;
    if (child_pos.x - parent_pos.x !== 0 && child_pos.y - parent_pos.y !== 0) {
      bracket_scale = 1 / 4;
    }
    var bracket_position = point_along_line(...extents, -0.5);
    var perpendicular = perpendicular_line(bracket_position[0], bracket_position[1], extents[2], extents[3], SCALE * child_pos.width * bracket_scale);
    var cap = half_perpendicular_line(...perpendicular, reverse_cap * SCALE * child_pos.width / 8);
    var cap_end = half_perpendicular_line(perpendicular[2], perpendicular[3], perpendicular[0], perpendicular[1], reverse_cap * -1 * SCALE * child_pos.width / 8);
    group.line(...perpendicular, {
      'stroke-width': Renderer_str(5 * SCALE / 100),
      'stroke': BRACKET_STROKE_DEFAULT_COLOR
    });
    group.line(...cap, {
      'stroke-width': Renderer_str(5 * SCALE / 100),
      'stroke': BRACKET_STROKE_DEFAULT_COLOR
    });
    group.line(...cap_end, {
      'stroke-width': Renderer_str(5 * SCALE / 100),
      'stroke': BRACKET_STROKE_DEFAULT_COLOR
    });
  }
  if (child_repeat ? !parent_repeat || different_repeats : parent_repeat) {
    // This line should go to the edges of the icons along the long (y-axis)
    var _extents = [SCALE * (child_pos.x + child_pos.width / 2), SCALE * (child_pos.y + child_pos.height / 2), SCALE * (parent_pos.x + parent_pos.width / 2), SCALE * (parent_pos.y + parent_pos.height / 2)];
    var _reverse_cap = child_repeat ? 1 : -1;
    var _bracket_scale = 0.25;
    if (child_pos.x - parent_pos.x !== 0 && child_pos.y - parent_pos.y !== 0) {
      _bracket_scale = 1 / 4;
    }
    var _bracket_position = point_along_line(..._extents, _reverse_cap > 0 ? 0.55 : 0.5);
    var _perpendicular = perpendicular_line(_bracket_position[0], _bracket_position[1], _extents[2], _extents[3], SCALE * child_pos.width * _bracket_scale);
    var _cap = half_perpendicular_line(..._perpendicular, _reverse_cap * SCALE * child_pos.width / 8);
    var _cap_end = half_perpendicular_line(_perpendicular[2], _perpendicular[3], _perpendicular[0], _perpendicular[1], _reverse_cap * -1 * SCALE * child_pos.width / 8);
    group.line(..._perpendicular, {
      'stroke-width': Renderer_str(5 * SCALE / 100),
      'stroke': BRACKET_STROKE_DEFAULT_COLOR
    });
    group.line(..._cap, {
      'stroke-width': Renderer_str(5 * SCALE / 100),
      'stroke': BRACKET_STROKE_DEFAULT_COLOR
    });
    group.line(..._cap_end, {
      'stroke-width': Renderer_str(5 * SCALE / 100),
      'stroke': BRACKET_STROKE_DEFAULT_COLOR
    });
    if (child_repeat) {
      group.text(_cap[2], _cap[3], child.repeat.identifier, {
        'font-size': Renderer_str(Math.floor(SCALE / 3)),
        'text-anchor': this.rotate ? 'middle' : 'end',
        'dy': this.rotate ? '1em' : '0.25em',
        'dx': this.rotate ? '-0.25em' : '-0.25em'
      });
    }
  }
  return group;
};
var cleanup_residues = function cleanup_residues(active_residues) {
  var active = new Set(active_residues);
  // `this.rendered` holds both sugar-level entries (keyed by the Sugar
  // object itself, set in setupContainer/fromSVGElement) and residue-level
  // entries (keyed by each Monosaccharide) - only the latter should ever be
  // torn down here. Checking tracked-sugar membership instead of
  // `res instanceof Monosaccharide` avoids a cross-module instanceof
  // mismatch: a residue class built via Mass(base)'s
  // `class MonosaccharideMass extends base.Monosaccharide` can fail
  // `instanceof Monosaccharide` if bundling ends up with two copies of
  // Monosaccharide.js (e.g. a symlinked package dependency resolved via two
  // different real/symlinked paths) - when that happens every residue is
  // silently treated as "not a residue" and never cleaned up, leaving the
  // previous glycan's elements in the DOM forever.
  var sugars = new Set(this[rendered_sugars_symbol]);
  for (var res of this.rendered.keys()) {
    if (sugars.has(res)) {
      continue;
    }
    if (!active.has(res)) {
      var elements = this.rendered.get(res);
      this.removeRendered(elements);
      this.rendered.delete(res);
    }
  }
};
var layout_sugar = function layout_sugar(sugar, layout_engine) {
  if (!layout_engine) {
    Renderer_log.info('No layout engine specified, skipping layout');
    return;
  }
  Renderer_log.info('Laying out', sugar.sequence);
  var layout = layout_engine.PerformLayout(sugar);
  layout.calculateIdentifier = layout_engine.CalculateIdentifier;
  return layout;
};
var render_sugar = function render_sugar(sugar, layout) {
  var new_residues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : sugar.composition();
  var xvals = [];
  var yvals = [];
  var container = this.rendered.get(sugar);
  var ROTATE = this.rotate;
  var LTR = this.leftToRight;

  // Setup container and set up tagging

  container = this.setupContainer(container, sugar);
  if (new_residues.length < 1) {
    return;
  }
  var zindices = [];
  for (var residue of layout ? new_residues : []) {
    var position = layout.get(residue);
    if (!position) {
      continue;
    }
    var xval = position.x;
    var yval = position.y;
    if (ROTATE) {
      position.x = LTR ? -1 * (yval + position.height) : yval;
      position.y = LTR ? xval : -1 * (xval + position.width);
    }
    var rotate_angle = 0;
    if (position.rotate) {
      rotate_angle = position.rotate;
    }
    if (ROTATE && !position.keep_horizontal) {
      rotate_angle -= LTR ? -90 : 90;
    }
    xvals.push(position.x);
    xvals.push(position.x + position.width);
    yvals.push(position.y);
    yvals.push(position.y + position.height);
    var icon = null;
    var current = this.rendered.get(residue);
    if (!current) {
      // Render icon
      icon = this.renderIcon(container, layout.calculateIdentifier(residue), residue, sugar, rotate_angle);
      current = {
        residue: icon,
        linkage: null
      };
      this.rendered.set(residue, current);
    } else {
      icon = current.residue;
    }
    if (position.z !== 1) {
      zindices.push({
        z: position.z,
        icon: icon
      });
    }
    var show_labels = this[layout_engine].LINKS == true;
    if (current.linkage) {
      // Remove linkage
      this.removeRendered({
        linkage: current.linkage
      });
    }

    // Render linkage
    current.linkage = this.renderLinkage(position, residue.parent ? layout.get(residue.parent) : undefined, residue, residue.parent, sugar, container, show_labels && residue.identifier !== 'HSO3');
    this.setIconPosition(icon, position.x * SCALE, position.y * SCALE, position.width * SCALE, position.height * SCALE, rotate_angle);
  }
  var correct_order = zindices.map(z => z.icon.element).map(el => [...el.parentNode.children].indexOf(el)).map((v, i, a) => v - (a[i - 1] || 0)).map(v => v >= 0).reduce((curr, next) => curr && next, true);
  if (!correct_order) {
    for (var zindex of zindices.sort((a, b) => a.z - b.z)) {
      container.sendToFront(zindex.icon);
    }
  }
  if (this.groupTag && container.tagGroup) {
    var els_to_render = [];
    for (var _residue of sugar.composition_for_tag(this.groupTag)) {
      var rendered_els = this.rendered.get(_residue);
      if (!rendered_els) {
        continue;
      }
      if (rendered_els.linkage) {
        container.tagGroup.appendChild(rendered_els.linkage);
      }
      els_to_render.push(rendered_els.residue);
    }
    for (var el of els_to_render) {
      container.tagGroup.appendChild(el.element);
    }
  }
  return container;
};
class Renderer {
  constructor(container, layout) {
    if (container && layout) {
      this.LayoutEngine = layout;
      this[layout_cache] = new WeakMap();
    }
    this[rendered_sugars_symbol] = [];
    this[rendered_symbol] = new Map();
  }
  get LayoutEngine() {
    return this[layout_engine];
  }
  set LayoutEngine(engine) {
    this[layout_engine] = engine;
  }
  static get GLOBAL_SCALE() {
    return SCALE;
  }
  get element() {
    return this[canvas_symbol];
  }
  set element(el) {
    this[canvas_symbol] = el;
  }
  get rendered() {
    return this[rendered_symbol];
  }
  set groupTag(tag) {
    if (tag !== this[group_tag_symbol]) {
      this.resetTags();
    }
    this[group_tag_symbol] = tag;
  }
  get groupTag() {
    return this[group_tag_symbol];
  }
  addSugar(sugar) {
    this[rendered_sugars_symbol].push(sugar);
  }
  removeAllSugars() {
    cleanup_residues.bind(this)([]);
    // cleanup_residues leaves the sugar-level entries alone (each sugar's
    // own container group, see setupContainer); without this their empty
    // groups stayed in the canvas, one more per sugar on every reuse.
    for (var sugar of this[rendered_sugars_symbol]) {
      var _this$rendered$get;
      var element = (_this$rendered$get = this.rendered.get(sugar)) === null || _this$rendered$get === void 0 ? void 0 : _this$rendered$get.element;
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
    this.rendered.clear();
    this[rendered_sugars_symbol].length = 0;
  }
  get sugars() {
    return Object.freeze([].concat(this[rendered_sugars_symbol]));
  }
  layoutFor(sugarElement) {
    if (!this.global_layout.has(sugarElement)) {
      return;
    }
    var _this$global_layout$g = this.global_layout.get(sugarElement),
      x = _this$global_layout$g.x,
      y = _this$global_layout$g.y,
      width = _this$global_layout$g.width,
      height = _this$global_layout$g.height;
    return {
      x,
      y,
      width,
      height
    };
  }
  refresh() {
    cleanup_residues.bind(this)(Array.prototype.concat(...this[rendered_sugars_symbol].map(sug => sug.composition())));
    this.global_layout = new WeakMap();
    for (var sugar of this[rendered_sugars_symbol]) {
      var layout = layout_sugar(sugar, this[layout_engine]);
      if (layout) {
        for (var sugarEl of [sugar, ...sugar.composition()]) {
          this.global_layout.set(sugarEl, layout.get(sugarEl));
        }
      }
      var modified_residues = FULL_REFRESH ? sugar.composition() : sugar.composition().filter(calculate_moved_residues.bind(this, layout));
      render_sugar.bind(this)(sugar, layout, modified_residues);
    }
    return Promise.resolve();
  }
  appendSymbols() {
    this.constructor.AppendSymbols(this);
  }
  setupContainer() {}
  resetTags() {}
  removeRendered() {}
  renderIcon() {}
  renderLinkageLabel() {}
  renderLinkage() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return render_linkage.call(this, ...args);
  }
  get horizontal() {
    return this[rotate_symbol];
  }
  set horizontal(flag) {
    if (flag) {
      this[rotate_symbol] = true;
    } else {
      this[rotate_symbol] = false;
    }
  }
}


/* harmony default export */ const js_Renderer = (Renderer);
;// ./node_modules/glycan.js/sugars.svg
/* harmony default export */ const sugars = ("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"50 50 500 1700\">\n<!--\nRGB settings for SNFG\nWhite  #fff\nBlue  #0090bc\nGreen  #00a651\nYellow  #ffd400\nLight blue  #8fcce9\nPink  #f69ea1\nPurple  #a54399\nBrown  #a17a4d\nOrange  #f47920\nRed  #ed1c24\n-->\n  <defs>\n    <symbol id=\"hexnac_base\" viewBox=\"0 0 100 100\">\n      <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" style=\"fill: var(--fill-color); stroke: var(--stroke-color); stroke-width: var(--stroke-width);\" />\n    </symbol>\n    <symbol id=\"hex_base\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" r=\"40\" style=\"fill: var(--fill-color); stroke: var(--stroke-color); stroke-width: var(--stroke-width);\"/>\n    </symbol>\n    <symbol id=\"sia_base\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,5 95,50 50,95 5,50 z\" style=\"fill: var(--fill-color); stroke: var(--stroke-color); stroke-width: var(--stroke-width);\"/>\n    </symbol>\n    <symbol id=\"hexnac\" viewBox=\"0 0 100 100\">\n      <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#fff\" stroke-width=\"3\" stroke=\"#000\"/>\n    </symbol>\n    <symbol id=\"galnac\" viewBox=\"0 0 100 100\">\n      <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#ffd400\" stroke-width=\"1\" stroke=\"#000\"/>\n    </symbol>\n    <symbol id=\"glcnac\" viewBox=\"0 0 100 100\">\n      <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#0090bc\" stroke-width=\"1\" stroke=\"#000\"/>\n    </symbol>\n    <symbol id=\"mannac\" viewBox=\"0 0 100 100\">\n      <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#00a651\" stroke-width=\"1\" stroke=\"#000\"/>\n    </symbol>\n    <symbol id=\"man\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#00a651\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n    </symbol>\n    <symbol id=\"man6p\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"75\" fill=\"#00a651\" r=\"20\" stroke-width=\"1\" stroke=\"#000\"/>\n      <text x=\"50\" y=\"25\" text-anchor=\"middle\" stroke=\"#000\" stroke-width=\"2\" dy=\".35em\" dx=\"0.05em\" font-size=\"25\">P</text>\n    </symbol>\n    <symbol id=\"glc\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#0090bc\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n    </symbol>\n    <symbol id=\"gal\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#ffd400\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n    </symbol>\n    <symbol id=\"hex\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fff\" r=\"40\" stroke-width=\"3\" stroke=\"#000\"/>\n    </symbol>\n    <symbol id=\"l-hex\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fff\" r=\"40\" stroke-width=\"3\" stroke=\"#000\"/>\n      <path d=\"M28.6,36.92h2.75l-3.8,23.85h10.29l-.51,3.23h-13.04l4.31-27.08Z\" fill=\"#fff\"/>\n    </symbol>\n    <symbol id=\"d-hex\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fff\" r=\"40\" stroke-width=\"3\" stroke=\"#000\"/>\n      <path d=\"M26.37,36.92h8.23c2.79,0,4.75,1.32,5.86,3.96,1,2.38,1.19,5.44.59,9.16-.45,2.88-1.27,5.47-2.46,7.8-2.07,4.1-4.85,6.16-8.34,6.16h-8.2l4.31-27.08ZM30.23,60.87c.93,0,1.71-.13,2.35-.39,1.14-.48,2.17-1.4,3.07-2.76.72-1.09,1.33-2.49,1.84-4.2.3-1.02.53-1.96.66-2.84.53-3.35.45-5.95-.26-7.81s-2.17-2.78-4.39-2.78h-4.88l-3.3,20.77h4.91Z\" fill=\"#fff\"/>\n    </symbol>\n    <symbol id=\"neu\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,5 95,50 50,95 5,50 z\" fill=\"#ed1c24\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"neuac\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,5 95,50 50,95 5,50 z\" fill=\"#a54399\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"neugc\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,5 95,50 50,95 5,50 z\" fill=\"#8fcce9\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"fuc\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,15 90,90 10,90 z\" fill=\"#ed1c24\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"d-fuc\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,15 90,90 10,90 z\" fill=\"#ed1c24\" stroke=\"#000\" stroke-width=\"1\"/>\n        <path d=\"M32.37,48.92h8.23c2.79,0,4.75,1.32,5.86,3.96,1,2.38,1.19,5.44.59,9.16-.45,2.88-1.27,5.47-2.46,7.8-2.07,4.1-4.85,6.16-8.34,6.16h-8.2l4.31-27.08ZM36.23,72.87c.93,0,1.71-.13,2.35-.39,1.14-.48,2.17-1.4,3.07-2.76.72-1.09,1.33-2.49,1.84-4.2.3-1.02.53-1.96.66-2.84.53-3.35.45-5.95-.26-7.81s-2.17-2.78-4.39-2.78h-4.88l-3.3,20.77h4.91Z\" fill=\"#fff\"/>\n    </symbol>\n    <symbol id=\"fucnac\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,15 90,90 50,90 z\" fill=\"#ed1c24\" stroke=\"#000\" stroke-width=\"1\"/>\n      <path d=\"M50,15 50,90 10,90 z\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"rha\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,15 90,90 10,90 z\" fill=\"#00a651\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"d-rha\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,15 90,90 10,90 z\" fill=\"#00a651\" stroke=\"#000\" stroke-width=\"1\"/>\n        <path d=\"M32.37,48.92h8.23c2.79,0,4.75,1.32,5.86,3.96,1,2.38,1.19,5.44.59,9.16-.45,2.88-1.27,5.47-2.46,7.8-2.07,4.1-4.85,6.16-8.34,6.16h-8.2l4.31-27.08ZM36.23,72.87c.93,0,1.71-.13,2.35-.39,1.14-.48,2.17-1.4,3.07-2.76.72-1.09,1.33-2.49,1.84-4.2.3-1.02.53-1.96.66-2.84.53-3.35.45-5.95-.26-7.81s-2.17-2.78-4.39-2.78h-4.88l-3.3,20.77h4.91Z\" fill=\"#fff\"/>\n    </symbol>\n    <symbol id=\"ara\" viewBox=\"0 0 100 100\">\n<polyline fill=\"#00a651\" stroke=\"#000\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" points=\"\n  67.802,60.462 78.803,94.32 50.001,69.823 21.196,94.322 32.199,60.462 3.386,39.531 38.999,39.534 50,5.678 61.002,39.536 96.615,39.539 67.804,60.462 \"/>\n    </symbol>\n    <symbol id=\"d-ara\" viewBox=\"0 0 100 100\">\n      <polyline fill=\"#00a651\" stroke=\"#000\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" points=\"\n  67.802,60.462 78.803,94.32 50.001,69.823 21.196,94.322 32.199,60.462 3.386,39.531 38.999,39.534 50,5.678 61.002,39.536 96.615,39.539 67.804,60.462 \"/>\n      <path d=\"M32.37,48.92h8.23c2.79,0,4.75,1.32,5.86,3.96,1,2.38,1.19,5.44.59,9.16-.45,2.88-1.27,5.47-2.46,7.8-2.07,4.1-4.85,6.16-8.34,6.16h-8.2l4.31-27.08ZM36.23,72.87c.93,0,1.71-.13,2.35-.39,1.14-.48,2.17-1.4,3.07-2.76.72-1.09,1.33-2.49,1.84-4.2.3-1.02.53-1.96.66-2.84.53-3.35.45-5.95-.26-7.81s-2.17-2.78-4.39-2.78h-4.88l-3.3,20.77h4.91Z\" fill=\"#fff\"/>\n    </symbol>\n    <symbol id=\"d-araf\" viewBox=\"0 0 100 100\">\n<polyline fill=\"#00a651\" stroke=\"#000\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" points=\"\n  67.802,60.462 78.803,94.32 50.001,69.823 21.196,94.322 32.199,60.462 3.386,39.531 38.999,39.534 50,5.678 61.002,39.536 96.615,39.539 67.804,60.462 \"/>\n    <path stroke=\"#fff\" fill=\"#fff\" stroke-width=\"0\" d=\"M51.2,39.9L50.3,44h-3.6L46,47.5h3.6L44.8,70h4.3l4.8-22.6h4.4l0.7-3.5h-4.3c0.6-2.8,1.1-4.6,1.5-5.3\n      c0.4-0.7,1.3-1,2.6-1c0.2,0,0.4,0,0.6,0c0.2,0,0.5,0,1,0.1l0.9-4c-0.4,0-0.7-0.1-1-0.1c-0.3,0-0.6,0-0.9,0c-2.9,0-5.1,0.7-6.4,2.2\n      C52.3,36.8,51.7,38.1,51.2,39.9z\"/>\n      <path d=\"M32.37,48.92h8.23c2.79,0,4.75,1.32,5.86,3.96,1,2.38,1.19,5.44.59,9.16-.45,2.88-1.27,5.47-2.46,7.8-2.07,4.1-4.85,6.16-8.34,6.16h-8.2l4.31-27.08ZM36.23,72.87c.93,0,1.71-.13,2.35-.39,1.14-.48,2.17-1.4,3.07-2.76.72-1.09,1.33-2.49,1.84-4.2.3-1.02.53-1.96.66-2.84.53-3.35.45-5.95-.26-7.81s-2.17-2.78-4.39-2.78h-4.88l-3.3,20.77h4.91Z\" fill=\"#fff\"/>\n    </symbol>\n    <symbol id=\"araf\" viewBox=\"0 0 100 100\">\n<polyline fill=\"#00a651\" stroke=\"#000\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" points=\"\n  67.802,60.462 78.803,94.32 50.001,69.823 21.196,94.322 32.199,60.462 3.386,39.531 38.999,39.534 50,5.678 61.002,39.536 96.615,39.539 67.804,60.462 \"/>\n    <path stroke=\"#fff\" fill=\"#fff\" stroke-width=\"0\" d=\"M51.2,39.9L50.3,44h-3.6L46,47.5h3.6L44.8,70h4.3l4.8-22.6h4.4l0.7-3.5h-4.3c0.6-2.8,1.1-4.6,1.5-5.3\n      c0.4-0.7,1.3-1,2.6-1c0.2,0,0.4,0,0.6,0c0.2,0,0.5,0,1,0.1l0.9-4c-0.4,0-0.7-0.1-1-0.1c-0.3,0-0.6,0-0.9,0c-2.9,0-5.1,0.7-6.4,2.2\n      C52.3,36.8,51.7,38.1,51.2,39.9z\"/>\n    </symbol>\n    <symbol id=\"galf\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#ffd400\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      <path stroke=\"#fff\" fill=\"#fff\" stroke-width=\"0\" d=\"M51.2,39.9L50.3,44h-3.6L46,47.5h3.6L44.8,70h4.3l4.8-22.6h4.4l0.7-3.5h-4.3c0.6-2.8,1.1-4.6,1.5-5.3\n        c0.4-0.7,1.3-1,2.6-1c0.2,0,0.4,0,0.6,0c0.2,0,0.5,0,1,0.1l0.9-4c-0.4,0-0.7-0.1-1-0.1c-0.3,0-0.6,0-0.9,0c-2.9,0-5.1,0.7-6.4,2.2\n        C52.3,36.8,51.7,38.1,51.2,39.9z\"/>\n    </symbol>\n    <symbol id=\"d-galf\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#ffd400\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      <path stroke=\"#fff\" fill=\"#fff\" stroke-width=\"0\" d=\"M51.2,39.9L50.3,44h-3.6L46,47.5h3.6L44.8,70h4.3l4.8-22.6h4.4l0.7-3.5h-4.3c0.6-2.8,1.1-4.6,1.5-5.3\n        c0.4-0.7,1.3-1,2.6-1c0.2,0,0.4,0,0.6,0c0.2,0,0.5,0,1,0.1l0.9-4c-0.4,0-0.7-0.1-1-0.1c-0.3,0-0.6,0-0.9,0c-2.9,0-5.1,0.7-6.4,2.2\n        C52.3,36.8,51.7,38.1,51.2,39.9z\"/>\n      <path d=\"M26.37,36.92h8.23c2.79,0,4.75,1.32,5.86,3.96,1,2.38,1.19,5.44.59,9.16-.45,2.88-1.27,5.47-2.46,7.8-2.07,4.1-4.85,6.16-8.34,6.16h-8.2l4.31-27.08ZM30.23,60.87c.93,0,1.71-.13,2.35-.39,1.14-.48,2.17-1.4,3.07-2.76.72-1.09,1.33-2.49,1.84-4.2.3-1.02.53-1.96.66-2.84.53-3.35.45-5.95-.26-7.81s-2.17-2.78-4.39-2.78h-4.88l-3.3,20.77h4.91Z\" fill=\"#fff\"/>\n    </symbol>\n    <symbol id=\"xyl\" viewBox=\"0 0 100 100\">\n<polyline fill=\"#f47920\" stroke=\"#000\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" points=\"\n  67.802,60.462 78.803,94.32 50.001,69.823 21.196,94.322 32.199,60.462 3.386,39.531 38.999,39.534 50,5.678 61.002,39.536 96.615,39.539 67.804,60.462 \"/>\n    </symbol>\n    <symbol id=\"rib\" viewBox=\"0 0 100 100\">\n<polyline fill=\"#f69ea1\" stroke=\"#000\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" points=\"\n  67.802,60.462 78.803,94.32 50.001,69.823 21.196,94.322 32.199,60.462 3.386,39.531 38.999,39.534 50,5.678 61.002,39.536 96.615,39.539 67.804,60.462 \"/>\n    </symbol>\n    <symbol id=\"rbo\" viewBox=\"0 0 100 100\">\n<polyline fill=\"#f69ea1\" stroke=\"#000\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" points=\"\n  67.802,60.462 78.803,94.32 50.001,69.823 21.196,94.322 32.199,60.462 3.386,39.531 38.999,39.534 50,5.678 61.002,39.536 96.615,39.539 67.804,60.462 \"/>\n    <path stroke=\"#fff\" fill=\"#fff\" d=\"M52.7,48.3c-0.9-1.1-2.2-1.7-3.9-1.7c-1.9,0-3.5,0.7-4.9,2c-1.4,1.3-2.3,3.1-2.8,5.2\n      c-0.4,2.1-0.2,3.7,0.5,4.9c0.8,1.2,2.1,1.8,3.9,1.8c2.2,0,3.9-0.7,5.2-2.1c1.3-1.4,2.2-3.1,2.6-5.2C53.8,51.1,53.6,49.4,52.7,48.3\n      z M49.4,57c-0.8,1.1-1.9,1.7-3.4,1.7c-1.3,0-2.2-0.5-2.6-1.4c-0.4-0.9-0.5-2.1-0.2-3.5c0.3-1.4,0.9-2.7,1.7-3.7\n      c0.8-1,1.9-1.5,3.3-1.5c1.5,0,2.5,0.6,2.8,1.8c0.2,0.8,0.2,1.8,0,3C50.7,54.7,50.2,55.9,49.4,57z\"/>\n    <path stroke=\"#fff\" fill=\"#fff\" d=\"M54.6,60.1h2.2l3.8-17.9h-2.2L54.6,60.1z\"/>\n    </symbol>\n    <symbol id=\"hexa\" viewBox=\"0 0 100 100\">\n      <polyline transform=\"rotate(90,50,50)\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"1\" points=\"50,5 95,50 5,50 50,5\"/>\n      <polyline transform=\"rotate(90,50,50)\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"1\" points=\"50,95 95,50 5,50 50,95\"/>\n    </symbol>\n    <symbol id=\"glca\" viewBox=\"0 0 100 100\">\n      <polyline transform=\"rotate(90,50,50)\" fill=\"#0090bc\" stroke=\"#000\" stroke-width=\"1\" points=\"50,5 95,50 5,50 50,5\"/>\n      <polyline transform=\"rotate(90,50,50)\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"1\" points=\"50,95 95,50 5,50 50,95\"/>\n    </symbol>\n    <symbol id=\"gala\" viewBox=\"0 0 100 100\">\n      <polyline transform=\"rotate(90,50,50)\" fill=\"#ffd400\" stroke=\"#000\" stroke-width=\"1\" points=\"50,5 95,50 5,50 50,5\"/>\n      <polyline transform=\"rotate(90,50,50)\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"1\" points=\"50,95 95,50 5,50 50,95\"/>\n    </symbol>\n    <symbol id=\"glcn\" viewBox=\"0 0 100 100\">\n      <polyline fill=\"#0090bc\" stroke=\"#000\" stroke-width=\"1\" points=\"10,10 90,10 90,90 10,10\"/>\n      <polyline fill=\"#fff\" stroke=\"#000\" stroke-width=\"1\" points=\"10,10 90,90 10,90 10,10\"/>\n    </symbol>\n    <symbol id=\"idoa\" viewBox=\"0 0 100 100\">\n      <polyline transform=\"rotate(90,50,50)\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"1\" points=\"50,5 95,50 5,50 50,5\"/>\n      <polyline transform=\"rotate(90,50,50)\" fill=\"#a17a4d\" stroke=\"#000\" stroke-width=\"1\" points=\"50,95 95,50 5,50 50,95\"/>\n    </symbol>\n    <symbol id=\"cer\" viewBox=\"0 0 100 100\">\n      <path fill=\"#fff\" stroke=\"#000\" stroke-width=\"4\" stroke-linecap=\"round\" d=\"M35.8,15 64.2,15 75.5,27.2 64.2,38.3 75.5,50 64.2,61.1 75.5,72 64.2,83 75.5,94 L75.5,110 L35.8,110\"/>\n      <path fill=\"#fff\" stroke=\"#999\" stroke-width=\"4\" stroke-linecap=\"round\"  d=\"M35.8,15 24.5,27.2 35.8,38.3 24.5,50 35.8,61.1 24.5,72 35.8,83 24.5,94\"/>\n    </symbol>\n    <!--\n    <symbol id=\"man(a1-2)man\" viewBox=\"0 0 100 100\">\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"0\" width=\"100\" height=\"50\">\n        <circle cx=\"50\" cy=\"50\" fill=\"#00a651\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"50\" width=\"100\" height=\"50\">\n        <circle cx=\"50\" cy=\"50\" fill=\"#00a651\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n    </symbol>\n    <symbol id=\"neuac(a2-3)gal(b1-3)galnac\" viewBox=\"0 0 100 100\">\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"0\" width=\"100\" height=\"33\">\n        <rect x=\"17\" y=\"17\" transform=\"rotate(45,50,50)\" fill=\"#a54399\" stroke=\"#000\" stroke-width=\"1\" width=\"66\" height=\"66\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"33\" width=\"100\" height=\"33\">\n        <circle cx=\"50\" cy=\"50\" fill=\"#ffd400\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"66\" width=\"100\" height=\"33\">\n        <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#ffd400\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n    </symbol>\n    <symbol id=\"gal(b1-3)galnac\" viewBox=\"0 0 100 100\">\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"0\" width=\"100\" height=\"50\">\n        <circle cx=\"50\" cy=\"50\" fill=\"#ffd400\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"50\" width=\"100\" height=\"50\">\n        <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#ffd400\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n    </symbol>\n    <symbol id=\"glcnac(b1-4)glcnac\" viewBox=\"0 0 100 100\">\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"0\" width=\"100\" height=\"50\">\n        <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#0090bc\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"50\" width=\"100\" height=\"50\">\n        <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#0090bc\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n    </symbol>\n    <symbol id=\"man(a1-3)[man(a1-6)]man(b1-4)glcnac(b1-4)glcnac\" viewBox=\"0 0 100 100\">\n      <svg viewBox=\"0 0 100 100\" x=\"50\" y=\"0\" width=\"25\" height=\"25\">\n        <circle cx=\"50\" cy=\"50\" fill=\"#00a651\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"25\" y=\"0\" width=\"25\" height=\"25\">\n        <circle cx=\"50\" cy=\"50\" fill=\"#00a651\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"37.5\" y=\"25\" width=\"25\" height=\"25\">\n        <circle cx=\"50\" cy=\"50\" fill=\"#00a651\" r=\"40\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"37.5\" y=\"50\" width=\"25\" height=\"25\">\n        <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#0090bc\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"37.5\" y=\"75\" width=\"25\" height=\"25\">\n        <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#0090bc\" stroke-width=\"1\" stroke=\"#000\"/>\n      </svg>\n    </symbol>\n    <symbol id=\"glcnac(b1-4)glcnac.potential\" viewBox=\"0 0 100 100\">\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"0\" width=\"100\" height=\"50\">\n        <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#67a2fc\" stroke-width=\"0\" stroke=\"#000\"/>\n      </svg>\n      <svg viewBox=\"0 0 100 100\" x=\"0\" y=\"50\" width=\"100\" height=\"50\">\n        <rect x=\"10\" y=\"10\" width=\"80\" height=\"80\" fill=\"#67a2fc\" stroke-width=\"0\" stroke=\"#000\"/>\n      </svg>\n    </symbol>\n    -->\n    <symbol id=\"phospho\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fff\" r=\"48\" stroke-width=\"3\" stroke=\"#000\"/>\n      <text x=\"50\" y=\"50\" text-anchor=\"middle\" stroke=\"#000\" stroke-width=\"2\" dy=\".35em\" dx=\"0.05em\" font-size=\"50\">P</text>\n    </symbol>\n    <symbol id=\"hso3\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fdbbbb\" r=\"35\" stroke-width=\"4\" stroke=\"#aa3030\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M38.8,62.4c1.2,1.9,3,3.3,5.2,4.3c2.2,0.9,4.9,1.4,8.1,1.4c2.6,0,4.9-0.5,6.9-1.4c2-0.9,3.6-2.2,4.7-3.9\n        c1.1-1.7,1.6-3.5,1.6-5.4c0-1.9-0.5-3.6-1.5-5.1c-1-1.5-2.5-2.7-4.6-3.6c-1.4-0.7-4.1-1.4-7.9-2.3c-3.8-0.9-6.2-1.7-7.1-2.6\n        c-0.9-0.8-1.4-1.9-1.4-3.2c0-1.5,0.7-2.7,2-3.8c1.3-1,3.4-1.6,6.3-1.6c2.8,0,4.8,0.6,6.2,1.7c1.4,1.2,2.2,2.9,2.5,5.1l4.5-0.3\n        c-0.1-2.1-0.7-4-1.8-5.6c-1.1-1.7-2.6-2.9-4.7-3.8s-4.4-1.3-7-1.3c-2.4,0-4.6,0.4-6.6,1.2c-2,0.8-3.5,2-4.5,3.6\n        c-1,1.6-1.5,3.3-1.5,5.1c0,1.6,0.4,3.1,1.3,4.5c0.8,1.3,2.1,2.4,3.8,3.3c1.3,0.7,3.6,1.4,6.9,2.2c3.3,0.8,5.4,1.4,6.4,1.7\n        c1.5,0.6,2.6,1.3,3.2,2.1c0.7,0.8,1,1.8,1,2.9c0,1.1-0.3,2.1-1,3.1c-0.7,0.9-1.7,1.7-3.1,2.2c-1.4,0.5-3,0.8-4.8,0.8\n        c-2,0-3.9-0.4-5.5-1.1c-1.6-0.7-2.8-1.6-3.6-2.8c-0.8-1.1-1.3-2.6-1.5-4.4L36.8,56C36.9,58.4,37.5,60.5,38.8,62.4z\"/>\n    </symbol>\n    <symbol id=\"hso3.2\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fdbbbb\" r=\"35\" stroke-width=\"4\" stroke=\"#aa3030\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M36.9,58.1c0.3-0.5,0.7-1,1.1-1.4s1.5-1.4,3-2.7c1.9-1.6,3.2-2.9,4.1-3.8s1.4-1.8,1.8-2.6s0.5-1.7,0.5-2.5\n        c0-1.7-0.6-3.1-1.8-4.2S42.8,39,40.7,39c-2,0-3.7,0.5-4.9,1.6s-1.9,2.6-2.1,4.6l2.7,0.3c0-1.3,0.4-2.4,1.2-3.2s1.8-1.1,3-1.1\n        c1.2,0,2.2,0.4,2.9,1.1s1.1,1.6,1.1,2.6c0,1-0.4,2.1-1.2,3.2s-2.4,2.6-4.7,4.5c-1.5,1.2-2.7,2.3-3.5,3.3s-1.4,1.9-1.7,2.9\n        c-0.2,0.6-0.3,1.2-0.3,1.8h14.2v-2.5H36.9z\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M51.5,57.6c0.7,1.1,1.8,2,3.1,2.6s2.9,0.8,4.9,0.8c1.5,0,2.9-0.3,4.1-0.8s2.2-1.3,2.8-2.4s1-2.1,1-3.2\n        c0-1.2-0.3-2.2-0.9-3.1s-1.5-1.6-2.8-2.2c-0.9-0.4-2.4-0.8-4.8-1.4s-3.7-1-4.3-1.5c-0.6-0.5-0.8-1.1-0.8-1.9\n        c0-0.9,0.4-1.6,1.2-2.3s2-0.9,3.8-0.9c1.7,0,2.9,0.3,3.7,1s1.3,1.7,1.5,3.1l2.7-0.2c0-1.3-0.4-2.4-1.1-3.4S64.2,40,63,39.5\n        s-2.6-0.8-4.2-0.8c-1.4,0-2.8,0.2-3.9,0.7s-2.1,1.2-2.7,2.1s-0.9,2-0.9,3c0,1,0.3,1.9,0.8,2.7s1.3,1.5,2.3,2\n        c0.8,0.4,2.2,0.9,4.1,1.3s3.2,0.8,3.8,1c0.9,0.3,1.5,0.8,1.9,1.3s0.6,1.1,0.6,1.8c0,0.7-0.2,1.3-0.6,1.8s-1,1-1.9,1.3\n        s-1.8,0.5-2.9,0.5c-1.2,0-2.3-0.2-3.3-0.6s-1.7-1-2.2-1.7s-0.8-1.6-0.9-2.6l-2.7,0.2C50.4,55.1,50.8,56.4,51.5,57.6z\"/>\n    </symbol>\n    <symbol id=\"hso3.3\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fdbbbb\" r=\"35\" stroke-width=\"4\" stroke=\"#aa3030\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M35.7,59.3c1.2,1.1,2.8,1.7,4.7,1.7c2.1,0,3.8-0.7,5.2-2s2.1-2.9,2.1-4.8c0-1.4-0.4-2.5-1.1-3.5\n        s-1.7-1.5-3-1.8c1-0.4,1.7-1.1,2.2-1.8s0.7-1.6,0.7-2.5c0-1-0.3-1.9-0.8-2.8s-1.3-1.6-2.3-2.1S41.5,39,40.3,39\n        c-1.7,0-3.1,0.5-4.3,1.5s-1.9,2.3-2.2,4.1l2.6,0.5c0.2-1.3,0.6-2.3,1.3-2.9s1.5-1,2.6-1c1,0,1.9,0.3,2.5,1s1,1.4,1,2.4\n        c0,1.2-0.4,2.1-1.3,2.7s-1.9,0.9-3,0.9c-0.1,0-0.2,0-0.4,0l-0.3,2.3c0.7-0.2,1.4-0.3,1.9-0.3c1.2,0,2.2,0.4,3,1.2s1.2,1.8,1.2,3\n        c0,1.3-0.4,2.3-1.3,3.2s-1.9,1.3-3.1,1.3c-1,0-1.9-0.3-2.7-1s-1.2-1.7-1.5-3.2l-2.6,0.4C33.8,56.7,34.5,58.2,35.7,59.3z\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M51.5,57.6c0.7,1.1,1.8,2,3.1,2.6s2.9,0.8,4.9,0.8c1.5,0,2.9-0.3,4.1-0.8s2.2-1.3,2.8-2.4s1-2.1,1-3.2\n        c0-1.2-0.3-2.2-0.9-3.1s-1.5-1.6-2.8-2.2c-0.9-0.4-2.4-0.8-4.8-1.4s-3.7-1-4.3-1.5c-0.6-0.5-0.8-1.1-0.8-1.9\n        c0-0.9,0.4-1.6,1.2-2.3s2-0.9,3.8-0.9c1.7,0,2.9,0.3,3.7,1s1.3,1.7,1.5,3.1l2.7-0.2c0-1.3-0.4-2.4-1.1-3.4S64.2,40,63,39.5\n        s-2.6-0.8-4.2-0.8c-1.4,0-2.8,0.2-3.9,0.7s-2.1,1.2-2.7,2.1s-0.9,2-0.9,3c0,1,0.3,1.9,0.8,2.7s1.3,1.5,2.3,2\n        c0.8,0.4,2.2,0.9,4.1,1.3s3.2,0.8,3.8,1c0.9,0.3,1.5,0.8,1.9,1.3s0.6,1.1,0.6,1.8c0,0.7-0.2,1.3-0.6,1.8s-1,1-1.9,1.3\n        s-1.8,0.5-2.9,0.5c-1.2,0-2.3-0.2-3.3-0.6s-1.7-1-2.2-1.7s-0.8-1.6-0.9-2.6l-2.7,0.2C50.4,55.1,50.8,56.4,51.5,57.6z\"/>\n    </symbol>\n    <symbol id=\"hso3.4\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fdbbbb\" r=\"35\" stroke-width=\"4\" stroke=\"#aa3030\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M44.6,60.6v-5.1h2.9V53h-2.9V39.1h-2.2L32.7,53v2.4H42v5.1H44.6z M35.3,53l6.7-9.7V53H35.3z\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M51.5,57.5c0.7,1.1,1.8,2,3.1,2.6s2.9,0.8,4.9,0.8c1.5,0,2.9-0.3,4.1-0.8c1.2-0.6,2.2-1.3,2.8-2.4\n        s1-2.1,1-3.2c0-1.2-0.3-2.2-0.9-3.1s-1.5-1.6-2.8-2.2c-0.9-0.4-2.4-0.8-4.8-1.4c-2.3-0.5-3.7-1-4.3-1.5c-0.6-0.5-0.8-1.1-0.8-1.9\n        c0-0.9,0.4-1.6,1.2-2.3s2-0.9,3.8-0.9c1.7,0,2.9,0.3,3.7,1s1.3,1.7,1.5,3.1l2.7-0.2c0-1.3-0.4-2.4-1.1-3.4s-1.6-1.8-2.8-2.3\n        s-2.6-0.8-4.2-0.8c-1.4,0-2.8,0.2-3.9,0.7s-2.1,1.2-2.7,2.1s-0.9,2-0.9,3c0,1,0.3,1.9,0.8,2.7s1.3,1.5,2.3,2\n        c0.8,0.4,2.2,0.9,4.1,1.3s3.2,0.8,3.8,1c0.9,0.3,1.5,0.8,1.9,1.3s0.6,1.1,0.6,1.8c0,0.7-0.2,1.3-0.6,1.8s-1,1-1.9,1.3\n        s-1.8,0.5-2.9,0.5c-1.2,0-2.3-0.2-3.3-0.6s-1.7-1-2.2-1.7s-0.8-1.6-0.9-2.6l-2.7,0.2C50.4,55.1,50.8,56.4,51.5,57.5z\"/>\n    </symbol>\n    <symbol id=\"hso3.6\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fdbbbb\" r=\"35\" stroke-width=\"4\" stroke=\"#aa3030\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M45.4,40.4c-1.1-0.9-2.5-1.4-4.2-1.4c-2.3,0-4.1,0.8-5.4,2.5c-1.5,1.9-2.3,4.9-2.3,9.1c0,3.7,0.7,6.4,2.1,8\n        s3.2,2.4,5.4,2.4c1.3,0,2.4-0.3,3.5-0.9s1.8-1.5,2.4-2.7s0.9-2.4,0.9-3.8c0-2.1-0.6-3.7-1.9-5s-2.7-1.9-4.5-1.9\n        c-1,0-2,0.2-2.9,0.7s-1.7,1.2-2.3,2.2c0-2.1,0.3-3.8,0.7-5s1.1-2,2-2.7c0.6-0.5,1.4-0.7,2.2-0.7c1,0,1.9,0.4,2.6,1.1\n        c0.4,0.5,0.8,1.2,1,2.3l2.6-0.2C47.1,42.7,46.5,41.4,45.4,40.4z M37.8,50.2c0.8-0.9,1.8-1.3,3-1.3c1.2,0,2.2,0.4,3,1.3\n        s1.2,2,1.2,3.5c0,1.5-0.4,2.8-1.2,3.7s-1.8,1.3-2.9,1.3c-0.8,0-1.5-0.2-2.2-0.7s-1.2-1.1-1.6-1.9s-0.6-1.7-0.6-2.6\n        C36.5,52.2,37,51.1,37.8,50.2z\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M51.6,57.5c0.7,1.1,1.8,2,3.1,2.6s2.9,0.8,4.9,0.8c1.5,0,2.9-0.3,4.1-0.8c1.2-0.6,2.2-1.3,2.8-2.4\n        s1-2.1,1-3.2c0-1.2-0.3-2.2-0.9-3.1s-1.5-1.6-2.8-2.2c-0.9-0.4-2.4-0.8-4.8-1.4s-3.7-1-4.3-1.5c-0.6-0.5-0.8-1.1-0.8-1.9\n        c0-0.9,0.4-1.6,1.2-2.3s2-0.9,3.8-0.9c1.7,0,2.9,0.3,3.7,1s1.3,1.7,1.5,3.1l2.7-0.2c0-1.3-0.4-2.4-1.1-3.4S64.2,40,63,39.5\n        c-1.2-0.5-2.6-0.8-4.2-0.8c-1.4,0-2.8,0.2-3.9,0.7s-2.1,1.2-2.7,2.1s-0.9,2-0.9,3c0,1,0.3,1.9,0.8,2.7s1.3,1.5,2.3,2\n        c0.8,0.4,2.2,0.9,4.1,1.3s3.2,0.8,3.8,1c0.9,0.3,1.5,0.8,1.9,1.3c0.4,0.5,0.6,1.1,0.6,1.8c0,0.7-0.2,1.3-0.6,1.8\n        c-0.4,0.6-1,1-1.9,1.3s-1.8,0.5-2.9,0.5c-1.2,0-2.3-0.2-3.3-0.6s-1.7-1-2.2-1.7s-0.8-1.6-0.9-2.6l-2.7,0.2\n        C50.5,55.1,50.9,56.4,51.6,57.5z\"/>\n    </symbol>\n    <symbol id=\"hso3.N\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#fdbbbb\" r=\"35\" stroke-width=\"4\" stroke=\"#aa3030\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M34.9,60.6V43.7l11.3,16.9H49V39.1h-2.7v16.9L35,39.1h-2.9v21.5H34.9z\"/>\n      <path fill=\"#aa3030\" stroke=\"none\" stroke-width=\"2\" d=\"M54,57.5c0.7,1.1,1.8,2,3.1,2.6s2.9,0.8,4.9,0.8c1.5,0,2.9-0.3,4.1-0.8s2.2-1.3,2.8-2.4s1-2.1,1-3.2\n        c0-1.2-0.3-2.2-0.9-3.1s-1.5-1.6-2.8-2.2c-0.9-0.4-2.4-0.8-4.8-1.4s-3.7-1-4.3-1.5c-0.6-0.5-0.8-1.1-0.8-1.9\n        c0-0.9,0.4-1.6,1.2-2.3s2-0.9,3.8-0.9c1.7,0,2.9,0.3,3.7,1s1.3,1.7,1.5,3.1l2.7-0.2c0-1.3-0.4-2.4-1.1-3.4s-1.6-1.8-2.8-2.3\n        s-2.6-0.8-4.2-0.8c-1.4,0-2.8,0.2-3.9,0.7s-2.1,1.2-2.7,2.1s-0.9,2-0.9,3c0,1,0.3,1.9,0.8,2.7s1.3,1.5,2.3,2\n        c0.8,0.4,2.2,0.9,4.1,1.3s3.2,0.8,3.8,1c0.9,0.3,1.5,0.8,1.9,1.3s0.6,1.1,0.6,1.8c0,0.7-0.2,1.3-0.6,1.8s-1,1-1.9,1.3\n        c-0.8,0.3-1.8,0.5-2.9,0.5c-1.2,0-2.3-0.2-3.3-0.6s-1.7-1-2.2-1.7s-0.8-1.6-0.9-2.6l-2.7,0.2C52.9,55.1,53.3,56.4,54,57.5z\"/>\n    </symbol>\n    <symbol id=\"me\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" r=\"35\" fill=\"#f47920\" stroke=\"#994a16\" stroke-miterlimit=\"10\" stroke-width=\"4\"/>\n      <g>\n        <path d=\"M27.65,36.18h5.01l7.43,21.83,7.37-21.83h4.98v25.82h-3.34v-15.24c0-.53.01-1.4.04-2.62s.04-2.53.04-3.92l-7.37,21.78h-3.47l-7.44-21.78v.79c0,.63.02,1.6.05,2.89s.05,2.25.05,2.86v15.24h-3.34v-25.82Z\" fill=\"#994a16\"/>\n        <path d=\"M68.93,43.69c1.25.63,2.2,1.44,2.85,2.43.63.95,1.05,2.06,1.26,3.32.19.87.28,2.25.28,4.15h-13.69c.06,1.92.51,3.45,1.34,4.61.84,1.16,2.13,1.74,3.89,1.74,1.64,0,2.95-.55,3.92-1.64.55-.63.93-1.37,1.16-2.21h3.11c-.08.69-.35,1.46-.82,2.31s-.98,1.54-1.55,2.08c-.95.94-2.13,1.57-3.54,1.9-.76.19-1.61.28-2.56.28-2.33,0-4.3-.85-5.92-2.56-1.62-1.71-2.43-4.09-2.43-7.16s.82-5.48,2.45-7.37c1.63-1.89,3.76-2.83,6.39-2.83,1.33,0,2.61.31,3.86.94ZM70.07,51.08c-.13-1.37-.42-2.47-.89-3.29-.86-1.52-2.29-2.29-4.3-2.29-1.44,0-2.65.52-3.62,1.57-.98,1.05-1.49,2.38-1.55,4h10.37Z\" fill=\"#994a16\"/>\n      </g>\n    </symbol>\n    <symbol id=\"me.2\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" r=\"35\" fill=\"#f47920\" stroke=\"#994a16\" stroke-miterlimit=\"10\" stroke-width=\"4\"/>\n      <path d=\"M24.63,55.59c.61-1.25,1.79-2.39,3.56-3.41l2.63-1.52c1.18-.69,2.01-1.27,2.48-1.76.75-.76,1.12-1.63,1.12-2.61,0-1.14-.34-2.05-1.03-2.73s-1.6-1.01-2.74-1.01c-1.69,0-2.86.64-3.51,1.92-.35.69-.54,1.64-.58,2.86h-2.51c.03-1.71.34-3.1.95-4.18,1.07-1.9,2.96-2.85,5.66-2.85,2.25,0,3.89.61,4.93,1.82,1.04,1.22,1.56,2.57,1.56,4.06,0,1.57-.55,2.91-1.66,4.03-.64.65-1.79,1.43-3.44,2.36l-1.88,1.04c-.9.49-1.6.96-2.11,1.41-.91.79-1.49,1.68-1.73,2.64h10.72v2.33h-13.47c.09-1.69.44-3.16,1.05-4.41Z\" fill=\"#994a16\"/>\n      <path d=\"M40.38,39.87h3.91l5.79,17.02,5.75-17.02h3.88v20.13h-2.6v-11.88c0-.41,0-1.09.03-2.04.02-.95.03-1.97.03-3.06l-5.75,16.98h-2.7l-5.8-16.98v.62c0,.49.01,1.24.04,2.25.03,1.01.04,1.75.04,2.23v11.88h-2.6v-20.13Z\" fill=\"#994a16\"/>\n      <path d=\"M72.56,45.73c.97.49,1.71,1.12,2.22,1.9.49.74.82,1.6.98,2.59.15.68.22,1.75.22,3.23h-10.67c.04,1.49.39,2.69,1.05,3.59s1.66,1.35,3.03,1.35c1.28,0,2.3-.43,3.06-1.28.43-.5.73-1.07.91-1.72h2.43c-.06.54-.28,1.14-.64,1.8-.36.66-.76,1.2-1.21,1.62-.74.73-1.66,1.22-2.76,1.48-.59.15-1.26.22-2,.22-1.82,0-3.35-.66-4.62-1.99-1.26-1.33-1.89-3.19-1.89-5.58s.64-4.27,1.91-5.74c1.27-1.47,2.93-2.21,4.98-2.21,1.04,0,2.04.24,3.01.73ZM73.45,51.49c-.1-1.07-.33-1.92-.69-2.56-.67-1.19-1.79-1.78-3.36-1.78-1.12,0-2.07.41-2.83,1.23-.76.82-1.16,1.86-1.21,3.12h8.08Z\" fill=\"#994a16\"/>\n    </symbol>\n    <symbol id=\"me.3\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" r=\"35\" fill=\"#f47920\" stroke=\"#994a16\" stroke-miterlimit=\"10\" stroke-width=\"4\"/>\n      <path d=\"M24.94,58.62c-1.05-1.27-1.57-2.83-1.57-4.65h2.58c.11,1.27.35,2.19.71,2.77.64,1.03,1.8,1.55,3.47,1.55,1.3,0,2.34-.35,3.12-1.04.79-.69,1.18-1.59,1.18-2.69,0-1.35-.41-2.3-1.24-2.84s-1.98-.81-3.45-.81c-.16,0-.33,0-.5,0-.17,0-.34.01-.51.02v-2.18c.26.03.47.05.64.05.17,0,.36.01.56.01.92,0,1.68-.15,2.27-.44,1.04-.51,1.56-1.42,1.56-2.74,0-.98-.35-1.73-1.04-2.26-.69-.53-1.5-.79-2.43-.79-1.64,0-2.78.55-3.41,1.64-.35.6-.54,1.46-.59,2.58h-2.44c0-1.46.29-2.7.88-3.73,1-1.83,2.77-2.74,5.3-2.74,2,0,3.55.45,4.65,1.34,1.1.89,1.64,2.18,1.64,3.87,0,1.21-.32,2.18-.97,2.93-.4.47-.92.83-1.56,1.1,1.03.28,1.84.83,2.42,1.64.58.81.87,1.8.87,2.97,0,1.87-.62,3.4-1.85,4.58s-2.98,1.77-5.25,1.77-4-.64-5.05-1.91Z\" fill=\"#994a16\"/>\n      <path d=\"M40.38,39.87h3.91l5.79,17.02,5.75-17.02h3.88v20.13h-2.6v-11.88c0-.41,0-1.09.03-2.04.02-.95.03-1.97.03-3.06l-5.75,16.98h-2.7l-5.8-16.98v.62c0,.49.01,1.24.04,2.25.03,1.01.04,1.75.04,2.23v11.88h-2.6v-20.13Z\" fill=\"#994a16\"/>\n      <path d=\"M72.56,45.73c.97.49,1.71,1.12,2.22,1.9.49.74.82,1.6.98,2.59.15.68.22,1.75.22,3.23h-10.67c.04,1.49.39,2.69,1.05,3.59s1.66,1.35,3.03,1.35c1.28,0,2.3-.43,3.06-1.28.43-.5.73-1.07.91-1.72h2.43c-.06.54-.28,1.14-.64,1.8-.36.66-.76,1.2-1.21,1.62-.74.73-1.66,1.22-2.76,1.48-.59.15-1.26.22-2,.22-1.82,0-3.35-.66-4.62-1.99-1.26-1.33-1.89-3.19-1.89-5.58s.64-4.27,1.91-5.74c1.27-1.47,2.93-2.21,4.98-2.21,1.04,0,2.04.24,3.01.73ZM73.45,51.49c-.1-1.07-.33-1.92-.69-2.56-.67-1.19-1.79-1.78-3.36-1.78-1.12,0-2.07.41-2.83,1.23-.76.82-1.16,1.86-1.21,3.12h8.08Z\" fill=\"#994a16\"/>\n    </symbol>\n    <symbol id=\"me.4\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" r=\"35\" fill=\"#f47920\" stroke=\"#994a16\" stroke-miterlimit=\"10\" stroke-width=\"4\"/>\n      <path d=\"M32.02,60v-4.8h-8.61v-2.41l8.99-12.47h2.08v12.73h2.89v2.15h-2.89v4.8h-2.47ZM31.98,53.05v-8.91l-6.29,8.91h6.29Z\" fill=\"#994a16\"/>\n      <path d=\"M40.38,39.87h3.91l5.79,17.02,5.75-17.02h3.88v20.13h-2.6v-11.88c0-.41,0-1.09.03-2.04.02-.95.03-1.97.03-3.06l-5.75,16.98h-2.7l-5.8-16.98v.62c0,.49.01,1.24.04,2.25.03,1.01.04,1.75.04,2.23v11.88h-2.6v-20.13Z\" fill=\"#994a16\"/>\n      <path d=\"M72.56,45.73c.97.49,1.71,1.12,2.22,1.9.49.74.82,1.6.98,2.59.15.68.22,1.75.22,3.23h-10.67c.04,1.49.39,2.69,1.05,3.59s1.66,1.35,3.03,1.35c1.28,0,2.3-.43,3.06-1.28.43-.5.73-1.07.91-1.72h2.43c-.06.54-.28,1.14-.64,1.8-.36.66-.76,1.2-1.21,1.62-.74.73-1.66,1.22-2.76,1.48-.59.15-1.26.22-2,.22-1.82,0-3.35-.66-4.62-1.99-1.26-1.33-1.89-3.19-1.89-5.58s.64-4.27,1.91-5.74c1.27-1.47,2.93-2.21,4.98-2.21,1.04,0,2.04.24,3.01.73ZM73.45,51.49c-.1-1.07-.33-1.92-.69-2.56-.67-1.19-1.79-1.78-3.36-1.78-1.12,0-2.07.41-2.83,1.23-.76.82-1.16,1.86-1.21,3.12h8.08Z\" fill=\"#994a16\"/>\n    </symbol>\n    <symbol id=\"p\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"50\" fill=\"#bbe5fa\" r=\"35\" stroke-width=\"4\" stroke=\"#2f5fac\"/>\n      <path fill=\"#2f5fac\" stroke=\"none\" stroke-width=\"2\" d=\"M43.1,67.5V53h9.2c5.1,0,8.6-1.1,10.5-3.2c1.9-2.1,2.9-4.7,2.9-7.7c0-1.8-0.4-3.4-1.1-4.9\n        c-0.7-1.5-1.7-2.6-2.9-3.5c-1.2-0.8-2.7-1.4-4.4-1.7c-1.3-0.2-3.1-0.3-5.4-0.3H38.4v35.8H43.1z M43.1,36h9.2\n        c2.1,0,3.6,0.1,4.4,0.3c1.2,0.3,2.2,1,3,2.1c0.8,1.1,1.1,2.3,1.1,3.8c0,2.1-0.6,3.7-1.9,4.8c-1.3,1.1-3.5,1.7-6.5,1.7h-9.3V36z\"/>\n    </symbol>\n    <symbol id=\"ser\" viewBox=\"0 0 100 100\">\n      <path d=\"M20,50 a1,1 0 0,0 30,0 a1,1 0 0,1 30,0\" fill=\"none\" stroke=\"light-dark(#000, var(--text-color, #ddd))\" stroke-width=\"1\"/>\n      <path d=\"M22.2,88.5c1,1.5,2.4,2.7,4.1,3.4c1.8,0.8,3.9,1.1,6.5,1.1c2,0,3.9-0.4,5.5-1.1c1.6-0.7,2.9-1.8,3.8-3.1\n        c0.9-1.3,1.3-2.8,1.3-4.3c0-1.5-0.4-2.9-1.2-4.1c-0.8-1.2-2-2.2-3.7-2.9c-1.1-0.5-3.3-1.1-6.3-1.8c-3.1-0.7-5-1.4-5.7-2\n        c-0.7-0.7-1.1-1.5-1.1-2.5c0-1.2,0.5-2.2,1.6-3c1-0.8,2.7-1.3,5-1.3c2.2,0,3.9,0.5,5,1.4c1.1,0.9,1.8,2.3,2,4.1l3.6-0.3\n        c-0.1-1.7-0.5-3.2-1.4-4.5c-0.9-1.3-2.1-2.3-3.7-3s-3.5-1-5.6-1c-1.9,0-3.7,0.3-5.3,1C25,65.1,23.8,66,23,67.3s-1.2,2.6-1.2,4.1\n        c0,1.3,0.3,2.5,1,3.6c0.7,1.1,1.7,2,3.1,2.7c1.1,0.6,2.9,1.2,5.5,1.8c2.6,0.6,4.3,1.1,5.1,1.4c1.2,0.5,2.1,1,2.6,1.7\n        c0.5,0.7,0.8,1.5,0.8,2.4c0,0.9-0.3,1.7-0.8,2.5c-0.5,0.7-1.4,1.3-2.5,1.8c-1.1,0.4-2.4,0.6-3.8,0.6c-1.6,0-3.1-0.3-4.4-0.8\n        c-1.3-0.6-2.3-1.3-2.9-2.2c-0.6-0.9-1-2.1-1.2-3.5l-3.6,0.3C20.7,85.3,21.2,87,22.2,88.5z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n      <path d=\"M60.2,89.1c-0.9,0.7-2,1-3.3,1c-1.7,0-3.2-0.6-4.3-1.8c-1.2-1.2-1.8-3-1.9-5.2h15.5c0-0.4,0-0.7,0-0.9\n        c0-3.4-0.9-6.1-2.6-8s-4-2.8-6.8-2.8c-2.9,0-5.2,1-7,2.9S47,78.9,47,82.4c0,3.4,0.9,6,2.7,7.9s4.2,2.8,7.2,2.8\n        c2.4,0,4.4-0.6,5.9-1.8c1.5-1.2,2.6-2.8,3.2-4.9l-3.6-0.4C61.8,87.4,61.1,88.5,60.2,89.1z M52.6,75.9c1.1-1.1,2.5-1.6,4.1-1.6\n        c1.8,0,3.2,0.7,4.4,2c0.7,0.9,1.2,2.2,1.3,3.9H50.8C50.9,78.4,51.5,77,52.6,75.9z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n      <path d=\"M73.9,92.6V81.7c0-1.5,0.2-2.9,0.6-4.1c0.3-0.8,0.7-1.5,1.3-1.9c0.6-0.5,1.3-0.7,2.1-0.7c0.9,0,1.7,0.3,2.6,0.8l1.2-3.3\n        c-1.2-0.8-2.4-1.1-3.6-1.1c-0.8,0-1.6,0.2-2.3,0.7s-1.4,1.4-2.2,2.9v-3.1h-3.2v20.7H73.9z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n\n    </symbol>\n    <symbol id=\"thr\" viewBox=\"0 0 100 100\">\n      <path d=\"M20,50 a1,1 0 0,0 30,0 a1,1 0 0,1 30,0\" fill=\"none\" stroke=\"light-dark(#000, var(--text-color, #ddd))\" stroke-width=\"1\"/>\n      <path d=\"M34.1,92.6V67.3h9.5V64H20.9v3.4h9.4v25.3H34.1z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n      <path d=\"M50.6,92.6V81.2c0-1.6,0.2-2.9,0.6-3.8s1-1.7,2-2.2s1.9-0.8,2.9-0.8c1.4,0,2.5,0.4,3.2,1.2s1.1,2.1,1.1,3.8v13.1h3.5V79.4\n        c0-2-0.2-3.6-0.7-4.6s-1.3-1.9-2.4-2.5s-2.5-0.9-4-0.9c-2.5,0-4.6,1-6.2,2.9V64H47v28.6H50.6z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n      <path d=\"M72.8,92.6V81.7c0-1.5,0.2-2.9,0.6-4.1c0.3-0.8,0.7-1.5,1.3-1.9c0.6-0.5,1.3-0.7,2.1-0.7c0.9,0,1.7,0.3,2.6,0.8l1.2-3.3\n        c-1.2-0.8-2.4-1.1-3.6-1.1c-0.8,0-1.6,0.2-2.3,0.7s-1.4,1.4-2.2,2.9v-3.1h-3.2v20.7H72.8z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n    </symbol>\n    <symbol id=\"asn\" viewBox=\"0 0 100 100\">\n      <path d=\"M20,50 a1,1 0 0,0 30,0 a1,1 0 0,1 30,0\" fill=\"none\" stroke=\"light-dark(#000, var(--text-color, #ddd))\" stroke-width=\"1\"/>\n      <path d=\"M19.4,92.6l3.1-8.7h12l3.3,8.7h4.3L30.5,64h-4.1l-11,28.6H19.4z M26.8,72.4c0.7-1.8,1.2-3.6,1.5-5.5\n        c0.4,1.5,1.1,3.5,2,5.9l3,7.9h-9.7L26.8,72.4z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n      <path d=\"M46.1,91.4c1.4,1.1,3.5,1.7,6.2,1.7c1.6,0,3.1-0.3,4.4-0.8s2.3-1.4,3-2.4s1-2.1,1-3.3c0-1.2-0.3-2.2-0.8-3\n        c-0.6-0.8-1.3-1.4-2.3-1.8c-1-0.4-2.7-1-5.2-1.6c-1.7-0.5-2.8-0.8-3.1-0.9c-0.6-0.2-1.1-0.6-1.3-0.9c-0.3-0.4-0.4-0.8-0.4-1.2\n        c0-0.7,0.3-1.3,1-1.9c0.7-0.5,1.8-0.8,3.5-0.8c1.4,0,2.4,0.3,3.2,0.9c0.7,0.6,1.2,1.4,1.4,2.5l3.4-0.5c-0.2-1.3-0.6-2.4-1.2-3.2\n        s-1.5-1.4-2.7-1.9s-2.7-0.7-4.3-0.7c-1.1,0-2.1,0.1-3,0.4c-0.9,0.3-1.7,0.6-2.2,1c-0.7,0.5-1.3,1.2-1.7,2\n        c-0.4,0.8-0.6,1.6-0.6,2.6c0,1,0.3,1.9,0.8,2.8c0.5,0.8,1.3,1.5,2.3,2s2.8,1,5.4,1.7c1.9,0.5,3.1,0.9,3.6,1.2c0.7,0.5,1,1.1,1,1.9\n        c0,0.9-0.4,1.7-1.2,2.3s-2,1-3.6,1c-1.6,0-2.8-0.4-3.7-1.1c-0.9-0.7-1.4-1.8-1.6-3.2l-3.5,0.5C43.8,88.6,44.7,90.3,46.1,91.4z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n      <path d=\"M68.3,92.6V81.3c0-2.7,0.5-4.5,1.6-5.4c1.1-1,2.4-1.4,3.9-1.4c0.9,0,1.8,0.2,2.5,0.6c0.7,0.4,1.2,1,1.5,1.7\n        s0.4,1.8,0.4,3.2v12.6h3.5V79.8c0-1.6-0.1-2.8-0.2-3.4c-0.2-1-0.6-1.9-1.1-2.6c-0.5-0.7-1.3-1.3-2.4-1.8c-1-0.4-2.2-0.7-3.4-0.7\n        c-2.9,0-5.1,1.1-6.6,3.4v-2.9h-3.2v20.7H68.3z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n    </symbol>\n    <symbol id=\"hyl\" viewBox=\"0 0 100 100\">\n      <path d=\"M20,50 a1,1 0 0,0 30,0 a1,1 0 0,1 30,0\" fill=\"none\" stroke=\"light-dark(#000, var(--text-color, #ddd))\" stroke-width=\"1\"/>\n      <path d=\"M28.1,92.6V79.1H43v13.5h3.8V64H43v11.8H28.1V64h-3.8v28.6H28.1z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n      <path d=\"M54.7,101c1.1,0,2.1-0.3,2.9-0.8c0.8-0.5,1.5-1.4,2.1-2.5c0.5-0.9,1.1-2.4,2-4.7l7.9-21.1h-3.5l-4.4,12.1\n        c-0.6,1.5-1,3.1-1.4,4.7c-0.4-1.7-0.9-3.3-1.5-4.8l-4.3-12h-3.8l7.9,20.8c-0.1,0.4-0.2,0.7-0.3,0.9c-0.5,1.4-0.9,2.3-1.1,2.6\n        c-0.3,0.5-0.7,0.8-1.2,1.1s-1.1,0.4-1.9,0.4c-0.6,0-1.2-0.1-2-0.3l0.4,3.3C53.3,100.9,54.1,101,54.7,101z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n      <path d=\"M76.1,92.6V64h-3.5v28.6H76.1z\" fill=\"light-dark(#000, var(--text-color, #ddd))\"/>\n    </symbol>\n    <symbol id=\"etnp\" viewBox=\"0 0 100 100\">\n      <path d=\"M50,15.1 L66.2,26.9 L60,45.9 L40,45.9 L33.8,26.9\" fill=\"#000\"/>\n      <circle cx=\"50\" cy=\"70\" fill=\"#bbe5fa\" r=\"15\" stroke-width=\"2\" stroke=\"#2f5fac\"/>\n      <path fill=\"#2f5fac\" stroke=\"none\" stroke-width=\"2\" d=\"M47,70.5v0h4.5c2.5,0,4.3-0.55,5.25-1.6c0.95-1.05,1.45-2.35,1.45-3.85c0-0.9-0.2-1.7-0.55-2.45c-0.35-0.75-0.85-1.3-1.45-1.75c-0.6-0.4-1.35-0.7-2.2-0.85c-0.65-0.1-1.55-0.15-2.7-0.15h-8v17.9h3.6z m-0.5,-8.5h4.6\nc1.05,0,1.8,0.05,2.2,0.15\nc0.6,0.15,1.1,0.5,1.5,1.05c0.4,0.55,0.55,1.15,0.55,1.9c0,1.05-0.3,1.85-0.95,2.4c-0.65,0.55-1.75,0.85-3.25,0.85h-4.65v-7z\"/>\n    </symbol>\n    <symbol id=\"dol-pp\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"20\" fill=\"#bbe5fa\" r=\"7.5\" stroke-width=\"2\" stroke=\"#2f5fac\"/>\n      <circle cx=\"50\" cy=\"40\" fill=\"#bbe5fa\" r=\"7.5\" stroke-width=\"2\" stroke=\"#2f5fac\"/>\n      <path fill=\"none\" stroke=\"#999\" stroke-width=\"4\" stroke-linecap=\"round\"  d=\"M50,50 55.8,61.1 44.5,72 55.8,83 44.5,94\"/>\n    </symbol>\n    <symbol id=\"dol-p\" viewBox=\"0 0 100 100\">\n      <circle cx=\"50\" cy=\"20\" fill=\"#bbe5fa\" r=\"7.5\" stroke-width=\"2\" stroke=\"#2f5fac\"/>\n      <path fill=\"none\" stroke=\"#999\" stroke-width=\"4\" stroke-linecap=\"round\"  d=\"M50,27.5 55.8,38.9 44.5,50 55.8,61.1 44.5,72 55.8,83 44.5,94\"/>\n    </symbol>\n\n    <symbol id=\"pi\" viewBox=\"0 0 100 100\">\n  <path d=\"M40.5,37.048h12.039c2.38,0,4.302,0.674,5.765,2.023c1.464,1.35,2.196,3.245,2.196,5.687c0,2.101-0.653,3.929-1.959,5.486\n    c-1.306,1.557-3.304,2.336-5.996,2.336h-8.401v11.373H40.5V37.048z M54.636,40.747c-0.799-0.378-1.897-0.567-3.291-0.567h-7.201\n    v9.323h7.201c1.625,0,2.943-0.348,3.955-1.044s1.519-1.923,1.519-3.681C56.819,42.799,56.091,41.456,54.636,40.747z\"/>\n<polyline fill=\"none\" stroke=\"#000000\" stroke-miterlimit=\"10\" points=\"12.076,90.888 12.076,54.475 33.525,54.475 \"/>\n<line fill=\"none\" stroke=\"#000000\" stroke-miterlimit=\"10\" x1=\"22.8\" y1=\"80.746\" x2=\"22.8\" y2=\"54.475\"/>\n<polygon fill=\"#fff\" stroke=\"#000000\" stroke-miterlimit=\"10\" points=\"50.482,3.475 38.46,10.415 38.46,24.297 50.482,31.237 \n  62.503,24.297 62.503,10.415 \"/>\n<line fill=\"none\" stroke=\"#000000\" stroke-miterlimit=\"10\" x1=\"50.482\" y1=\"35.021\" x2=\"50.482\" y2=\"31.237\"/>\n    </symbol>\n\n    <!-- Flat hexagon and flat diamond shapes below are scaled from the\n         official SNFG reference artwork (148x148 canvas -> this file's\n         0-100 viewBox, factor 100/148). Fill colors are the official SNFG\n         values for each monosaccharide, matching hexes already used\n         elsewhere in this file's palette where the same color group\n         recurs (e.g. purple/light-blue for NAc/NGc variants, as with\n         neuac/neugc above). -->\n    <symbol id=\"murnac\" viewBox=\"0 0 100 100\">\n      <polygon points=\"27.4,22.3 72.6,22.3 95.3,50 72.6,77.7 27.4,77.7 4.7,50\" fill=\"#a54399\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"murngc\" viewBox=\"0 0 100 100\">\n      <polygon points=\"27.4,22.3 72.6,22.3 95.3,50 72.6,77.7 27.4,77.7 4.7,50\" fill=\"#8fcce9\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"mur\" viewBox=\"0 0 100 100\">\n      <polygon points=\"27.4,22.3 72.6,22.3 95.3,50 72.6,77.7 27.4,77.7 4.7,50\" fill=\"#a17a4d\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"kdo\" viewBox=\"0 0 100 100\">\n      <polygon points=\"27.4,22.3 72.6,22.3 95.3,50 72.6,77.7 27.4,77.7 4.7,50\" fill=\"#ffd400\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"leg\" viewBox=\"0 0 100 100\">\n      <polygon points=\"50,19.9 95.3,50 50,80.1 4.7,50\" fill=\"#ffd400\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"aci\" viewBox=\"0 0 100 100\">\n      <polygon points=\"50,19.9 95.3,50 50,80.1 4.7,50\" fill=\"#f69ea1\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"4eleg\" viewBox=\"0 0 100 100\">\n      <polygon points=\"50,19.9 95.3,50 50,80.1 4.7,50\" fill=\"#8fcce9\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"lyx\" viewBox=\"0 0 100 100\">\n      <polyline fill=\"#ffd400\" stroke=\"#000\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" points=\"\n  67.802,60.462 78.803,94.32 50.001,69.823 21.196,94.322 32.199,60.462 3.386,39.531 38.999,39.534 50,5.678 61.002,39.536 96.615,39.539 67.804,60.462 \"/>\n    </symbol>\n    <symbol id=\"bac\" viewBox=\"0 0 100 100\">\n      <polygon points=\"27.4,22.3 72.6,22.3 95.3,50 72.6,77.7 27.4,77.7 4.7,50\" fill=\"#0072bc\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"ldmanhep\" viewBox=\"0 0 100 100\">\n      <polygon points=\"27.4,22.3 72.6,22.3 95.3,50 72.6,77.7 27.4,77.7 4.7,50\" fill=\"#00a651\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"dha\" viewBox=\"0 0 100 100\">\n      <polygon points=\"27.4,22.3 72.6,22.3 95.3,50 72.6,77.7 27.4,77.7 4.7,50\" fill=\"#f47920\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n    <symbol id=\"ddmanhep\" viewBox=\"0 0 100 100\">\n      <polygon points=\"27.4,22.3 72.6,22.3 95.3,50 72.6,77.7 27.4,77.7 4.7,50\" fill=\"#f69ea1\" stroke=\"#000\" stroke-width=\"1\"/>\n    </symbol>\n\n  </defs>\n  <!--\n  <g>\n    <rect x=\"0\" y=\"0\" width=\"100\" height=\"100\" stroke-width=\"0.1\" stroke=\"#000\" fill=\"none\"/>\n    <text x=\"20\" y=\"50\" font-family=\"helvetica\">100 x 100</text>\n    <text x=\"0\" y=\"15\"  font-family=\"helvetica\">0</text>\n    <text x=\"70\" y=\"100\"  font-family=\"helvetica\">100</text>\n  </g>\n  -->\n  <use xlink:href=\"#galnac\" x=\"100\" y=\"100\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#glcnac\" x=\"200\" y=\"100\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#man\" x=\"300\" y=\"100\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#glc\" x=\"400\" y=\"100\" width=\"100\" height=\"100\"/>\n  <text x=\"150\" text-anchor=\"middle\" y=\"210\">GalNAc</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"210\">GlcNAc</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"210\">Mannose</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"210\">Glucose</text>\n  <use xlink:href=\"#fuc\" x=\"100\" y=\"250\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#neu\" x=\"200\" y=\"250\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#neuac\" x=\"300\" y=\"250\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#neugc\" x=\"400\" y=\"250\" width=\"100\" height=\"100\"/>\n  <text x=\"150\" text-anchor=\"middle\" y=\"370\">Fucose</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"370\">Sialic acid</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"370\">NeuAc</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"370\">NeuGc</text>\n\n  <use xlink:href=\"#ara\" x=\"100\" y=\"400\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#xyl\" x=\"200\" y=\"400\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#glca\" x=\"300\" y=\"400\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#idoa\" x=\"400\" y=\"400\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"510\">Arabinose</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"510\">Xylose</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"510\">GlcA</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"510\">IdoA</text>\n\n  <use xlink:href=\"#hexa\" x=\"100\" y=\"550\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#hex\" x=\"200\" y=\"550\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#hexnac\" x=\"300\" y=\"550\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#p\" x=\"400\" y=\"550\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"660\">HexA</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"660\">Hexose</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"660\">HexNAc</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"660\">P</text>\n\n  <use xlink:href=\"#ser\" x=\"100\" y=\"700\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#thr\" x=\"200\" y=\"700\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#asn\" x=\"300\" y=\"700\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#hyl\" x=\"400\" y=\"700\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"810\">Ser</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"810\">Thr</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"810\">Asn</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"810\">HyL</text>\n\n  <use xlink:href=\"#hso3\" x=\"100\" y=\"850\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#cer\" x=\"200\" y=\"850\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#hso3.2\" x=\"300\" y=\"850\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#hso3.3\" x=\"400\" y=\"850\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"960\">HSO3</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"960\">Cer</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"960\">2S</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"960\">3S</text>\n\n\n  <use xlink:href=\"#hso3.4\" x=\"100\" y=\"1000\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#hso3.6\" x=\"200\" y=\"1000\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#hso3.N\" x=\"300\" y=\"1000\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#glcn\" x=\"400\" y=\"1000\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"1110\">4S</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"1110\">6S</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"1110\">NS</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"1110\">GlcN</text>\n\n\n  <use xlink:href=\"#etnp\" x=\"100\" y=\"1150\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#pi\" x=\"200\" y=\"1150\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#dol-pp\" x=\"300\" y=\"1150\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#dol-p\" x=\"400\" y=\"1150\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"1260\">Etnp</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"1260\">PI</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"1260\">Dol-PP</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"1260\">Dol-P</text>\n\n\n  <use xlink:href=\"#murnac\" x=\"100\" y=\"1300\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#murngc\" x=\"200\" y=\"1300\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#mur\" x=\"300\" y=\"1300\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#kdo\" x=\"400\" y=\"1300\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"1410\">MurNAc</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"1410\">MurNGc</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"1410\">Mur</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"1410\">Kdo</text>\n\n  <use xlink:href=\"#leg\" x=\"100\" y=\"1450\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#aci\" x=\"200\" y=\"1450\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#4eleg\" x=\"300\" y=\"1450\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#lyx\" x=\"400\" y=\"1450\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"1560\">Leg</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"1560\">Aci</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"1560\">4eLeg</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"1560\">Lyx</text>\n\n  <use xlink:href=\"#bac\" x=\"100\" y=\"1600\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#ldmanhep\" x=\"200\" y=\"1600\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#dha\" x=\"300\" y=\"1600\" width=\"100\" height=\"100\"/>\n  <use xlink:href=\"#ddmanhep\" x=\"400\" y=\"1600\" width=\"100\" height=\"100\"/>\n\n  <text x=\"150\" text-anchor=\"middle\" y=\"1710\">Bac</text>\n  <text x=\"250\" text-anchor=\"middle\" y=\"1710\">LDManHep</text>\n  <text x=\"350\" text-anchor=\"middle\" y=\"1710\">Dha</text>\n  <text x=\"450\" text-anchor=\"middle\" y=\"1710\">DDManHep</text>\n\n</svg>\n");
;// ./node_modules/glycan.js/js/SVGRenderer.js
/*global */


function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
;



var SVGRenderer_module_string = 'glycanjs:svgrenderer';
var SVGRenderer_log = debugAny(SVGRenderer_module_string);
var container_symbol = Symbol('document_container');
var SVGRenderer_SCALE = 100;
var GLYCANJSNS = 'https://glycocode.com/glycanjs';
var supported_events = 'mousemove mousedown mouseup click touchstart touchend touchmove drop dragover';
var SVGRenderer_PRECISION = 1;
var DEFAULT_PADDING = {
  side: 1,
  top: 1
};
var SVGRenderer_str = num => num.toFixed(SVGRenderer_PRECISION);
var upgrade_symbol_elements = (canvas, symbols) => {
  var icons = canvas.ownerDocument.createElement('div');
  icons.innerHTML = symbols.replace(/<\?.*\?>/, '');
  var ids = [...icons.querySelectorAll('defs symbol')].map(el => el.getAttribute('id'));
  for (var symbol of canvas.querySelectorAll('symbol')) {
    if (ids.indexOf(symbol.getAttribute('id')) >= 0) {
      symbol.parentNode.removeChild(symbol);
    }
  }
  for (var defs of icons.querySelectorAll('defs')) {
    canvas.appendChild(defs);
  }
};
var use_css_variables = canvas => {
  // data-fixed-fill opts a shape out of --fill-color theming (e.g. the
  // white background of FragmentRenderer's ring hexagons, whose icons get
  // --fill-color set to the fragment colour).
  for (var shape of canvas.querySelectorAll('symbol *[fill]:not([data-fixed-fill])')) {
    var fill = shape.getAttribute('fill');
    var strokeWidth = shape.getAttribute('stroke-width');
    var stroke = shape.getAttribute('stroke');
    if (fill) {
      shape.style.fill = "var(--fill-color,".concat(fill, ")");
    }
    if (strokeWidth) {
      shape.style.strokeWidth = "var(--stroke-width,".concat(strokeWidth, ")");
    }
    if (stroke) {
      // Deliberately a different variable from the linkage line's
      // --stroke-color below: sviewer's lite.js has a `:hover` rule on
      // residues that sets --stroke-color to highlight the LINKAGE LINE
      // when a residue is hovered. Icon shapes (this loop) also carry a
      // `glycanjs:location` attribute, matching that same hover selector -
      // sharing --stroke-color here meant hovering an icon also tinted its
      // own outline, not just the line. --icon-stroke-color keeps icon
      // outlines themable independently without that bleed-through.
      shape.style.stroke = "var(--icon-stroke-color,".concat(stroke, ")");
    }
  }
  for (var line of canvas.querySelectorAll('g[*|location] line')) {
    var _strokeWidth = line.getAttribute('stroke-width');
    var _stroke = line.getAttribute('stroke');
    if (_strokeWidth) {
      line.style.strokeWidth = "var(--stroke-width,".concat(_strokeWidth, ")");
    }
    if (_stroke) {
      line.style.stroke = "var(--stroke-color,".concat(_stroke, ")");
    }
  }
};

// Parsing sugars.svg (~45 KB) was the single biggest cost of creating a
// renderer: one DOMParser pass per AppendSymbols call, i.e. per glycan on a
// page full of small glycans. Parse (and apply the CSS variables) once per
// distinct symbol string, then each canvas only pays for a deep clone.
// Keyed by string content, so a re-fetched copy of the same file still hits.
var parsed_symbols_cache = new Map();
var parsed_symbols_template = symbols_string => {
  var template = parsed_symbols_cache.get(symbols_string);
  if (!template) {
    var doc = new DOMParser().parseFromString(symbols_string, 'image/svg+xml');
    template = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
    for (var symbol of doc.querySelectorAll('svg defs > *')) {
      template.appendChild(symbol);
    }
    use_css_variables(template);
    parsed_symbols_cache.set(symbols_string, template);
  }
  return template;
};
var wire_canvas_events = function wire_canvas_events(canvas, callback) {
  for (var target of supported_events.split(' ')) {
    canvas.addEventListener(target, callback, {
      passive: true,
      capture: true
    });
  }
};
var handle_events = function handle_events(svg, event) {
  var ROTATE = this.rotate;
  if (event.clientX) {
    var pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    var transformed = pt.matrixTransform(svg.getScreenCTM().inverse());
    var xpos = transformed.x / SVGRenderer_SCALE;
    var ypos = transformed.y / SVGRenderer_SCALE;
    event.sugarX = ROTATE ? -1 * ypos + 1 : xpos;
    event.sugarY = ROTATE ? xpos : ypos;
  }
};
var StaticSVGRenderer;
class SVGRenderer extends js_Renderer {
  constructor(container, layout) {
    SVGRenderer_log('SVGRenderer');
    super(container, layout);
    if (container && layout) {
      this[container_symbol] = container;
      this.element = this.createCanvas(container);
      this.element.canvas.setAttribute('xmlns:glycanjs', GLYCANJSNS);
      wire_canvas_events(this.element.canvas, handle_events.bind(this, this.element.canvas), {
        passive: true,
        capture: false
      });
    }
  }

  // Overridable so a subclass can swap in a differently-drawing SVGCanvas
  // subclass (Fiziko/Heraldic's textured canvases, or an external package
  // like rough-glycan.js's hand-drawn one) while still getting the
  // glycanjs namespace and mouse/touch event wiring set up right above -
  // SVGCanvas's constructor always creates and appends a brand-new
  // <svg>/<symbol>, so building one outside this constructor and discarding
  // the one created here (the previous workaround, e.g. FizikoSVGRenderer.js
  // before this existed) left two SVG roots in the container and couldn't
  // re-attach this class's event wiring, which is private to this file.
  createCanvas(container) {
    return new js_SVGCanvas(container);
  }
  static get SYMBOLS() {
    return sugars;
  }
  static get GLOBAL_SCALE() {
    return SVGRenderer_SCALE;
  }
  static AppendSymbols(element) {
    var _arguments = arguments,
      _this = this;
    return _asyncToGenerator(function* () {
      var SYMBOLS_STRING = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : _this.SYMBOLS;
      if (element instanceof SVGRenderer) {
        element = element.element.canvas;
      }
      var symbols_string = yield Promise.resolve(SYMBOLS_STRING);
      var template = parsed_symbols_template(symbols_string);

      // A renderer canvas that copies symbols on demand (see SVGCanvas.js)
      // only needs to know about the set. Anything else - an icon palette,
      // a bare <defs>, a canvas class that hasn't opted in - gets it all.
      var lazy_canvas = js_SVGCanvas.lazyCanvasFor(element);
      if (lazy_canvas) {
        lazy_canvas.addSymbolSource(template);
        return;
      }
      var copy = element.ownerDocument.importNode(template, true);
      if (element instanceof SVGDefsElement) {
        // Caller-supplied <defs> may already hold other symbols - keep the
        // old behaviour of re-applying the CSS variables over all of it.
        element.append(...copy.childNodes);
        use_css_variables(element);
      } else {
        element.appendChild(copy);
      }
    })();
  }
  static fromSVGElement(element, sugar_class) {
    var renderer = new StaticSVGRenderer();
    renderer[container_symbol] = element.parentNode;
    renderer.element = new js_SVGCanvas(element);
    renderer.element.canvas = element;
    upgrade_symbol_elements(element, SVGRenderer.SYMBOLS);
    use_css_variables(element);
    wire_canvas_events(element, handle_events.bind(renderer, element), {
      passive: true,
      capture: false
    });
    var sugar_elements = element.querySelectorAll('g');
    for (var group of sugar_elements) {
      if (!group.hasAttribute('glycanjs:sequence')) {
        continue;
      }
      var sugar = new sugar_class();
      sugar.sequence = group.getAttribute('glycanjs:sequence');
      renderer.addSugar(sugar);
      renderer.rendered.set(sugar, renderer.element.group(group));
      for (var icon of group.querySelectorAll('use')) {
        if (!icon.hasAttribute('glycanjs:location')) {
          continue;
        }
        var rendered_data = {
          residue: {
            element: icon
          }
        };
        if (icon.parentNode !== group) {
          group.appendChild(icon);
        }
        renderer.rendered.set(sugar.locate_monosaccharide(icon.getAttribute('glycanjs:location')), rendered_data);
      }
      for (var link of group.querySelectorAll('g')) {
        if (!link.hasAttribute('glycanjs:location')) {
          continue;
        }
        if (link.parentNode !== group) {
          group.appendChild(link);
          renderer.element.sendToBack(link);
        }
        var _rendered_data = renderer.rendered.get(sugar.locate_monosaccharide(link.getAttribute('glycanjs:location')));
        if (!_rendered_data) {
          console.log('ERROR loading linkage for ', sugar.sequence, 'missing residue at', link.getAttribute('glycanjs:location'));
          continue;
        }
        _rendered_data.linkage = link;
      }
    }
    return renderer;
  }
  resetTags() {
    for (var sugar of this.sugars) {
      var container = this.rendered.get(sugar);
      if (container.tagGroup) {
        for (var el of [...container.tagGroup.element.childNodes]) {
          container.appendChild(el);
        }
      }
    }
  }
  setupContainer(container, sugar) {
    var canvas = this.element;
    if (!container) {
      container = canvas.group();
      container.setAttributeNS(null, 'pointer-events', 'none');
      this.rendered.set(sugar, container);
    }
    container.setAttributeNS(GLYCANJSNS, 'glycanjs:sequence', sugar.sequence);
    if (this.groupTag && !container.tagGroup) {
      container.tagGroup = container.group();
      container.tagGroup.element.setAttribute('class', 'tagged');
    }

    // Move all nodes out of the group
    if (container.tagGroup) {
      for (var el of container.tagGroup.element.childNodes) {
        container.appendChild(el);
      }
      var tag_element_style = container.tagGroup.element.ownerDocument.defaultView.getComputedStyle(container.tagGroup.element);
      if (tag_element_style) {
        var zindex = tag_element_style.getPropertyValue('--zindex').trim() || 0;
        zindex = parseInt(zindex);
        var parent = container.tagGroup.element.parentElement;
        if (zindex < 0) {
          parent.insertBefore(container.tagGroup.element, parent.firstChild);
        }
        if (zindex > 0) {
          parent.insertBefore(container.tagGroup.element, null);
        }
      }
    }
    return container;
  }
  renderLinkageGroup(canvas, sugar, residue) {
    var group = canvas.group();
    var location = sugar.location_for_monosaccharide(residue);
    group.element.setAttributeNS(GLYCANJSNS, 'glycanjs:location', location);
    group.element.setAttribute('part', "linkage_".concat(location));
    return group;
  }
  renderLinkageLabel(canvas, x, y, text, ROTATE, short_axis_pos, LTR) {
    var label = canvas.text(x, y, text);
    label.setAttribute('font-size', SVGRenderer_str(Math.floor(SVGRenderer_SCALE / 3)));
    label.firstChild.setAttribute('dy', '0.75em');
    if (!ROTATE && short_axis_pos < 0) {
      label.setAttribute('text-anchor', 'end');
    }
    if (ROTATE && LTR) {
      label.setAttribute('text-anchor', 'end');
    }
    if (ROTATE && short_axis_pos < 0) {
      label.firstChild.setAttribute('dy', '0em');
    }
    return label;
  }
  removeRendered(elements) {
    if (elements.residue) {
      elements.residue.element.parentNode.removeChild(elements.residue.element);
    }
    if (elements.linkage) {
      if (elements.linkage.element) {
        elements.linkage.element.parentNode.removeChild(elements.linkage.element);
      } else {
        elements.linkage.parentNode.removeChild(elements.linkage);
      }
    }
  }
  renderIcon(container, identifier, residue, sugar) {
    var rotation = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var symbol_prefix = this.icon_prefix ? "".concat(this.icon_prefix, "_") : '';
    // `rotation` is the angle setIconPosition will apply to this icon's own
    // transform once position is known - plain SVGCanvas.use() ignores the
    // extra argument, but FizikoSVGCanvas.use() needs it to counter-rotate
    // texture/hatch angles so they stay screen-aligned regardless of a
    // residue's own rotation (see FizikoSVGCanvas.js).
    var icon = container.use("#".concat(symbol_prefix).concat(identifier), 0, 0, 1, 1, rotation);
    var location = sugar.location_for_monosaccharide(residue);
    icon.setAttributeNS(GLYCANJSNS, 'glycanjs:identifier', residue.identifier);
    icon.setAttributeNS(GLYCANJSNS, 'glycanjs:location', location);
    icon.setAttributeNS(GLYCANJSNS, 'glycanjs:parent', residue.parent ? sugar.location_for_monosaccharide(residue.parent) : '');
    icon.setAttribute('part', "residue_location_".concat(location));
    return {
      element: icon
    };
  }
  setIconPosition(icon, x, y, width, height, rotate) {
    var rotate_str = '';
    if (rotate !== 0) {
      rotate_str = "rotate(".concat(SVGRenderer_str(rotate), ",").concat(SVGRenderer_str(x + width / 2), ",").concat(SVGRenderer_str(y + height / 2), ")");
    }
    var transform = "".concat(rotate_str, " translate(").concat(SVGRenderer_str(x), ",").concat(SVGRenderer_str(y), ") scale(").concat(SVGRenderer_str(width), ",").concat(SVGRenderer_str(height), ")");
    icon.element.setAttribute('transform', transform);
  }
  screenCoordinatesFromLayout(layout) {
    var svg = this.element.canvas;
    var pt = svg.createSVGPoint();
    var xend = layout.x + layout.width;
    var yend = layout.y + layout.height;
    pt.x = layout.x * SVGRenderer_SCALE;
    pt.y = layout.y * SVGRenderer_SCALE;
    var transformed = pt.matrixTransform(svg.getScreenCTM());
    layout.x = transformed.x;
    layout.y = transformed.y;
    pt.x = xend * SVGRenderer_SCALE;
    pt.y = yend * SVGRenderer_SCALE;
    transformed = pt.matrixTransform(svg.getScreenCTM());
    layout.width = transformed.x - layout.x;
    layout.height = transformed.y - layout.y;
    return layout;
  }
  scaleToFit() {
    var padding = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_PADDING;
    var svg = this.element.canvas;
    var bb = svg.getBBox();
    var bbx = bb.x - SVGRenderer_SCALE * padding.side;
    var bby = bb.y - SVGRenderer_SCALE * padding.top;
    var bbw = bb.width + 2 * SVGRenderer_SCALE * padding.side;
    var bbh = bb.height + 2 * SVGRenderer_SCALE * padding.top;
    var vb = [bbx, bby, bbw, bbh];
    svg.setAttribute('viewBox', vb.join(' '));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }
}
StaticSVGRenderer = class extends SVGRenderer {
  layoutFor(residue) {
    var _this$rendered$get$re = this.rendered.get(residue).residue.element.getBoundingClientRect(),
      x = _this$rendered$get$re.x,
      y = _this$rendered$get$re.y,
      width = _this$rendered$get$re.width,
      height = _this$rendered$get$re.height;
    return {
      x,
      y,
      width,
      height
    };
  }
  screenCoordinatesFromLayout(layout) {
    return layout;
  }
};
SVGRenderer.DEFAULT_PADDING = DEFAULT_PADDING;

/* harmony default export */ const js_SVGRenderer = (SVGRenderer);
// EXTERNAL MODULE: ./node_modules/es6-tween/bundled/Tween.min.js
var Tween_min = __webpack_require__(88);
;// ./node_modules/glycan.js/js/CanvasCanvas.js
/*global */


var torender = Symbol('torender');
class RenderTree {
  constructor() {
    this[torender] = [];
  }
  get torender() {
    return this[torender];
  }
  appendChild(el) {
    if (el.parent) {
      el.parent.torender.splice(el.parent.torender.indexOf(el), 1);
    }
    el.parent = this;
    this.torender.push(el);
  }
  sendToBack(el) {
    el.parent.torender.unshift(el.parent.torender.splice(el.parent.torender.indexOf(el), 1)[0]);
    return el;
  }
  sendToFront(el) {
    el.parent.torender.push(el.parent.torender.splice(el.parent.torender.indexOf(el), 1)[0]);
    return el;
  }
  remove(el) {
    this.torender.splice(this.torender.indexOf(el), 1);
  }
}
var render_text = function render_text(canvas) {
  var ctx = canvas.getContext('2d');
  ctx.font = "".concat(this.options['font-size'] || 25, "px Helvetica");
  ctx.textAlign = 'left';
  if (this.options['text-anchor']) {
    ctx.textAlign = this.options['text-anchor'];
  }
  ctx.textBaseline = 'top';
  if (this.options.dy) {
    ctx.textBaseline = 'middle';
  }
  ctx.fillStyle = '#111';
  ctx.fillText(this.text, this.x, this.y);
};
var render_line = function render_line(canvas) {
  var ctx = canvas.getContext('2d');
  if (this.options['stroke-width']) {
    ctx.lineWidth = this.options['stroke-width'];
  }
  if (this.options.stroke) {
    ctx.strokeStyle = this.options.stroke;
  }
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x2, this.y2);
  ctx.stroke();
};
var ICONS_CACHE = new Map();

// Tracks, per destination <canvas> element, every icon draw issued during
// the current render pass that's still waiting on its (possibly still-
// loading, for a never-before-seen icon type) Image. iconsReady(canvas)
// lets a caller (see CanvasRenderer.js's render()/paint()) know when a
// frame's icons have actually finished drawing - render_icon() itself is
// synchronous from perform_rendering()'s point of view, but the real
// ctx.drawImage() only happens once the Image's 'load' event fires, which
// can be well after paint() has already returned for an icon type drawn
// for the first time (later uses hit ICONS_CACHE and resolve immediately).
var PENDING_ICON_DRAWS = new WeakMap();
var render_icon = function render_icon(canvas) {
  var ctx = canvas.getContext('2d');
  var image = ICONS_CACHE.get(this.src);
  if (!image) {
    image = new Image();
    image.src = this.src;
    image.loaded = new Promise(resolve => {
      image.addEventListener('load', resolve);
    });
  }
  ICONS_CACHE.set(this.src, image);
  var drawn = image.loaded.then(() => {
    // this.rotate (degrees, same convention as SVGRenderer's setIconPosition
    // - see glycan.js/js/SVGRenderer.js - rotating around the icon's own
    // center) is set by CanvasRenderer.js's setIconPosition() but was never
    // actually applied here - invisible for a symmetric icon (circle,
    // square), but very visible for one that isn't (e.g. GlcA's two-tone
    // split-hexagon symbol), which just drew unrotated regardless of
    // horizontal-mode layout.
    if (this.rotate) {
      var cx = this.x + this.width / 2;
      var cy = this.y + this.height / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotate * Math.PI / 180);
      ctx.translate(-cx, -cy);
      ctx.drawImage(image, this.x, this.y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.drawImage(image, this.x, this.y, this.width, this.height);
    }
  });
  if (!PENDING_ICON_DRAWS.has(canvas)) {
    PENDING_ICON_DRAWS.set(canvas, []);
  }
  PENDING_ICON_DRAWS.get(canvas).push(drawn);
};

// Resolves once every icon draw issued for `canvas` since the last call to
// resetIconsReady(canvas) has actually painted. Call after a render pass
// completes (synchronously) to await the asynchronous tail of it.
var iconsReady = function iconsReady(canvas) {
  return Promise.all(PENDING_ICON_DRAWS.get(canvas) || []);
};

// Starts a fresh batch for iconsReady() to track - call before a render
// pass begins, so a later iconsReady() call only waits on THIS pass's
// icons, not also every earlier pass's (already-resolved, but still
// accumulating forever otherwise) promises.
var resetIconsReady = function resetIconsReady(canvas) {
  PENDING_ICON_DRAWS.set(canvas, []);
};
class Canvas extends RenderTree {
  constructor(canvas) {
    super();
    if (canvas) {
      this.canvas = canvas;
    }
  }
  createElement(tag) {
    var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.canvas.ownerDocument;
    return doc.createElement(tag);
  }
  group(a_g) {
    if (!a_g) {
      a_g = new Canvas();
      this.appendChild(a_g);
    }
    return a_g;
  }
  use(ref, x, y, width, height) {
    var icon = {
      icon: ref,
      x,
      y,
      width,
      height,
      render: render_icon
    };
    this.appendChild(icon);
    return icon;
  }
  rect() {}
  line(x, y, x2, y2) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var a_line = {
      x,
      y,
      x2,
      y2,
      options,
      render: render_line
    };
    this.appendChild(a_line);
    return a_line;
  }
  text(x, y, text) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var a_text = {
      x,
      y,
      text,
      options,
      render: render_text
    };
    this.appendChild(a_text);
    return a_text;
  }
}
/* harmony default export */ const CanvasCanvas = (Canvas);

;// ./node_modules/glycan.js/lib/canvas-mouse.js
/*!
	canvas-mouse 0.8.0-alpha
	Copyright (c) 2017 Epistemex
	MIT license.
*/

;
"use strict";

/**
 * A mouse and touch position handler for 2D canvas able to handle scaled
 * and transformed context and element.
 *
 * @param {CanvasRenderingContext2D} context - 2D context to bind to this instance
 * @param {CanvasMouseOptions} [options] - optional options object to allow for scale and transforms to be considered.
 * @constructor
 */
function CanvasMouse(context, options) {
  if (!(context instanceof CanvasRenderingContext2D)) throw "Need a 2D canvas context.";
  options = Object.assign({
    handleScale: false,
    handleTransforms: false,
    handleResize: true,
    handleScroll: true,
    onchange: null,
    matrix: null,
    plugins: []
  }, options);
  var me = this,
    defProp = Object.defineProperty.bind(Object),
    ref,
    hasCurrentTransform = "currentTransform" in context || "mozCurrentTransform" in context,
    plugins = options.plugins,
    deltaX,
    deltaY,
    scaleX,
    scaleY,
    paddingBorderLeft,
    paddingBorderTop,
    canvas = context.canvas,
    matrix = options.matrix,
    imatrix = matrix ? matrix.inverse() : null,
    doScale = options.handleScale,
    doTransforms = options.handleTransforms && (hasCurrentTransform || matrix),
    transform = matrix ? _transforms2 : _transforms;

  /*--------------------------------------------------------------------
       INTERNALS
   --------------------------------------------------------------------*/

  // check if we have matrix support
  if (doTransforms && !hasCurrentTransform && !matrix) {
    console.log("currentTransform not supported by browser");
    doTransforms = false;
  }

  // optimize inverse matrix extraction
  function patchMatrix() {
    if (matrix && !matrix._xx) {
      matrix._xx = matrix._x;
      matrix._x = function () {
        imatrix = this.inverse();
        return this._xx();
      };
    }
  }

  // Limit reflow so only read trigger values when absolutely needed
  function init() {
    var rect = canvas.getBoundingClientRect(),
      cs = getComputedStyle(canvas),
      prop = cs.getPropertyValue.bind(cs),
      pFloat = parseFloat,
      _p = "padding-",
      _b = "border-",
      _w = "-width",
      L = "left",
      R = "right",
      T = "top",
      B = "bottom";
    paddingBorderLeft = pFloat(prop(_p + L)) + pFloat(prop(_b + L + _w));
    paddingBorderTop = pFloat(prop(_p + T)) + pFloat(prop(_b + T + _w));
    deltaX = rect.left + paddingBorderLeft;
    deltaY = rect.top + paddingBorderTop;
    scaleX = canvas.width / (rect.width - (paddingBorderLeft + pFloat(prop(_p + R)) + pFloat(prop(_b + R + _w)))) || 1;
    scaleY = canvas.height / (rect.height - (paddingBorderTop + pFloat(prop(_p + B)) + pFloat(prop(_b + B + _w)))) || 1;
  }

  // debounce updates
  function _handlerResize() {
    cancelAnimationFrame(ref);
    ref = requestAnimationFrame(_updateOnResize);
  }

  // debounce updates
  function _handlerScroll() {
    cancelAnimationFrame(ref);
    ref = requestAnimationFrame(_updateOnScroll);
  }
  function _updateOnResize() {
    init();
    if (options.onchange) options.onchange({
      type: "resize",
      timeStamp: Date.now()
    });
  }
  function _updateOnScroll() {
    var rect = canvas.getBoundingClientRect();
    deltaX = rect.left + paddingBorderLeft;
    deltaY = rect.top + paddingBorderTop;
    if (options.onchange) options.onchange({
      type: "scroll",
      timeStamp: Date.now()
    });
  }

  /*--------------------------------------------------------------------
       POINT CONVERTERS
   --------------------------------------------------------------------*/

  // Always called - converts event to relative position
  function _basic(e) {
    return {
      x: e.clientX - deltaX,
      y: e.clientY - deltaY,
      timeStamp: e.timeStamp
    };
  }

  // Scales the point (if enabled)
  function _scale(pos) {
    pos.x *= scaleX;
    pos.y *= scaleY;
    return pos;
  }

  // Transforms the point (if enabled) using the browsers' DOMMatrix
  function _transforms(pos) {
    var currentMatrix = context.currentTransform || context.mozCurrentTransform,
      matrix,
      imatrix;

    // Convert from SVGMatrix (used by Chrome in experimental mode)
    if (currentMatrix instanceof SVGMatrix) currentMatrix = DOMMatrix.fromMatrix(currentMatrix);

    // Firefox returns Array instead of DOMMatrix..
    matrix = typeof currentMatrix.a === "undefined" ? new DOMMatrix(currentMatrix) : currentMatrix;

    // Eventually, get inverse matrix
    imatrix = matrix.invertSelf();
    return {
      x: pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e,
      y: pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f,
      timeStamp: pos.timeStamp
    };
  }

  // Transforms the point (if enabled) using the custom Matrix object
  function _transforms2(pos) {
    var newPos = imatrix.applyToPoint(pos.x, pos.y);
    return {
      x: newPos.x,
      y: newPos.y,
      timeStamp: pos.timeStamp
    };
  }

  /*--------------------------------------------------------------------
       PUBLIC METHODS
   --------------------------------------------------------------------*/

  /**
   * Function to convert mouse or touch position to match the context
   * and its element scale and transforms.
   *
   * @param {*} event - event object (mouse, touch) to use for conversion
   * @returns {Point}
   */
  this.getPos = function (event) {
    var pos = _basic(event);
    if (doScale) pos = _scale(pos);
    if (doTransforms) pos = transform(pos);
    if (plugins.length) {
      for (var i = 0; i < plugins.length; i++) {
        pos = plugins[i].handler(event, pos);
      }
    }
    return pos;
  };

  /**
   * Pass in custom x and y point to convert to new position relative to
   * bound context. The way it's calculated depends on the options set
   * when creating the instance.
   *
   * The method can take both a Point object, or two numbers.
   *
   * @param {number|Point} x - x position to convert, or if Point the x and y of the object.
   * @param {number} [y] - y position to convert (not used if Point object is provided).
   * @returns {Point}
   */
  this.getPosXY = function (x, y) {
    var _x; // to allow optimization (always a number)
    if (arguments.length === 1) {
      y = x.y;
      _x = x.x;
    } else _x = x;
    return me.getPos({
      clientX: _x / scaleX + deltaX,
      clientY: y / scaleY + deltaY,
      timestamp: Date.now()
    });
  };

  /**
   * Adds a plugin that is an object providing a `handler()` method
   * which takes original event and a point as argument in that order.
   * @param {*} plugin - plugin object to add
   */
  this.addPlugin = function (plugin) {
    if (plugins.indexOf(plugin) < 0) plugins.push(plugin);
  };

  /**
   * Removes a previously added plugin object. Must be the same instance
   * as added.
   * @param {*} plugin
   */
  this.removePlugin = function (plugin) {
    var i = plugins.indexOf(plugin);
    if (i > -1) plugins.splice(i, 1);
  };

  /**
   * Force re-initialization. Use if canvas element have either border, padding
   * or size changed.
   * @method
   */
  this.init = init;

  /**
   * Used to manually update relative position in client if not caught
   * automatically by internals (scroll and resize).
   * @method
   */
  this.update = _updateOnScroll;

  /*--------------------------------------------------------------------
       PUBLIC PROPERTIES
   --------------------------------------------------------------------*/

  /**
   * Set or get handleScale status. Can be toggled at any time and will
   * affect next position calculations.
   * @member {boolean} CanvasMouse#handleScale
   */
  defProp(me, "handleScale", {
    get: function get() {
      return doScale;
    },
    set: function set(state) {
      doScale = !!state;
    }
  });

  /**
   * Set or get handleTransforms status. Can be toggled at any time and will
   * affect next position calculations. **Note** that if the browser does not
   * support currentTransform and a custom Matrix is not provided the flag
   * will be set to false regardless.
   * @member {boolean} CanvasMouse#handleTransforms
   */
  defProp(me, "handleTransforms", {
    get: function get() {
      return doTransforms;
    },
    set: function set(state) {
      doTransforms = !!state && (hasCurrentTransform || matrix);
    }
  });

  /**
   * Set or get handleScroll status. Can be toggled at any time and will
   * affect position based on document scrolling.
   * @member {boolean} CanvasMouse#handleScroll
   */
  defProp(me, "handleScroll", {
    get: function get() {
      return options.handleScroll;
    },
    set: function set(state) {
      if (state) {
        window.addEventListener("scroll", _handlerScroll);
        options.handleScroll = true;
      } else {
        window.removeEventListener("scroll", _handlerScroll);
        options.handleScroll = false;
      }
    }
  });

  /**
   * Set or get handleResize status. Can be toggled at any time and will
   * affect position based on document resizing.
   * @member {boolean} CanvasMouse#handleResize
   */
  defProp(me, "handleResize", {
    get: function get() {
      return options.handleResize;
    },
    set: function set(state) {
      if (state) {
        window.addEventListener("resize", _handlerResize);
        options.handleResize = true;
      } else {
        window.removeEventListener("resize", _handlerResize);
        options.handleResize = false;
      }
    }
  });

  /**
   * Set or get callback handler for resize and scroll events if they are enabled.
   * @member {boolean} CanvasMouse#onchange
   */
  defProp(me, "onchange", {
    get: function get() {
      return options.onchange;
    },
    set: function set(handler) {
      options.onchange = handler;
    }
  });

  /**
   * Set or get custom matrix object. If set will override and patch the
   * provided matrix.
   * @member {Matrix} CanvasMouse#matrix
   */
  defProp(me, "matrix", {
    get: function get() {
      return matrix;
    },
    set: function set(newMatrix) {
      matrix = newMatrix;
      doTransforms = doTransforms && (hasCurrentTransform || matrix);
      patchMatrix();
    }
  });

  /*--------------------------------------------------------------------
       INITIALIZE INSTANCE
   --------------------------------------------------------------------*/

  patchMatrix();
  init();
  me.handleResize = options.handleResize;
  me.handleScroll = options.handleScroll;
}

/**
 * Valid properties for the option object passed to CanvasMouse constructor.
 * The object is intended to be an literal object.
 *
 * The default settings handle padding and borders.
 *
 * @name CanvasMouseOptions
 * @prop {boolean} [handleScale=false] - handles situations where element size is different than the bitmap size.
 * @prop {boolean} [handleTransforms=false] - consider transforms applied to the context when calculating position.
 *  Note that this require either `currentTransform` support on the context,
 *  or the use of a custom Matrix solution (github.com/epistemex/transformation-matrix-js).
 * @prop {boolean} [handleResize=true] - handles resize of browser window triggering re-initialization
 * @prop {boolean} [handleScroll=true] - handles scrolling of browser window triggering re-initialization
 * @prop {Matrix} [matrix=null] - to support broader range of browser a custom matrix object can be passed already bound
 *  to the current context (same as passed as argument). Using a custom matrix will require the transforms to be called on this
 *  instead of the context itself.
 * @prop {Array} [plugins] - array holding plugin objects. Plugins can be added and removed at a later point too.
 * @prop {Function} [onchange=null] - callback for scroll/resize events. "Event" holds `timeStamp` (integer) and `type` (string) properties. `type` can be "scroll" or "resize".
 *  Note that this callback is *debounced* and recommended to handle scroll/resize callback to update the canvas.
 */

/**
 * Point object
 * @name Point
 * @prop {number} x - floating point number for x position
 * @prop {number} y - floating point number for y position
 * @prop {number} timeStamp - timestamp for when event happened
 */

/* harmony default export */ const canvas_mouse = (CanvasMouse);
;// ./node_modules/glycan.js/js/CanvasRenderer.js
/*global */


function CanvasRenderer_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function CanvasRenderer_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { CanvasRenderer_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { CanvasRenderer_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function CanvasRenderer_slicedToArray(r, e) { return CanvasRenderer_arrayWithHoles(r) || CanvasRenderer_iterableToArrayLimit(r, e) || CanvasRenderer_unsupportedIterableToArray(r, e) || CanvasRenderer_nonIterableRest(); }
function CanvasRenderer_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function CanvasRenderer_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return CanvasRenderer_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? CanvasRenderer_arrayLikeToArray(r, a) : void 0; } }
function CanvasRenderer_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function CanvasRenderer_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function CanvasRenderer_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
;





var CanvasRenderer_module_string = 'glycanjs:canvasrenderer';
var CanvasRenderer_container_symbol = Symbol('document_container');
var CanvasRenderer_SCALE = 100;
var CanvasRenderer_log = debugAny(CanvasRenderer_module_string);
var done_tweening = Symbol('done_tween');
var extend_boundaries = (current, newcoords) => {
  current.x.push(newcoords[0]);
  current.y.push(newcoords[1]);
  return current;
};
var _get_bounding_boxes = function get_bounding_boxes(renderobj) {
  var boundaries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    x: [],
    y: []
  };
  if (renderobj.torender) {
    for (var el of renderobj.torender) {
      boundaries = _get_bounding_boxes(el, boundaries);
    }
    return boundaries;
  }
  if (renderobj.x2) {
    extend_boundaries(boundaries, [renderobj.x, renderobj.y]);
    extend_boundaries(boundaries, [renderobj.x2, renderobj.y2]);
  }
  if (renderobj.width) {
    extend_boundaries(boundaries, [renderobj.x, renderobj.y]);
    extend_boundaries(boundaries, [renderobj.x + renderobj.width, renderobj.y + renderobj.height]);
  }
  if (renderobj.text) {
    extend_boundaries(boundaries, [renderobj.x, renderobj.y]);
    extend_boundaries(boundaries, [renderobj.x, renderobj.y]);
  }
  return boundaries;
};
class CanvasMatrix {
  constructor(vals) {
    this._mat = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();
    this._mat.a = vals[0];
    this._mat.b = vals[1];
    this._mat.c = vals[2];
    this._mat.d = vals[3];
    this._mat.e = vals[4];
    this._mat.f = vals[5];
  }
  applyToPoint(x, y) {
    var dompt = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGPoint();
    dompt.x = x;
    dompt.y = y;
    var inverted = dompt.matrixTransform(this._mat);
    return inverted;
  }
  inverse() {
    var mtrx = this._mat.inverse();
    var vals = [mtrx.a, mtrx.b, mtrx.c, mtrx.d, mtrx.e, mtrx.f];
    return new CanvasMatrix(vals);
  }
  multiply(matrix) {
    var mtrx = this._mat.multiply(matrix._mat);
    var vals = [mtrx.a, mtrx.b, mtrx.c, mtrx.d, mtrx.e, mtrx.f];
    return new CanvasMatrix(vals);
  }
}
var _perform_rendering = function perform_rendering(canvas, renderobj) {
  if (renderobj.torender) {
    for (var el of renderobj.torender) {
      _perform_rendering(canvas, el);
    }
    return;
  }
  if (renderobj.render) {
    renderobj.render(canvas);
  }
};

// Reassigning canvas.width/height -- even to the SAME value -- resets the
// whole backing store per spec, a real reallocation that's pricier in
// Firefox than Chromium/WebKit. Harmless for an occasional redraw, but
// WobbleCanvasRenderer paints on every single animation frame forever, so
// paying that cost 30-60 times a second was the main source of jank. Only
// actually resize when the bbox-derived size changed; otherwise just clear
// the pixels, which is far cheaper.
var resize_or_clear = function resize_or_clear(canvas, ctx, target_width, target_height) {
  if (canvas.width !== target_width || canvas.height !== target_height) {
    canvas.width = target_width;
    canvas.height = target_height;
    return;
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
};

// getBoundingClientRect() forces a synchronous layout reflow -- also pricier
// in Firefox, and again not worth repeating every animation frame when the
// CSS-rendered size only actually changes on a real resize. Cache it on the
// canvas and refresh via ResizeObserver/window resize instead.
var get_cached_rect = function get_cached_rect(canvas) {
  if (!canvas._rectObserverAttached) {
    var refresh = () => {
      canvas._rectCache = canvas.getBoundingClientRect();
    };
    refresh();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(refresh).observe(canvas);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', refresh, {
        passive: true
      });
    }
    canvas._rectObserverAttached = true;
  }
  return canvas._rectCache;
};
var render = function render(canvas, renderobj, controller) {
  var coords = _get_bounding_boxes(renderobj);
  coords.x = coords.x.map((val, idx, arr) => {
    if (idx % 2 === 0) {
      return 0.5 * (val + arr[idx + 1]);
    }
  }).filter(x => typeof x !== 'undefined');
  coords.y = coords.y.map((val, idx, arr) => {
    if (idx % 2 === 0) {
      return 0.5 * (val + arr[idx + 1]);
    }
  }).filter(x => typeof x !== 'undefined');
  var min_x = Math.min(...coords.x) - 100;
  var max_x = Math.max(...coords.x) + 100;
  var min_y = Math.min(...coords.y) - 100;
  var max_y = Math.max(...coords.y) + 100;
  var scale = 1;
  var target_width = scale * (max_x - min_x) | 0;
  var target_height = scale * (max_y - min_y) | 0;
  var ctx = canvas.getContext('2d');
  resize_or_clear(canvas, ctx, target_width, target_height);

  // Starts a fresh batch for iconsReady(canvas) (see CanvasCanvas.js) to
  // track, so a caller awaiting it after this pass only waits on icons
  // drawn THIS pass, not also every earlier pass's already-resolved ones.
  resetIconsReady(canvas);
  var _get_cached_rect = get_cached_rect(canvas),
    actual_width = _get_cached_rect.width,
    actual_height = _get_cached_rect.height;
  var svg_h = canvas.height;
  var h = actual_height || 1;
  var svg_w = canvas.width;
  var w = actual_width || 1;
  var canvas_transforms;
  if (svg_h > svg_w) {
    var centering_matrix = new CanvasMatrix([svg_h / h, 0, 0, svg_h / h, 0, 0]).multiply(new CanvasMatrix([1, 0, 0, 1, -0.5 * w, 0]));
    canvas_transforms = new CanvasMatrix([1, 0, 0, 1, 0.5 * svg_w, 0]).multiply(centering_matrix);
  } else {
    var _centering_matrix = new CanvasMatrix([svg_w / w, 0, 0, svg_w / w, 0, 0]).multiply(new CanvasMatrix([1, 0, 0, 1, 0, -0.5 * h]));
    canvas_transforms = new CanvasMatrix([1, 0, 0, 1, 0, 0.5 * svg_h]).multiply(_centering_matrix);
  }
  ctx.setTransform(scale, 0, 0, scale, -1 * scale * min_x, -1 * scale * min_y);
  canvas.cm = new canvas_mouse(ctx, {
    handleScale: false,
    handleTransforms: true,
    matrix: new CanvasMatrix([scale, 0, 0, scale, -1 * scale * min_x, -1 * scale * min_y])
  });
  canvas.cm.centering_matrix = canvas_transforms;
  canvas.screenToCanvasMatrix = new CanvasMatrix([scale, 0, 0, scale, -1 * scale * min_x, -1 * scale * min_y]).inverse().multiply(canvas_transforms);

  // Duck-typed hook for a renderer that wants every residue to sway together
  // around one shared axis (see WobbleCanvasRenderer) instead of each doing
  // its own independent, self-centered motion. `controller` is only ever a
  // renderer instance (passed in from `paint()`) or undefined -- plain
  // CanvasRenderer and every renderer that isn't wobble-aware has no
  // `applySway`, so this is a no-op for them and behaviour is unchanged.
  // The bounding box is already computed above for sizing the canvas, so
  // this reuses it rather than walking the tree again.
  if (controller && controller.applySway) {
    ctx.save();
    controller.applySway(ctx, {
      minX: min_x,
      maxX: max_x,
      minY: min_y,
      maxY: max_y
    });
    _perform_rendering(canvas, renderobj);
    ctx.restore();
  } else {
    _perform_rendering(canvas, renderobj);
  }
};
var populate_path = element => {
  var path = {};
  path.fill = element.getAttribute('fill');
  if (element.getAttribute('stroke-width') && parseFloat(element.getAttribute('stroke-width')) > 0) {
    path.stroke = element.getAttribute('stroke');
  }
  if (element.getAttribute('transform')) {
    var _element$getAttribute = element.getAttribute('transform').match(/rotate\((\d+),(\d+),(\d+)\)/),
      _element$getAttribute2 = CanvasRenderer_slicedToArray(_element$getAttribute, 4),
      match_str = _element$getAttribute2[0],
      angle = _element$getAttribute2[1],
      cx = _element$getAttribute2[2],
      cy = _element$getAttribute2[3];
    if (match_str.length > 0) {
      path.rotate = {
        angle,
        cx,
        cy
      };
    }
  }
  return path;
};
var extract_paths = symbol => {
  var paths = [];
  for (var path of symbol.querySelectorAll('path')) {
    var a_path = populate_path(path);
    a_path.d = path.getAttribute('d');
    paths.push(a_path);
  }
  for (var _path of symbol.querySelectorAll('circle')) {
    var _a_path = populate_path(_path);
    _a_path.cx = parseFloat(_path.getAttribute('cx'));
    _a_path.cy = parseFloat(_path.getAttribute('cy'));
    _a_path.r = parseFloat(_path.getAttribute('r'));
    paths.push(_a_path);
  }
  for (var _path2 of symbol.querySelectorAll('rect')) {
    var _a_path2 = populate_path(_path2);
    var x = _path2.getAttribute('x');
    var y = _path2.getAttribute('y');
    var x2 = parseFloat(_path2.getAttribute('x')) + parseFloat(_path2.getAttribute('width'));
    var y2 = parseFloat(_path2.getAttribute('y')) + parseFloat(_path2.getAttribute('height'));
    _a_path2.d = "M".concat(x, ",").concat(y, " ").concat(x2, ",").concat(y, " ").concat(x2, ",").concat(y2, " ").concat(x, ",").concat(y2, " z");
    paths.push(_a_path2);
  }
  for (var _path3 of symbol.querySelectorAll('polyline')) {
    var _a_path3 = populate_path(_path3);
    _a_path3.d = 'M' + _path3.getAttribute('points') + 'Z';
    paths.push(_a_path3);
  }
  for (var _path4 of symbol.querySelectorAll('text')) {
    var _a_path4 = populate_path(_path4);
    _a_path4.fontSize = _path4.getAttribute('font-size');
    _a_path4.text = _path4.textContent;
    var _x = _path4.getAttribute('x');
    var _y = _path4.getAttribute('y');
    _a_path4.x = _x;
    _a_path4.y = _y;
    paths.push(_a_path4);
  }
  return paths;
};
var all_symbols = Symbol('global_symbols');
var performing_import = Symbol('performing_import');
var _import_icons;
var TweenMap = new WeakMap();
var CanvasRenderer_supported_events = 'mousemove mousedown mouseup click touchstart touchend touchmove drop dragover';
var CanvasRenderer_wire_canvas_events = function wire_canvas_events(canvas, callback) {
  for (var target of CanvasRenderer_supported_events.split(' ')) {
    canvas.addEventListener(target, callback, {
      passive: true,
      capture: true
    });
  }
};
var CanvasRenderer_handle_events = function handle_events(canvas, event) {
  if (event.clientX) {
    var rect = canvas.getBoundingClientRect();
    var transformed = canvas.screenToCanvasMatrix.applyToPoint(event.clientX - rect.x, event.clientY - rect.y);
    var xpos = transformed.x / CanvasRenderer_SCALE;
    var ypos = transformed.y / CanvasRenderer_SCALE;
    event.sugarX = xpos;
    event.sugarY = ypos;
  }
};
var inside_icon = (x, y, icon) => {
  x = x * CanvasRenderer_SCALE;
  y = y * CanvasRenderer_SCALE;
  return x >= icon.x && x <= icon.x + icon.width && y >= icon.y && y <= icon.y + icon.height;
};
var proxy_bounds = (x, y) => {
  return {
    left: x,
    top: y,
    width: 0,
    height: 0
  };
};
var retarget_event = function retarget_event(ev) {
  if (!ev.sugarX && !ev.sugarY) {
    return;
  }
  var inside_icons = [...this.iconset].filter(inside_icon.bind(null, ev.sugarX, ev.sugarY));
  var target_type = ev.type;
  for (var icon of inside_icons) {
    if (icon.hasElement()) {
      ev.stopImmediatePropagation();
      var new_ev = new Event(target_type, {
        bubbles: true
      });
      icon.element.getBoundingClientRect = proxy_bounds.bind(null, ev.clientX, ev.clientY);
      icon.element.dispatchEvent(new_ev);
      if (target_type === 'dragover' && this.last_dragenter !== icon) {
        if (this.last_dragenter) {
          delete this.last_dragenter;
          new_ev = new Event('dragleave', {
            bubbles: true
          });
          icon.element.dispatchEvent(new_ev);
        }
        new_ev = new Event('dragenter', {
          bubbles: true
        });
        icon.element.dispatchEvent(new_ev);
        this.last_dragenter = icon;
      }
      return;
    }
  }
  if (inside_icons.length < 1 && target_type === 'dragover') {
    if (this.last_dragenter) {
      var _new_ev = new Event('dragleave', {
        bubbles: true
      });
      this.last_dragenter.element.dispatchEvent(_new_ev);
      delete this.last_dragenter;
    }
  }
};
class CanvasRenderer extends js_Renderer {
  constructor(container, layout) {
    CanvasRenderer_log('CanvasRenderer');
    super(container, layout);
    (0,Tween_min.autoPlay)(true);
    this.iconset = new Set();
    (0,Tween_min.onTick)(() => {
      if (this.animating) {
        this.paint();
      }
    });
    this.ready = _import_icons.call(this);
    var canvas;
    if (container) {
      if (!(container instanceof HTMLCanvasElement)) {
        this[CanvasRenderer_container_symbol] = container;
        CanvasRenderer_log.info('Creating canvas element');
        canvas = container.ownerDocument.createElement('canvas');
        canvas.setAttribute('width', '1px');
        canvas.setAttribute('height', '1px');
        container.appendChild(canvas);
      } else {
        canvas = container;
      }
      this.element = new CanvasCanvas(canvas);
      CanvasRenderer_wire_canvas_events(this.element.canvas, CanvasRenderer_handle_events.bind(this, this.element.canvas), {
        passive: true,
        capture: false
      });
      for (var ev of ['click', 'dragover']) {
        this.element.canvas.addEventListener(ev, retarget_event.bind(this), {
          capture: true
        });
      }
    }
  }
  static AppendSymbols(element) {
    var _arguments = arguments,
      _this = this;
    return CanvasRenderer_asyncToGenerator(function* () {
      var SYMBOLS_STRING = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : _this.SYMBOLS;
      return element.ready;
    })();
  }
  static get Canvas() {
    return CanvasCanvas;
  }
  static get SYMBOLS() {
    return sugars;
  }
  static get GLOBAL_SCALE() {
    return CanvasRenderer_SCALE;
  }
  get animating() {
    for (var res of this.iconset) {
      if (!res.rendered) {
        return true;
      }
    }
    return false;
  }
  setupContainer(container, sugar) {
    var canvas = this.element;
    if (!container) {
      container = canvas.group();
      this.rendered.set(sugar, container);
    }
    if (this.groupTag && !container.tagGroup) {
      container.tagGroup = container.group();
    }

    // Move all nodes out of the group
    if (container.tagGroup) {
      for (var el of container.tagGroup.element.childNodes) {
        container.appendChild(el);
      }
    }
    return container;
  }
  renderLinkageGroup(canvas) {
    return canvas.group();
  }
  renderLinkageLabel(canvas, x, y, text, ROTATE, short_axis_pos) {
    var label = canvas.text(x, y, text);
    if (!ROTATE && short_axis_pos < 0) {
      label['text-anchor'] = 'end';
    }
    return label;
  }
  removeRendered(elements) {
    if (elements.residue) {
      elements.residue.parent.remove(elements.residue);
      if (elements.residue.element) {
        elements.residue.element.parentNode.removeChild(elements.residue.element);
      }
      if (this.iconset.has(elements.residue)) {
        this.iconset.delete(elements.residue);
      }
    }
    if (elements.linkage) {
      elements.linkage.parent.remove(elements.linkage);
    }
  }
  setIconPosition(icon, x, y, width, height, rotate) {
    if (TweenMap.get(icon)) {
      TweenMap.get(icon).stop();
    }
    TweenMap.set(icon, new Tween_min.Tween(icon));
    var tween = TweenMap.get(icon);
    var timing = 200;
    icon.rendered = false;
    clearTimeout(icon[done_tweening]);
    if (icon.x === x && icon.y === y && icon.width === width && icon.height === height) {
      icon.rendered = true;
      return;
    }
    if (!this.iconset.has(icon)) {
      this.iconset.add(icon);
      icon.x = x;
      icon.y = y;
      icon.width = width;
      icon.height = height;
      icon.rotate = rotate;
      timing = 0;
      icon.rendered = true;
    }
    tween.to({
      x: x,
      y: y,
      width: width,
      height: height,
      rotate: rotate
    }, timing).on('complete', icon => {
      icon[done_tweening] = setTimeout(() => {
        icon.rendered = true;
      }, 100);
    }).start();
  }
  screenCoordinatesFromLayout(layout) {
    var canvas = this.element.canvas;
    var pt = {
      x: 0,
      y: 0
    };
    var xend = layout.x + layout.width;
    var yend = layout.y + layout.height;
    pt.x = layout.x * CanvasRenderer_SCALE;
    pt.y = layout.y * CanvasRenderer_SCALE;
    var transformed = canvas.screenToCanvasMatrix.inverse().applyToPoint(pt.x, pt.y);
    layout.x = transformed.x;
    layout.y = transformed.y;
    pt.x = xend * CanvasRenderer_SCALE;
    pt.y = yend * CanvasRenderer_SCALE;
    transformed = canvas.screenToCanvasMatrix.inverse().applyToPoint(pt.x, pt.y);
    layout.width = transformed.x - layout.x;
    layout.height = transformed.y - layout.y;
    layout.x += canvas.getBoundingClientRect().x;
    layout.y += canvas.getBoundingClientRect().y;
    return layout;
  }
  renderIcon(container, identifier) {
    var icon = container.use(identifier, 0, 0, 1, 1);
    icon.src = this.symbols[identifier].svg;
    icon.paths = this.symbols[identifier].paths;
    var canvas = this.element.canvas;
    Object.defineProperty(icon, 'element', {
      get: function get() {
        if (!this._element) {
          this._element = canvas.ownerDocument.createElement('button');
          canvas.appendChild(this._element);
        }
        return this._element;
      }
    });
    icon.hasElement = () => '_element' in icon;
    return icon;
  }
  scaleToFit() {}
  paint() {
    render(this.element.canvas, this.element, this);
    // Exposed so a subclass that post-processes the canvas after paint()
    // (e.g. legra-glycan.js's LegraCanvasRenderer, which snapshots it) can
    // await every icon actually finishing its draw first - render_icon()
    // in CanvasCanvas.js only draws once a (possibly still-loading, for an
    // icon type never drawn before) Image's 'load' event fires, which can
    // be well after this synchronous call already returned.
    this.iconsReady = iconsReady(this.element.canvas);
  }
  refresh() {
    var _this2 = this;
    return CanvasRenderer_asyncToGenerator(function* () {
      return _this2.ready.then(/*#__PURE__*/CanvasRenderer_asyncToGenerator(function* () {
        yield js_Renderer.prototype.refresh.call(_this2);
        _this2.paint();
      }));
    })();
  }
}
var import_status = new WeakMap();
_import_icons = function import_icons() {
  var renderer_class = this.constructor;
  var icons = document.createElement('svg');
  if (import_status.has(renderer_class)) {
    return new Promise(resolve => {
      setTimeout(() => {
        _import_icons.call(this).then(resolve);
      }, 0);
    });
  }
  if (typeof renderer_class[all_symbols] !== 'undefined') {
    this.symbols = renderer_class[all_symbols];
    return Promise.resolve();
  }
  import_status.set(renderer_class, true);
  this.symbols = {};
  return Promise.resolve(renderer_class.SYMBOLS).then(symbols_string => icons.innerHTML = symbols_string).then(() => {
    for (var symbol of icons.querySelectorAll('defs symbol')) {
      var symboltext = symbol.innerHTML.replace(/#/g, '%23');
      var paths = extract_paths(symbol);
      var svg_text = "data:image/svg+xml;utf8,<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0\" y=\"0\" width=\"100px\" height=\"100px\">".concat(symboltext, "</svg>");
      this.symbols[symbol.getAttribute('id')] = {
        svg: svg_text,
        paths
      };
    }
    renderer_class[all_symbols] = this.symbols;
    import_status.delete(renderer_class);
  });
};
CanvasRenderer.DEFAULT_PADDING = {
  top: 0,
  side: 0
};
/* harmony default export */ const js_CanvasRenderer = (CanvasRenderer);
;// ./node_modules/glycan.js/js/WobbleCanvasRenderer.js
/*global */




// A renderer whose icons bake their own continuous wobble (isomer-glycan.js,
// zdog-glycan.js) needs the shared tick loop to keep repainting forever,
// not just while a layout tween is in flight -- CanvasRenderer's own
// `animating` only covers the latter. Centralising that override here (it
// was previously copy-pasted verbatim into both IsomerCanvasRenderer and
// ZDogCanvasRenderer) also gives both renderers a single, shared place for
// `applySway` below, instead of each reimplementing the same bbox-center
// math independently.
class WobbleCanvasRenderer extends js_CanvasRenderer {
  get animating() {
    return true;
  }

  // CanvasRenderer.render() calls this once per paint, right before it
  // descends into the tree, with the save/restore already applied around
  // it -- so anything done to `ctx` here (a translate/rotate here) composes
  // underneath every icon's own independent save/translate/restore. `bbox`
  // is the whole tree's bounding box, already computed by render() for
  // sizing the canvas.
  //
  // A flat 2D canvas only ever has ONE rotation to give -- there's no
  // separate X/Y tilt available here the way there is in each package's own
  // 3D scene -- so the whole-molecule sway always uses channel `z` of the
  // wobble vector below. By convention, channel `z` is whichever of a
  // renderer's own 3D axes represents "spin around the vertical world axis"
  // for that library (see isomer-glycan.js/zdog-glycan.js's own render_icon
  // for how each one maps it onto its own axes).
  applySway(ctx, bbox) {
    var wobble = this.constructor.wobble;
    if (!wobble) {
      return;
    }
    var angle = this.currentWobbleAngle(wobble);
    var cx = (bbox.minX + bbox.maxX) / 2;
    var cy = (bbox.minY + bbox.maxY) / 2;
    ctx.translate(cx, cy);
    ctx.rotate(angle.z);
    ctx.translate(-cx, -cy);

    // Stashed on the root Canvas instance (`this.element`) so the icons
    // themselves -- plain per-icon render functions in isomer-glycan.js/
    // zdog-glycan.js, with no reference back to this renderer -- can read
    // the SAME three-channel angle for their own per-icon 3D tilt, via the
    // `.parent` chain every icon already has (set by CanvasCanvas.js's
    // `appendChild`), rather than each independently recomputing (or
    // separately wiring a sensor into) a wobble of their own.
    if (this.element) {
      this.element.wobbleAngle = angle;
    }
  }

  // The {x, y, z} angle vector this frame's sway (and, via `.wobbleAngle`
  // above, every icon's own tilt) should use: live device-orientation once
  // `enableTilt()` has been granted permission and received at least one
  // reading, otherwise the original continuous time-based sine -- each
  // channel scaled independently by `wobble.amplitude`'s own {x, y, z}, so a
  // renderer can make one axis swing much further than another.
  currentWobbleAngle() {
    var wobble = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.constructor.wobble;
    if (this._liveTiltAngle) {
      return this._liveTiltAngle;
    }
    var amplitude = wobble.amplitude,
      period = wobble.period;
    var t = performance.now() / period * 2 * Math.PI;
    return {
      x: (amplitude.x || 0) * Math.sin(t),
      y: (amplitude.y || 0) * Math.sin(t),
      z: (amplitude.z || 0) * Math.sin(t)
    };
  }

  // Makes the sway (and every icon's own tilt) follow the device's physical
  // tilt instead of the time-based sine, once permission is granted. Must be
  // called from inside a direct user-gesture handler (a click/change
  // listener, not a Promise callback or a reactive lifecycle hook) -- iOS
  // Safari's `DeviceOrientationEvent.requestPermission()` only resolves
  // 'granted' when invoked synchronously from one; everywhere else
  // (desktop/Android) the event just needs a listener, no prompt. Resolves
  // to the permission state so the caller can store/display it; safe to call
  // more than once (a second call just re-attaches).
  enableTilt() {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      return Promise.resolve('unsupported');
    }
    var attach = () => {
      this.disconnect();
      this._tiltHandler = event => {
        var wobble = this.constructor.wobble || {
          amplitude: {
            x: 15 * Math.PI / 180,
            y: 15 * Math.PI / 180,
            z: 30 * Math.PI / 180
          },
          period: 4000
        };
        var amplitude = wobble.amplitude;
        var clamp = (radians, max) => Math.max(-max, Math.min(max, radians));
        // `beta` (front-back device tilt, roughly -180..180) and `gamma`
        // (left-right device tilt, roughly -90..90) are the two physical
        // tilt axes DeviceOrientationEvent gives -- mapped to channels `x`
        // and `z` respectively, each clamped to that channel's own
        // amplitude so a hard tilt doesn't swing further than the original
        // sine ever did. There's no third independent *tilt* to drive
        // channel `y` with -- the remaining field, `alpha`, is an absolute
        // 0-360 compass heading, not a tilt, and would spin the whole
        // molecule a full turn as the user turns around rather than
        // wobbling it -- so `y` keeps following the time-based sine even
        // once tilt is live.
        var t = performance.now() / wobble.period * 2 * Math.PI;
        this._liveTiltAngle = {
          x: clamp((event.beta || 0) * Math.PI / 180, amplitude.x || 0),
          y: (amplitude.y || 0) * Math.sin(t),
          z: clamp((event.gamma || 0) * Math.PI / 180, amplitude.z || 0)
        };
      };
      window.addEventListener('deviceorientation', this._tiltHandler);
      return 'granted';
    };
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      return window.DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') {
          attach();
        }
        return state;
      });
    }
    return Promise.resolve(attach());
  }

  // Stops following device tilt (falls back to the time-based sine) and
  // removes the listener. Called automatically by sviewer when this
  // renderer instance is discarded (e.g. switching render mode again), so a
  // leftover listener doesn't keep driving a renderer nobody's looking at
  // any more.
  disconnect() {
    if (this._tiltHandler) {
      window.removeEventListener('deviceorientation', this._tiltHandler);
      this._tiltHandler = null;
    }
    this._liveTiltAngle = null;
  }
}
/* harmony default export */ const js_WobbleCanvasRenderer = (WobbleCanvasRenderer);
;// ./node_modules/glycan.js/js/mass_provider.js
function mass_provider_slicedToArray(r, e) { return mass_provider_arrayWithHoles(r) || mass_provider_iterableToArrayLimit(r, e) || mass_provider_unsupportedIterableToArray(r, e) || mass_provider_nonIterableRest(); }
function mass_provider_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function mass_provider_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return mass_provider_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? mass_provider_arrayLikeToArray(r, a) : void 0; } }
function mass_provider_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function mass_provider_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function mass_provider_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// const C = 12;
// const H = 1.0078250;
// const O = 15.9949146;

var MASSES = new Map();
var SYMBOLS = new Map();
var importSymbols = symbols_map => {
  SYMBOLS = new Map(Object.entries(symbols_map));
  MASSES.set(SYMBOLS.get('C'), 12);
  MASSES.set(SYMBOLS.get('H'), 1.007825035);
  MASSES.set(SYMBOLS.get('O'), 15.99491463);
  MASSES.set(SYMBOLS.get('N'), 14.003074);
  MASSES.set(SYMBOLS.get('NA'), 22.989771);
  MASSES.set(SYMBOLS.get('P'), 30.97376151);
  MASSES.set(SYMBOLS.get('S'), 31.9720707);
};
var composition_to_mass = composition => {
  return [...composition.entries()].map(_ref => {
    var _ref2 = mass_provider_slicedToArray(_ref, 2),
      atom = _ref2[0],
      count = _ref2[1];
    return MASSES.get(atom) * count;
  }).reduce((a, b) => a + b, 0);
};

;// ./node_modules/glycan.js/js/data/monosaccharides.js
/* harmony default export */ const monosaccharides = ([{
  "name": "P",
  "type": "ion",
  "terminii": "r1:x;2:x;3:x;4:x",
  "composition": "P:1;H:2;O:3"
}, {
  "name": "S",
  "type": "ion",
  "terminii": "r1:x;2:x;3:x;4:x",
  "composition": "S:1;H:1;O:3"
}, {
  "name": "Hex",
  "terminii": "r1:OH;2eq:OH;3eq:OH;4eq:OH;5eq:-;6eq:HOH",
  "composition": "C:6;H:12;O:6"
}, {
  "name": "Gal",
  "type": "Hex",
  "pubchemCid": 6036,
  "inchi": "InChI=1S/C6H12O6/c7-1-2-3(8)4(9)5(10)6(11)12-2/h2-11H,1H2/t2-,3+,4-,5+/m1/s1"
}, {
  "name": "Glc",
  "type": "Hex",
  "pubchemCid": 5793,
  "inchi": "InChI=1S/C6H12O6/c7-1-2-3(8)4(9)5(10)6(11)12-2/h2-11H,1H2/t2-,3+,4+,5-/m1/s1"
}, {
  "name": "Man",
  "type": "Hex",
  "pubchemCid": 18950,
  "inchi": "InChI=1S/C6H12O6/c7-1-2-3(8)4(9)5(10)6(11)12-2/h2-11H,1H2/t2-,3-,4+,5-/m1/s1"
}, {
  "name": "Galf",
  "type": "Hex",
  "pubchemCid": 11019448,
  "inchi": "InChI=1S/C6H12O6/c7-1-2(8)5-3(9)4(10)6(11)12-5/h2-11H,1H2/t2-,3-,4-,5+,6-/m1/s1",
  "terminii": "r1:OH;2eq:OH;3ax:OH;4ax:CHOHCHHOH"
}, {
  "name": "Glcf",
  "type": "Hex",
  "pubchemCid": 11309871,
  "inchi": "InChI=1S/C6H12O6/c7-1-2(8)5-3(9)4(10)6(11)12-5/h2-11H,1H2/t2-,3-,4-,5-,6-/m1/s1",
  "terminii": "r1:OH;2eq:OH;3eq:OH;4ax:CHOHCHHOH"
}, {
  "name": "Manf",
  "type": "Hex",
  "pubchemCid": 10965116,
  "inchi": "InChI=1S/C6H12O6/c7-1-2(8)5-3(9)4(10)6(11)12-5/h2-11H,1H2/t2-,3-,4+,5-,6?/m1/s1",
  "terminii": "r1:OH;2ax:OH;3eq:OH;4ax:CHOHCHHOH"
}, {
  "name": "HexNAc",
  "terminii": "r1:OH;2eq:NHAc;3eq:OH;4eq:OH;5eq:-;6eq:HOH",
  "composition": "C:8;H:13;N:1;O:5"
}, {
  "name": "GalNAc",
  "type": "HexNAc",
  "pubchemCid": 10137,
  "inchi": "InChI=1S/C8H15NO6/c1-3(11)9-5-7(13)6(12)4(2-10)15-8(5)14/h4-8,10,12-14H,2H2,1H3,(H,9,11)/t4-,5+,6-,7-/m1/s1"
}, {
  "name": "GlcNAc",
  "type": "HexNAc",
  "pubchemCid": 439174,
  "inchi": "InChI=1S/C8H15NO6/c1-3(11)9-5-7(13)6(12)4(2-10)15-8(5)14/h4-8,10,12-14H,2H2,1H3,(H,9,11)/t4-,5+,6+,7-/m1/s1"
}, {
  "name": "HexA",
  "terminii": "r1:OH;2eq:OH;3eq:OH;4eq:OH;5eq:-;6eq:OO",
  "composition": "C:6;H:8;O:6"
}, {
  "name": "GlcA",
  "type": "HexA",
  "pubchemCid": 65533,
  "inchi": "InChI=1S/C6H10O7/c7-2-3(8)4(9)5(10)6(11,12)13-2/h2-5,7-10H,(H,11,12)/t2-,3+,4+,5-/m1/s1"
}, {
  "name": "IdoA",
  "type": "HexA",
  "pubchemCid": 441039,
  "inchi": "InChI=1S/C6H10O7/c7-1-2(8)4(5(10)11)13-6(12)3(1)9/h1-4,6-9,12H,(H,10,11)/t1-,2-,3+,4+,6?/m0/s1"
}, {
  "name": "NeuAc",
  "type": "NeuAc",
  "pubchemCid": 65309,
  "inchi": "InChI=1S/C11H19NO9/c1-4(14)12-7-5(15)2-11(20,10(18)19)9(17)8(7)16-6(3-13)21-11/h5-10,13,15-17H,2-3H2,1H3,(H,12,14)(H,18,19)/t5-,6+,7+,8-,9-,10+,11-/m0/s1"
}, {
  "name": "NeuAc9Ac",
  "type": "NeuAc9Ac",
  "pubchemCid": 92042744,
  "inchi": "InChI=1S/C13H21NO10/c1-5(15)14-9-7(17)3-13(22,12(20)21)24-11(9)10(19)8(18)4-23-6(2)16/h7-11,17-19,22H,3-4H2,1-2H3,(H,14,15)(H,20,21)/t7-,8+,9+,10+,11+,13?/m0/s1"
}, {
  "name": "NeuGc",
  "type": "NeuGc",
  "pubchemCid": 123802,
  "inchi": "InChI=1S/C11H19NO10/c13-2-5(16)8(18)9-7(12-6(17)3-14)4(15)1-11(21,22-9)10(19)20/h4-5,7-9,13-16,18,21H,1-3H2,(H,12,17)(H,19,20)/t4-,5+,7+,8+,9+,11-/m0/s1"
}, {
  "name": "NeuGc9Ac",
  "type": "NeuGc9Ac",
  "terminii": "1ax:OO;r2:O;3ax:H;4eq:OH;5eq:NHGc;6eq:-;7:OH;8:OH;9:HOHAc",
  "composition": "C:11;H:17;N:1;O:8"
}, {
  "name": "dHex",
  "terminii": "r1:OH;2eq:OH;3eq:OH;4ax:OH;5eq:-;6eq:HH",
  "composition": "C:6;H:10;O:4"
}, {
  "name": "Fuc",
  "type": "dHex",
  "pubchemCid": 2723808,
  "inchi": "InChI=1S/C6H12O5/c1-3-4(7)5(8)6(9)2-10-3/h3-9H,2H2,1H3/t3-,4+,5+,6-/m0/s1"
}, {
  "name": "Rha",
  "type": "dHex",
  "pubchemCid": 25310,
  "inchi": "InChI=1S/C6H12O5/c1-2-3(7)4(8)5(9)6(10)11-2/h2-10H,1H3/t2-,3-,4+,5+,6?/m0/s1"
}, {
  "name": "Pent",
  "terminii": "r1:OH;2eq:OH;3eq:OH;4ax:OH;5eq:H",
  "composition": "C:5;H:8;O:4"
}, {
  "name": "Xyl",
  "type": "Pent",
  "pubchemCid": 135191,
  "inchi": "InChI=1S/C5H10O5/c6-1-2-3(7)4(8)5(9)10-2/h2-9H,1H2/t2-,3+,4-,5+/m1/s1"
}, {
  "name": "Ara",
  "type": "Pent",
  "pubchemCid": 439195,
  "inchi": "InChI=1S/C5H10O5/c6-2-1-10-5(9)4(8)3(2)7/h2-9H,1H2/t2-,3-,4+,5?/m0/s1"
}, {
  "name": "HexN",
  "terminii": "r1:OH;2eq:NH2;3eq:OH;4eq:OH;5eq:-;6eq:HOH",
  "composition": "C:6;H:11;N:1;O:4"
}, {
  "name": "GlcN",
  "type": "HexN",
  "pubchemCid": 439234,
  "inchi": "InChI=1S/C6H13NO5/c7-3-5(10)4(9)2(1-8)12-6(3)11/h2-6,8-11H,1,7H2/t2-,3+,4+,5-/m1/s1"
}, {
  "name": "MurNAc",
  "type": "MurNAc",
  "pubchemCid": 82756,
  "inchi": "InChI=1S/C11H19NO8/c1-5(11(18)19)20-10(9(17)8(16)4-14)7(3-13)12-6(2)15/h3,5,7-10,14,16-17H,4H2,1-2H3,(H,12,15)(H,18,19)/t5-,7+,8-,9-,10-/m1/s1"
}, {
  "name": "Me",
  "type": "alkyl",
  "terminii": "r1:H",
  "composition": "C:1;H:3"
}]);
;// ./node_modules/glycan.js/js/InChITerminii.js
function InChITerminii_slicedToArray(r, e) { return InChITerminii_arrayWithHoles(r) || InChITerminii_iterableToArrayLimit(r, e) || InChITerminii_unsupportedIterableToArray(r, e) || InChITerminii_nonIterableRest(); }
function InChITerminii_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function InChITerminii_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return InChITerminii_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? InChITerminii_arrayLikeToArray(r, a) : void 0; } }
function InChITerminii_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function InChITerminii_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function InChITerminii_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * InChI → terminii converter for glycan.js monosaccharide registry.
 *
 * Ported from inchi_to_terminii.py. Converts an InChI string into the
 * terminii string format used by Mass.js (e.g. "r1:OH;2eq:OH;3eq:OH;4eq:OH;5eq:-;6eq:HOH").
 */

// ---------------------------------------------------------------------------
// InChI parser
// ---------------------------------------------------------------------------

/**
 * Parse an InChI string into its layer components.
 * Returns { formula, c, h, t, m, s, ... } where each key is a layer letter.
 */
function parseInChI(inchi) {
  var body = inchi.replace(/^InChI=1S?\//, '');
  var parts = body.split('/');
  var layers = {
    formula: parts[0]
  };
  for (var part of parts.slice(1)) {
    if (part) layers[part[0]] = part.slice(1);
  }
  return layers;
}

/**
 * Parse molecular formula string → { C, H, O, N, S, P, ... }
 */
function parseFormula(formula) {
  var counts = {};
  for (var _ref3 of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    var _counts$elem;
    var _ref2 = InChITerminii_slicedToArray(_ref3, 3);
    var elem = _ref2[1];
    var n = _ref2[2];
    if (elem) counts[elem] = ((_counts$elem = counts[elem]) !== null && _counts$elem !== void 0 ? _counts$elem : 0) + (n ? parseInt(n) : 1);
  }
  return counts;
}

/**
 * Parse /t layer → Map<int, '+' | '-'>
 * e.g. "2-,3+,4+,5-" → Map { 2 => '-', 3 => '+', 4 => '+', 5 => '-' }
 */
function parseTLayer(tLayer) {
  var result = new Map();
  if (!tLayer) return result;
  for (var token of tLayer.split(',')) {
    var m = token.match(/^(\d+)([+-])$/);
    if (m) result.set(parseInt(m[1]), m[2]);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

/**
 * Classify a monosaccharide for terminii derivation purposes.
 */
function classifyMonosaccharide(formula, mLayer) {
  var _formula$C, _formula$O, _formula$N;
  var C = (_formula$C = formula.C) !== null && _formula$C !== void 0 ? _formula$C : 0;
  var O = (_formula$O = formula.O) !== null && _formula$O !== void 0 ? _formula$O : 0;
  var N = (_formula$N = formula.N) !== null && _formula$N !== void 0 ? _formula$N : 0;
  var isL = mLayer === '0';
  if (C >= 11 && N === 1) return 'sialic';
  if (C === 8 && N === 1) return 'hexnac';
  if (C === 6 && N === 1) return 'hexn';
  if (C === 8 && N === 0 && O === 7) return 'kdo';
  if (C === 7 && N === 0 && O === 6) return 'kdx';
  if (C === 7 && N === 0) return 'heptose';
  // Uronic acids have O=7 (extra oxygen from COOH vs hexose OH):
  //   hexose C6H12O6 = O6, uronic acid C6H10O7 = O7
  if (C === 6 && N === 0 && O >= 7) return isL ? 'L_hexA' : 'D_hexA';
  // Hexose: C6H12O6 = O6
  if (C === 6 && N === 0 && O === 6) return isL ? 'L_hexose' : 'D_hexose';
  // 6-deoxyhexose: C6H12O5 = O5 (e.g. Fuc, Rha)
  if (C === 6 && N === 0 && O === 5) return isL ? 'L_deoxyhex' : 'D_deoxyhex';
  // 3,6-dideoxyhexose: C6H12O4 = O4 (e.g. Tyv, Abe, Par, Col)
  if (C === 6 && N === 0 && O === 4) return isL ? 'L_dideoxyhex' : 'D_dideoxyhex';
  if (C === 5 && N === 0) return isL ? 'L_pentose' : 'D_pentose';
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Conformation tables
// ---------------------------------------------------------------------------

// 4C1 D-aldohexose InChI /t → ring carbon mapping.
//
// In the pyranose InChI, atom numbering places C6 (CH2OH) at atom 1 and
// C1 (anomeric) at atom 2.  The remaining ring carbons follow in chain order:
//   InChI atom 3 → carb C2 (key epimer position: Man C2=ax, others eq)
//   InChI atom 4 → carb C3 (always eq for all DEFINITIONS hexoses)
//   InChI atom 5 → carb C4 (ax for Gal; eq for Glc, Man)
//   InChI atom 6 → carb C5 (ring junction, always eq in D-series)
//
// Signs:  '+' → equatorial,  '-' → axial  (4C1 D-series)
var D_HEXOSE_4C1 = {
  carb_C2_from_t_pos: 3,
  C2: {
    '+': 'eq',
    '-': 'ax'
  },
  // /t3 sign → carb C2 (Man has '-' → ax)
  carb_C4_from_t_pos: 4,
  C4: {
    '+': 'eq',
    '-': 'ax'
  } // /t4 sign → carb C4 (Gal has '-' → ax)
};

// 1C4 L-deoxyhexose (Fuc, Rha).
var L_DEOXYHEX_1C4 = {
  carb_C4_from_t_pos: 3,
  carb_C3_from_t_pos: 4,
  C4: {
    '+': 'ax',
    '-': 'eq'
  },
  C3: {
    '+': 'eq',
    '-': 'eq'
  }
};

// HexNAc: InChI atoms 1-3 are the N-acetyl group (CH3, C=O, N).
// Ring carbons follow, so /t positions are offset vs plain hexoses:
//   /t5 → ring C3 (the differentiating GlcNAc vs ManNAc position)
//   /t6 → ring C4 (differentiates GlcNAc/ManNAc from GalNAc/AllNAc)
var HEXNAC_4C1 = {
  ring_C3_from_t_pos: 5,
  ring_C4_from_t_pos: 6,
  C3: {
    '+': 'eq',
    '-': 'ax'
  },
  C4: {
    '+': 'eq',
    '-': 'ax'
  }
};

// D-pentose
var D_PENTOSE_4C1 = {
  C3: {
    '+': 'eq',
    '-': 'eq'
  },
  C4: {
    '-': 'ax',
    '+': 'ax'
  }
};

// 2C5 sialic acid (NeuAc, NeuGc)
var SIALIC_2C5 = {
  C4: {
    '+': 'eq',
    '-': 'ax'
  }
};

// ---------------------------------------------------------------------------
// Substituent inference
// ---------------------------------------------------------------------------

function inferC6Substituent(formula) {
  var _formula$C2 = formula.C,
    C = _formula$C2 === void 0 ? 0 : _formula$C2,
    _formula$O2 = formula.O,
    O = _formula$O2 === void 0 ? 0 : _formula$O2,
    _formula$N2 = formula.N,
    N = _formula$N2 === void 0 ? 0 : _formula$N2;
  if (C >= 11 && N === 1) return null; // sialic
  if (C === 5) return null; // pentose
  if (C === 7) return 'HOH'; // heptose
  if (C === 8 && N === 0) return null; // KDO
  if (N === 0) {
    if (O === 6) return 'HOH'; // hexose (C6H12O6)
    if (O >= 7) return 'OO'; // uronic acid (C6H10O7)
    if (O === 5) return 'HH'; // 6-deoxyhexose (C6H12O5)
    if (O === 4) return 'HH'; // 3,6-dideoxyhexose (C6H12O4)
  }
  if (N === 1) return 'HOH'; // HexNAc, HexN
  return 'HOH';
}
function inferC2Substituent(formula, classHint) {
  var _formula$N3 = formula.N,
    N = _formula$N3 === void 0 ? 0 : _formula$N3,
    _formula$C3 = formula.C,
    C = _formula$C3 === void 0 ? 0 : _formula$C3;
  if (classHint === 'sialic') return null;
  if (classHint === 'kdo') return null;
  if (N === 0) return 'OH';
  if (N === 1 && C >= 8) return 'NHAc';
  if (N === 1 && C === 6) return 'NH2';
  return 'OH';
}

// ---------------------------------------------------------------------------
// Prokaryotic overrides
// ---------------------------------------------------------------------------

// Manually curated terminii strings for residues where InChI derivation is
// ambiguous or formula-based classification is insufficient.
var PROKARYOTIC_OVERRIDES = {
  // 3,6-Dideoxyhexoses
  'Tyv': 'r1:OH;2eq:OH;3eq:H;4eq:OH;5eq:-;6eq:HH',
  'Abe': 'r1:OH;2eq:OH;3eq:H;4ax:OH;5eq:-;6eq:HH',
  'Par': 'r1:OH;2eq:OH;3ax:H;4eq:OH;5eq:-;6eq:HH',
  'Col': 'r1:OH;2eq:OH;3ax:H;4ax:OH;5eq:-;6eq:HH',
  // Keto-sugars
  'Kdo': '1ax:OO;r2:O;3ax:H;4eq:OH;5eq:OH;6eq:-;7:OH;8:HOH',
  'Kdx': '1ax:OO;r2:O;3ax:H;4eq:OH;5eq:OH;6eq:-;7:HOH',
  // Heptoses
  'HepI': 'r1:OH;2eq:OH;3eq:OH;4eq:OH;5eq:OH;6eq:-;7eq:HOH',
  'HepII': 'r1:OH;2eq:OH;3eq:OH;4eq:OH;5ax:OH;6eq:-;7eq:HOH',
  // N-modified hexosamines
  'FucNAc': 'r1:OH;2eq:NHAc;3eq:OH;4ax:OH;5eq:-;6eq:HH',
  'QuiNAc': 'r1:OH;2eq:NHAc;3eq:OH;4eq:OH;5eq:-;6eq:HH',
  'RhaNAc': 'r1:OH;2eq:NHAc;3eq:OH;4ax:OH;5eq:-;6eq:HH',
  'ManNAc': 'r1:OH;2eq:NHAc;3ax:OH;4eq:OH;5eq:-;6eq:HOH',
  'AllNAc': 'r1:OH;2eq:NHAc;3ax:OH;4ax:OH;5eq:-;6eq:HOH',
  // Legionaminic / pseudaminic acids
  'Leg': '1ax:OO;r2:O;3ax:H;4ax:OH;5eq:NHAc;6eq:-;7:OH;8:NHAc;9:HOH',
  'Pse': '1ax:OO;r2:O;3ax:H;4ax:OH;5eq:NHAc;6eq:-;7:NHAc;8:OH;9:HOH',
  // Bacillosamine
  'Bac': 'r1:OH;2eq:NHAc;3eq:OH;4eq:NHAc;5eq:-;6eq:HOH',
  // Muramic acid
  'MurNAc': 'r1:OH;2eq:NHAc;3eq:OLac;4eq:OH;5eq:-;6eq:HOH'
};

// ---------------------------------------------------------------------------
// Per-class terminii builders
// ---------------------------------------------------------------------------

function buildHexose(name, t, formula, isL, conformationOverride, warnings) {
  var _D_HEXOSE_4C1$C2$tC2s, _D_HEXOSE_4C1$C4$tC4s;
  var c6sub = inferC6Substituent(formula);

  // /t3 → carb C2: determines mannose (ax) vs gluco (eq) configuration
  var tC2sign = t.get(D_HEXOSE_4C1.carb_C2_from_t_pos);
  var c2 = tC2sign !== undefined ? (_D_HEXOSE_4C1$C2$tC2s = D_HEXOSE_4C1.C2[tC2sign]) !== null && _D_HEXOSE_4C1$C2$tC2s !== void 0 ? _D_HEXOSE_4C1$C2$tC2s : 'eq' : 'eq';

  // /t4 → carb C4: determines galacto (ax) vs gluco (eq) configuration
  var tC4sign = t.get(D_HEXOSE_4C1.carb_C4_from_t_pos);
  var c4 = tC4sign !== undefined ? (_D_HEXOSE_4C1$C4$tC4s = D_HEXOSE_4C1.C4[tC4sign]) !== null && _D_HEXOSE_4C1$C4$tC4s !== void 0 ? _D_HEXOSE_4C1$C4$tC4s : 'eq' : 'eq';

  // C3 is always eq in 4C1 conformation
  var c2sub = inferC2Substituent(formula, isL ? 'L_hexose' : 'D_hexose');
  var parts = ["r1:OH", "2".concat(c2, ":").concat(c2sub), "3eq:OH", "4".concat(c4, ":OH"), "5eq:-", "6eq:".concat(c6sub !== null && c6sub !== void 0 ? c6sub : 'HOH')];
  return {
    terminii: parts.join(';'),
    conformation: conformationOverride !== null && conformationOverride !== void 0 ? conformationOverride : '4C1',
    source: 'inchi',
    warnings
  };
}
function buildDeoxyhex(name, t, formula, isL, warnings) {
  if (isL) {
    // L-deoxyhex: 1C4 conformation (Fuc, Rha).
    // DEFINITIONS encodes both Fuc and Rha as C4=ax (inherited from dHex).
    // The InChI-based stereochemical derivation for 1C4 chair is ambiguous due
    // to atom-number remapping in L-series. Hardcode to match DEFINITIONS.
    var parts = ["r1:OH", "2eq:OH", "3eq:OH", "4ax:OH", "5eq:-", "6eq:HH"];
    return {
      terminii: parts.join(';'),
      conformation: '1C4',
      source: 'inchi',
      warnings
    };
  } else {
    var _D_HEXOSE_4C1$C2$tC2s2, _D_HEXOSE_4C1$C4$tC4s2;
    // D-deoxyhex: same /t→carbon mapping as D-hexose, with HH at C6
    var tC2sign = t.get(D_HEXOSE_4C1.carb_C2_from_t_pos);
    var tC4sign = t.get(D_HEXOSE_4C1.carb_C4_from_t_pos);
    var c2 = tC2sign !== undefined ? (_D_HEXOSE_4C1$C2$tC2s2 = D_HEXOSE_4C1.C2[tC2sign]) !== null && _D_HEXOSE_4C1$C2$tC2s2 !== void 0 ? _D_HEXOSE_4C1$C2$tC2s2 : 'eq' : 'eq';
    var c4 = tC4sign !== undefined ? (_D_HEXOSE_4C1$C4$tC4s2 = D_HEXOSE_4C1.C4[tC4sign]) !== null && _D_HEXOSE_4C1$C4$tC4s2 !== void 0 ? _D_HEXOSE_4C1$C4$tC4s2 : 'eq' : 'eq';
    var _parts = ["r1:OH", "2".concat(c2, ":OH"), "3eq:OH", "4".concat(c4, ":OH"), "5eq:-", "6eq:HH"];
    return {
      terminii: _parts.join(';'),
      conformation: '4C1',
      source: 'inchi',
      warnings
    };
  }
}
function buildDideoxyhex(name, t, formula, isL, warnings) {
  var _D_HEXOSE_4C1$C4$tC4s3;
  // 3,6-dideoxyhexoses: C3 is deoxy (H), C6 is deoxy (HH)
  // Use same /t→carbon mapping as hexoses: /t4 → carb C4
  var tC4sign = t.get(D_HEXOSE_4C1.carb_C4_from_t_pos);
  var c4 = tC4sign !== undefined ? (_D_HEXOSE_4C1$C4$tC4s3 = D_HEXOSE_4C1.C4[tC4sign]) !== null && _D_HEXOSE_4C1$C4$tC4s3 !== void 0 ? _D_HEXOSE_4C1$C4$tC4s3 : 'eq' : 'eq';

  // C3 deoxy position ax/eq: use /t3 (carb C2 pos) as proxy since C3 is the key differentiator
  var tC3sign = t.get(3);
  var c3 = 'eq';
  if (tC3sign !== undefined) {
    c3 = tC3sign === '+' ? 'eq' : 'ax';
  }
  var parts = ["r1:OH", "2eq:OH", "3".concat(c3, ":H"), "4".concat(c4, ":OH"), "5eq:-", "6eq:HH"];
  return {
    terminii: parts.join(';'),
    conformation: isL ? '1C4' : '4C1',
    source: 'inchi',
    warnings
  };
}
function buildHexNAc(name, t, formula, warnings) {
  var _HEXNAC_4C1$C3$tC3sig, _HEXNAC_4C1$C4$tC4sig;
  // HexNAc: ring C3 from /t pos 3, ring C4 from /t pos 7
  var tC3sign = t.get(HEXNAC_4C1.ring_C3_from_t_pos);
  var tC4sign = t.get(HEXNAC_4C1.ring_C4_from_t_pos);
  var c3 = tC3sign !== undefined ? (_HEXNAC_4C1$C3$tC3sig = HEXNAC_4C1.C3[tC3sign]) !== null && _HEXNAC_4C1$C3$tC3sig !== void 0 ? _HEXNAC_4C1$C3$tC3sig : 'eq' : 'eq';
  var c4 = tC4sign !== undefined ? (_HEXNAC_4C1$C4$tC4sig = HEXNAC_4C1.C4[tC4sign]) !== null && _HEXNAC_4C1$C4$tC4sig !== void 0 ? _HEXNAC_4C1$C4$tC4sig : 'eq' : 'eq';
  var parts = ["r1:OH", "2eq:NHAc", "3".concat(c3, ":OH"), "4".concat(c4, ":OH"), "5eq:-", "6eq:HOH"];
  return {
    terminii: parts.join(';'),
    conformation: '4C1',
    source: 'inchi',
    warnings
  };
}
function buildHexN(name, t, formula, warnings) {
  var _D_HEXOSE_4C1$C2$tC2s3, _D_HEXOSE_4C1$C4$tC4s4;
  // GlcN has C6H13NO5 pyranose, same /t→carbon mapping as hexoses
  var tC2sign = t.get(D_HEXOSE_4C1.carb_C2_from_t_pos);
  var tC4sign = t.get(D_HEXOSE_4C1.carb_C4_from_t_pos);
  var c2 = tC2sign !== undefined ? (_D_HEXOSE_4C1$C2$tC2s3 = D_HEXOSE_4C1.C2[tC2sign]) !== null && _D_HEXOSE_4C1$C2$tC2s3 !== void 0 ? _D_HEXOSE_4C1$C2$tC2s3 : 'eq' : 'eq';
  var c4 = tC4sign !== undefined ? (_D_HEXOSE_4C1$C4$tC4s4 = D_HEXOSE_4C1.C4[tC4sign]) !== null && _D_HEXOSE_4C1$C4$tC4s4 !== void 0 ? _D_HEXOSE_4C1$C4$tC4s4 : 'eq' : 'eq';
  var parts = ["r1:OH", "2".concat(c2, ":NH2"), "3eq:OH", "4".concat(c4, ":OH"), "5eq:-", "6eq:HOH"];
  return {
    terminii: parts.join(';'),
    conformation: '4C1',
    source: 'inchi',
    warnings
  };
}
function buildPentose(name, t, formula, isL, warnings) {
  var _D_PENTOSE_4C1$C3$tC;
  var tC3sign = t.get(3);
  var tC4sign = t.get(4);
  // C3: always eq for common pentoses in DEFINITIONS
  // C4: always ax in DEFINITIONS for Xyl and Ara
  var c3 = tC3sign !== undefined ? (_D_PENTOSE_4C1$C3$tC = D_PENTOSE_4C1.C3[tC3sign]) !== null && _D_PENTOSE_4C1$C3$tC !== void 0 ? _D_PENTOSE_4C1$C3$tC : 'eq' : 'eq';
  var c4 = 'ax'; // always ax per DEFINITIONS

  var parts = ["r1:OH", "2eq:OH", "3".concat(c3, ":OH"), "4".concat(c4, ":OH"), "5eq:H"];
  return {
    terminii: parts.join(';'),
    conformation: isL ? '1C4' : '4C1',
    source: 'inchi',
    warnings
  };
}
function buildHeptose(name, t, formula, isL, warnings) {
  var _D_HEXOSE_4C1$3$tC3si, _D_HEXOSE_4C1$4$tC4si;
  // Apply D_HEXOSE_4C1 rules for C2-C4, treat C6 as ring-O, C7 = exocyclic CH2OH
  var tC3sign = t.get(3);
  var tC4sign = t.get(4);
  var tC5sign = t.get(5);
  var c3 = tC3sign !== undefined ? (_D_HEXOSE_4C1$3$tC3si = D_HEXOSE_4C1[3][tC3sign]) !== null && _D_HEXOSE_4C1$3$tC3si !== void 0 ? _D_HEXOSE_4C1$3$tC3si : 'eq' : 'eq';
  var c4 = tC4sign !== undefined ? (_D_HEXOSE_4C1$4$tC4si = D_HEXOSE_4C1[4][tC4sign]) !== null && _D_HEXOSE_4C1$4$tC4si !== void 0 ? _D_HEXOSE_4C1$4$tC4si : 'eq' : 'eq';
  // C5 orientation: use the same +/- → eq/ax mapping as C4
  var c5 = tC5sign !== undefined ? tC5sign === '+' ? 'eq' : 'ax' : 'eq';
  var parts = ["r1:OH", "2eq:OH", "3".concat(c3, ":OH"), "4".concat(c4, ":OH"), "5".concat(c5, ":OH"), "6eq:-", "7eq:HOH"];
  return {
    terminii: parts.join(';'),
    conformation: '4C1',
    source: 'inchi',
    warnings
  };
}
function buildSialic(name, t, formula, warnings) {
  // NeuAc-like: fixed topology.
  // terminii: 1ax:OO;r2:O;3ax:H;4eq:OH;5eq:NHAc;6eq:-;7:OH;8:OH;9:HOH
  //
  // C/O matrix:
  //   NeuAc    C11 O9  → C5=NHAc, C9=HOH
  //   NeuGc    C11 O10 → C5=NHGc, C9=HOH    (extra O from glycolyl)
  //   NeuAc9Ac C13 O10 → C5=NHAc, C9=HOHAc  (extra C2O from 9-O-acetyl)
  //   NeuGc9Ac C13 O11 → C5=NHGc, C9=HOHAc  (both modifications)
  var _formula$C4 = formula.C,
    C = _formula$C4 === void 0 ? 0 : _formula$C4,
    _formula$O3 = formula.O,
    O = _formula$O3 === void 0 ? 0 : _formula$O3;
  var is9Ac = C >= 13; // 9-O-acetylation adds 2 carbons
  var isGlycolyl = is9Ac ? O >= 11 : O >= 10; // within C13, glycolyl adds one more O
  var c5sub = isGlycolyl ? 'NHGc' : 'NHAc';
  var c9sub = is9Ac ? 'HOHAc' : 'HOH';
  var parts = ["1ax:OO", "r2:O", "3ax:H", "4eq:OH", "5eq:".concat(c5sub), "6eq:-", "7:OH", "8:OH", "9:".concat(c9sub)];
  return {
    terminii: parts.join(';'),
    conformation: '2C5',
    source: 'inchi',
    warnings
  };
}
function buildKdo(name, t, warnings) {
  // 3-deoxy-D-manno-oct-2-ulosonic acid
  // terminii: 1ax:OO;r2:O;3ax:H;4eq:OH;5eq:OH;6eq:-;7:OH;8:HOH
  var parts = ["1ax:OO", "r2:O", "3ax:H", "4eq:OH", "5eq:OH", "6eq:-", "7:OH", "8:HOH"];
  return {
    terminii: parts.join(';'),
    conformation: '4C1',
    source: 'inchi',
    warnings
  };
}
function buildFallback(name, formula, warnings) {
  // Minimal fallback: just produce a single-position ring
  warnings.push("".concat(name, ": using formula-only fallback terminii"));
  return {
    terminii: "r1:OH",
    conformation: 'unknown',
    source: 'fallback',
    warnings
  };
}

// ---------------------------------------------------------------------------
// Main conversion function
// ---------------------------------------------------------------------------

/**
 * Derive a terminii string from an InChI string.
 *
 * @param {string} name       - Monosaccharide name (used for override lookup and class hints)
 * @param {string} inchi      - Standard InChI string from PubChem or equivalent
 * @param {object} [opts]
 * @param {string} [opts.conformation] - Override chair: '4C1' | '1C4' | '2C5' | 'envelope'
 * @returns {{ terminii: string, conformation: string, source: string, warnings: string[] }}
 */
function inchiToTerminii(name, inchi) {
  var _layers$formula, _layers$m;
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var warnings = [];

  // 1. Check for a manual override first
  if (PROKARYOTIC_OVERRIDES[name]) {
    var _opts$conformation;
    return {
      terminii: PROKARYOTIC_OVERRIDES[name],
      conformation: (_opts$conformation = opts.conformation) !== null && _opts$conformation !== void 0 ? _opts$conformation : 'manual',
      source: 'override',
      warnings
    };
  }

  // 2. Parse InChI
  var layers = parseInChI(inchi);
  var formula = parseFormula((_layers$formula = layers.formula) !== null && _layers$formula !== void 0 ? _layers$formula : '');
  var t = parseTLayer(layers.t);
  var mLayer = (_layers$m = layers.m) !== null && _layers$m !== void 0 ? _layers$m : '1'; // '1' = D-series, '0' = L-series
  var isL = mLayer === '0';

  // 3. Classify
  var cls = classifyMonosaccharide(formula, mLayer);

  // 4. Dispatch to per-class builder
  switch (cls) {
    case 'sialic':
      return buildSialic(name, t, formula, warnings);
    case 'kdo':
      return buildKdo(name, t, warnings);
    case 'D_hexose':
    case 'L_hexose':
    case 'D_hexA':
    case 'L_hexA':
      return buildHexose(name, t, formula, isL, opts.conformation, warnings);
    case 'D_deoxyhex':
      return buildDeoxyhex(name, t, formula, false, warnings);
    case 'L_deoxyhex':
      return buildDeoxyhex(name, t, formula, true, warnings);
    case 'D_dideoxyhex':
    case 'L_dideoxyhex':
      return buildDideoxyhex(name, t, formula, isL, warnings);
    case 'hexnac':
      return buildHexNAc(name, t, formula, warnings);
    case 'hexn':
      return buildHexN(name, t, formula, warnings);
    case 'D_pentose':
    case 'L_pentose':
      return buildPentose(name, t, formula, isL, warnings);
    case 'heptose':
      return buildHeptose(name, t, formula, isL, warnings);
    default:
      warnings.push("Unknown class '".concat(cls, "' for ").concat(name, " \u2014 falling back to formula-only"));
      return buildFallback(name, formula, warnings);
  }
}
;// ./node_modules/glycan.js/js/Mass.js
function Mass_slicedToArray(r, e) { return Mass_arrayWithHoles(r) || Mass_iterableToArrayLimit(r, e) || Mass_unsupportedIterableToArray(r, e) || Mass_nonIterableRest(); }
function Mass_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function Mass_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return Mass_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Mass_arrayLikeToArray(r, a) : void 0; } }
function Mass_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function Mass_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function Mass_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var C = Symbol('C');
var H = Symbol('H');
var O = Symbol('O');
var N = Symbol('N');
var P = Symbol('P');
var S = Symbol('S');
var NA = Symbol('Na');





var CURRENT_MASS_PROVIDER = mass_provider_namespaceObject;
CURRENT_MASS_PROVIDER.importSymbols({
  'C': C,
  'H': H,
  'O': O,
  'N': N,
  'P': P,
  'S': S,
  'NA': NA
});
class RemovableAtom {
  constructor(atom) {
    this.atom = atom;
  }
}
var _name = /*#__PURE__*/new WeakMap();
class Derivative {
  constructor(name) {
    _classPrivateFieldInitSpec(this, _name, '');
    _classPrivateFieldSet(_name, this, name);
  }
  get name() {
    return _classPrivateFieldGet(_name, this);
  }
  can_accept(atoms, position) {
    return true;
  }
  accepts_residue(monosaccharide) {
    return true;
  }
  apply(atoms) {
    return [].concat(atoms);
  }
  reducing_end(atoms) {
    return atoms;
  }
  static Apply(atoms, new_atoms) {
    var result = Array.from(atoms);
    for (var item of new_atoms) {
      if (item instanceof RemovableAtom) {
        var idx = result.indexOf(item.atom);
        if (idx < 0) {
          throw new Error('Cannot remove atom');
        } else {
          result.splice(idx, 1);
        }
      } else {
        result.push(item);
      }
    }
    return result;
  }
}
var _derivatives = /*#__PURE__*/new WeakMap();
var _name2 = /*#__PURE__*/new WeakMap();
class DerivativeSet {
  constructor(name) {
    _classPrivateFieldInitSpec(this, _derivatives, []);
    _classPrivateFieldInitSpec(this, _name2, '');
    _classPrivateFieldSet(_name2, this, name);
    for (var _len = arguments.length, derivatives = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      derivatives[_key - 1] = arguments[_key];
    }
    for (var deriv of derivatives) {
      _classPrivateFieldGet(_derivatives, this).push(deriv);
    }
  }
  get name() {
    return _classPrivateFieldGet(_name2, this);
  }
  firstValid(monosaccharide) {
    for (var deriv of _classPrivateFieldGet(_derivatives, this)) {
      if (deriv.accepts_residue(monosaccharide)) {
        return deriv;
      }
    }
    return;
  }
}
class NonReducingDerivative extends Derivative {}
class ReducingEnd extends Derivative {
  calculate_reducing_end(atoms, other_derivative, monosaccharide) {
    var result = super.apply(atoms);
    var other_derivative_atoms = other_derivative.derivative_atoms;
    var reducing_end_atoms = [];
    return Derivative.Apply(result, reducing_end_atoms);
  }
}
class ReducingEndFree extends ReducingEnd {
  calculate_reducing_end(atoms, other_derivative, monosaccharide) {
    var result = super.apply(atoms);
    var other_derivative_atoms = other_derivative.derivative_atoms;
    var reducing_end_atoms = [H];
    var mono_ring_atoms = monosaccharide.original ? monosaccharide.original.ring_atoms : monosaccharide.ring_atoms;

    // FIXME - is this actually brittle?
    // The free reducing end really means that
    // you are adding 18 (O+H+H) when underivatised, that caps at the start and the end

    // This code below works, but it is weird that we need to add the other_derivative_atoms here
    // when it doesn't actually have anything to do with a free reducing end.
    // in get atoms() from MonosaccharideMass, it looks like it is being removed again!

    // res = delete_composition(res, REDUCING_END_FREE.calculate_reducing_end([],derivative,this));

    // And the same in FragmentResidue and Fragmentable from Fragmentor.js

    if (typeof monosaccharide.parent_linkage == 'undefined' || other_derivative.can_accept([O, ...mono_ring_atoms].flat(), monosaccharide.parent_linkage)) {
      reducing_end_atoms = reducing_end_atoms.concat(other_derivative_atoms);
    }
    var reducing_and_non_reducing_end_atom_correction = [O, reducing_end_atoms, [H].concat(other_derivative_atoms)].flat();
    var reducing_end_value = Derivative.Apply(result, reducing_and_non_reducing_end_atom_correction);
    return reducing_end_value;
  }
}

// FIXME - I am not sure what the correct thing to do with derivatives that do not cleanly apply
// to all H atoms should do here. This code only really works below because permethylation is applied to
// all residues, and doesn't care where the derivatisation occurs on the ring
// If you take the examples of the ethyl ester or ammonia amidation, these
// are only applied to specific positions on the ring, so this will end up adding way too
// much mass

// POSSIBLE SOLUTION - treat the reducing_end_atoms as the atoms at some fictional positions on the ring for Reduced / 2AA / 2AB as apprporiate,
// and test if the derivative can be applied there.
// e.g., reducing_end_atoms = [ [O] , [OH], [OH], [H], [OH] ]

// Add the extra O to the above array so permethylation can be accepted on those elements

// delete([O,O,O], reducing_end_atoms.map( atoms => add_derivative(atoms,-1,other_derivative) ).flat() )

// Permethylation should really be a transformation of the H to CHHH

class ReducingEndReduced extends ReducingEnd {
  calculate_reducing_end(atoms, other_derivative) {
    var result = super.apply(atoms);
    var other_derivative_atoms = other_derivative.derivative_atoms;
    var reducing_end_atoms = [O, [H].concat(other_derivative_atoms), [H].concat(other_derivative_atoms), [H], [H].concat(other_derivative_atoms)].flat();
    return Derivative.Apply(result, reducing_end_atoms);
  }
}
class ReducingEnd2AA extends ReducingEnd {
  calculate_reducing_end(atoms, other_derivative) {
    var label = [C, C, C, C, C, C, C,
    // C7
    H, H, H, H, H, H, H,
    // H7
    N, O, O]; // O2

    var result = super.apply(atoms);
    var other_derivative_atoms = other_derivative.derivative_atoms;
    var reducing_end_atoms = [O, [H].concat(other_derivative_atoms), [H].concat(other_derivative_atoms), [H], delete_composition(label, [O, H])].flat();
    return Derivative.Apply(result, reducing_end_atoms);
  }
}
class ReducingEnd2AB extends ReducingEnd {
  calculate_reducing_end(atoms, other_derivative) {
    var label = [C, C, C, C, C, C, C,
    // C7
    H, H, H, H, H, H, H, H,
    // H8
    N, N,
    // N2
    O];
    var result = super.apply(atoms);
    var other_derivative_atoms = other_derivative.derivative_atoms;
    var reducing_end_atoms = [O, [H].concat(other_derivative_atoms), [H].concat(other_derivative_atoms), [H], delete_composition(label, [O, H])].flat();
    return Derivative.Apply(result, reducing_end_atoms);
  }
}

// Procainamide: reductive amination like 2AB, net +C13H21N3 (+219.173).
class ReducingEndProcainamide extends ReducingEnd {
  calculate_reducing_end(atoms, other_derivative) {
    var label = [C, C, C, C, C, C, C, C, C, C, C, C, C,
    // C13
    H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H,
    // H21
    N, N, N,
    // N3
    O];
    var result = super.apply(atoms);
    var other_derivative_atoms = other_derivative.derivative_atoms;
    var reducing_end_atoms = [O, [H].concat(other_derivative_atoms), [H].concat(other_derivative_atoms), [H], delete_composition(label, [O, H])].flat();
    return Derivative.Apply(result, reducing_end_atoms);
  }
}

// RapiFluor-MS: a urea on the glycosylamine, not a reductive amination; net +C17H21N5O
// (+311.175) over the free glycan. Underivatised glycans only.
class ReducingEndRapiFluorMS extends ReducingEnd {
  calculate_reducing_end(atoms) {
    var tag = [C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C, C,
    // C17
    H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H, H,
    // H21
    N, N, N, N, N,
    // N5
    O];
    var result = super.apply(atoms);
    var reducing_end_atoms = [O, H, H, tag].flat();
    return Derivative.Apply(result, reducing_end_atoms);
  }
}
var make_derivative = function make_derivative(name) {
  var accept = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : v => v;
  var deriv_atoms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var base = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Derivative;
  var acceptance_test = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : r => true;
  var new_derivative = class extends base {
    constructor() {
      super(name);
    }
    get derivative_atoms() {
      return deriv_atoms;
    }
    accepts_residue(monosaccharide) {
      return acceptance_test(monosaccharide);
    }
    can_accept(atoms, position) {
      return accept(atoms, position);
    }
    apply(atoms) {
      var result = super.apply(atoms);
      return Derivative.Apply(result, deriv_atoms);
    }
  };
  return Object.freeze(new new_derivative());
};
var can_accept_permethylation = atoms => {
  return atoms.indexOf(O) >= 0 && atoms.indexOf(H) >= 0 || atoms.indexOf(N) >= 0 && atoms.indexOf(H) >= 0;
};
var UNDERIVATISED = make_derivative('Underivatised');
var PERMETHYLATED = make_derivative('Permethylated', can_accept_permethylation, [C, H, H]);
var REDUCING_END_FREE = Object.freeze(new ReducingEndFree('Free'));
var REDUCING_END_REDUCED = Object.freeze(new ReducingEndReduced('Reduced'));
var REDUCING_END_2AA = Object.freeze(new ReducingEnd2AA('2-aminobenzoic acid (2AA)'));
var REDUCING_END_2AB = Object.freeze(new ReducingEnd2AB('2-aminobenzamide (2AB)'));
var REDUCING_END_PROCAINAMIDE = Object.freeze(new ReducingEndProcainamide('Procainamide (ProA)'));
var REDUCING_END_RAPIFLUOR_MS = Object.freeze(new ReducingEndRapiFluorMS('RapiFluor-MS (RFMS)'));

// NeuAc ethyl ester: COOH → COOC₂H₅ on α2,6-linked NeuAc.
// Net mass change: +C₂H₄ (+28.031 Da).
// C1 only (+2C +4H at position 1).
var DERIV_ETHYL_ESTER = make_derivative('Ethyl ester', (a, p) => p == 1, [C, C, H, H, H, H], NonReducingDerivative, r => r.monosaccharide === MONOSACCHARIDE.NeuAc && r.parent && r.parent.linkageOf(r) == 6);

// NeuAc ammonia amidation: COOH → CONH₂ on α2,3-linked NeuAc.
// Net mass change: +H +N −O (−0.984 Da).
// C1 only (+1H +1N −1O at position 1).
var DERIV_AMMONIA_AMIDATION = make_derivative('Ammonia amidation', (a, p) => p == 1, [H, N, new RemovableAtom(O)], NonReducingDerivative, r => r.monosaccharide === MONOSACCHARIDE.NeuAc && r.parent && r.parent.linkageOf(r) == 3);

// Composite sets for EAP protocol:
// PMID: 31086181
var DERIV_EEA_SIALIC_ACID = Object.freeze(new DerivativeSet('Ethyl esterification protocol with amidation PMID:31086181', DERIV_ETHYL_ESTER, DERIV_AMMONIA_AMIDATION));

// ── SSAP (linkage-specific sialic acid permethylation) derivatives ────────────

// NeuAc 1,7-lactone: intramolecular ester between C1 carboxylate and C7-OH,
// formed selectively on α2,3-linked NeuAc. Net mass change: −H₂O (−18.011 Da).
//
// Three positions are modified:
//   C1 (COOH, 2 oxygens): remove 1 O → ester carbonyl only
//   C7 (OH, 1 oxygen):    remove 1 H → C7-OH loses H into water
//   C9 (HOH, 1 oxygen):   remove 1 H → mass-bookkeeping correction for the
//                          fixed [C,H] base at C1 that cannot be removed via
//                          the terminii model
//
// The O-count in apply() distinguishes C1 (≥2 O) from C7/C9 (1 O).
var DERIV_LACTONE = Object.freeze(new class extends NonReducingDerivative {
  constructor() {
    super('Lactone');
  }
  accepts_residue(r) {
    return r.monosaccharide === MONOSACCHARIDE.NeuAc && r.parent && r.parent.linkageOf(r) == 3;
  }
  can_accept(atoms, position) {
    return position === 1 || position === 7 || position === 9;
  }
  apply(atoms) {
    var result = super.apply(atoms);
    var removable = result.filter(a => a === O).length >= 2 ? new RemovableAtom(O) // C1: lose carboxylate –OH oxygen
    : new RemovableAtom(H); // C7/C9: lose H
    return Derivative.Apply(result, [removable]);
  }
}());

// NeuAc methyl ester: COOH → COOCH₃ on α2,6-linked NeuAc after permethylation.
// Net mass change: +CH₂ (+14.016 Da).
var DERIV_METHYL_ESTER = make_derivative('Methyl ester', (a, p) => p == 1, [C, H, H], NonReducingDerivative, r => r.monosaccharide === MONOSACCHARIDE.NeuAc && r.parent && r.parent.linkageOf(r) == 6);

// NeuAc dimethylamide: COOH → CON(CH₃)₂ on α2,6-linked NeuAc.
// Net mass change: +N +2C +5H −O (+27.047 Da).
var DERIV_DIMETHYL_AMIDE = make_derivative('Dimethyl amide', (a, p) => p == 1, [N, C, C, H, H, H, H, H, new RemovableAtom(O)], NonReducingDerivative, r => r.monosaccharide === MONOSACCHARIDE.NeuAc && r.parent && r.parent.linkageOf(r) == 6);

// Composite sets for SSAP protocols:
//   DERIV_SSAP_METHYL     — α2,3 → lactone, α2,6 → methyl ester (standard SSAP)
//   DERIV_SSAP_DIMETHYL   — α2,3 → lactone, α2,6 → dimethylamide (Alley protocol)
// PMID: 28693729
var DERIV_SSAP_METHYL = Object.freeze(new DerivativeSet('SSAP methyl ester / lactone PMID:28693729', DERIV_METHYL_ESTER, DERIV_LACTONE));
var DERIV_SSAP_DIMETHYL = Object.freeze(new DerivativeSet('SSAP dimethylamide / lactone PMID:28693729', DERIV_DIMETHYL_AMIDE, DERIV_LACTONE));
var parse_atoms = composition => {
  if (composition === 'H') {
    return [H];
  }
  if (composition === 'O') {
    return [O];
  }
  if (composition === 'OH') {
    return [O, H];
  }
  if (composition === 'HOH') {
    return [H, O, H];
  }
  if (composition === 'OO') {
    return [O, O];
  }
  if (composition === 'NH2') {
    return [N, H, H];
  }
  if (composition === 'HH') {
    return [H, H];
  }
  if (composition === 'CHOHCHHOH') {
    return [C, H, O, H, C, H, H, O, H];
  }
  if (composition === 'HOHAc') {
    return [H, O, H, C, O, C, H, H];
  }
  if (composition === 'OLac') {
    // O-lactoyl: –O–CH(CH₃)–COOH (C3 substituent in MurNAc)
    return [O, C, H, C, H, H, H, C, O, O, H];
  }
  if (composition === 'NHAc') {
    return [N, H, C, O, C, H, H, H];
  }
  if (composition === 'NHGc') {
    return [N, H, C, O, C, H, H, O, H];
  }
};
var delete_composition = (a, objs) => {
  for (var element of objs) {
    var pos = a.indexOf(element);
    if (pos >= 0) {
      a.splice(pos, 1);
    }
  }
  return a;
};
var parse_terminii = terminii => {
  var ring = new Map();
  for (var position of terminii.split(';')) {
    if (position.match(/^r/)) {
      ring.set(parseInt(position[1]), {
        atoms: [C, H].concat(parse_atoms(position.split(':')[1])),
        reducing: true
      });
      continue;
    }
    if (position.match(/-/)) {
      ring.set(parseInt(position[0]), {
        atoms: [C, H]
      });
      continue;
    }
    ring.set(parseInt(position[0]), {
      atoms: [C, H].concat(parse_atoms(position.split(':')[1]))
    });
  }
  Object.freeze(ring);
  return ring;
};
var calculate_a_fragment_composition = function calculate_a_fragment_composition(atoms, start, end) {
  var sialic = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (sialic && start > 0) {
    start = start + 1;
  }
  if (sialic && end > 0) {
    end = end + 1;
  }
  var result = Array.from(atoms);
  var looper = start;
  while (looper < end) {
    result[++looper] = [];
  }
  if (result[1].length > 0) {
    // console.log('Swapping keeping', result.map( (pos,i) => pos.length == 0 ? i : null ));
    result = result.map((pos, i) => pos.length == 0 ? atoms[i] : []);
  }
  var end_fill_start = sialic ? 6 : 5;
  if (end >= end_fill_start) {
    var fill = atoms.length;
    while (fill >= end_fill_start + 1) {
      if (atoms[fill]) {
        result[fill] = atoms[fill];
      }
      fill = fill - 1;
    }
  }
  return result;
};
var summarise_composition = composition => {
  var c = composition.filter(v => v == C).length;
  var n = composition.filter(v => v == N).length;
  var o = composition.filter(v => v == O).length;
  var h = composition.filter(v => v == H).length;
  return {
    C: c,
    N: n,
    O: o,
    H: h
  };
};
var log_composition_comparison = function log_composition_comparison(message, from, to) {
  var messages = [message];
  if (from.C != to.C) {
    messages.push("C: ".concat(to.C - from.C));
  }
  if (from.H != to.H) {
    messages.push("H: ".concat(to.H - from.H));
  }
  if (from.O != to.O) {
    messages.push("O: ".concat(to.O - from.O));
  }
  if (messages.length > 1) {
    console.log(messages.join(' '));
  }
};
var parse_composition = composition => {
  var atoms = [];
  for (var part of composition.split(';')) {
    var _part$split = part.split(':'),
      _part$split2 = Mass_slicedToArray(_part$split, 2),
      atom = _part$split2[0],
      number = _part$split2[1];
    number = parseInt(number);
    switch (atom) {
      case 'C':
        atom = C;
        break;
      case 'H':
        atom = H;
        break;
      case 'O':
        atom = O;
        break;
      case 'N':
        atom = N;
        break;
      case 'P':
        atom = P;
        break;
      case 'S':
        atom = S;
        break;
    }
    atoms = atoms.concat(Array(number).fill(atom));
  }
  Object.freeze(atoms);
  return atoms;
};
var load_definitions = () => {
  var parsed = {};
  for (var entry of monosaccharides) {
    var _entry$type;
    var terminiiStr = void 0;
    if (entry.inchi && !entry.terminii) {
      terminiiStr = inchiToTerminii(entry.name, entry.inchi).terminii;
    } else {
      terminiiStr = entry.terminii;
    }
    var definition = {
      name: entry.name,
      ring: parse_terminii(terminiiStr),
      type: (_entry$type = entry.type) !== null && _entry$type !== void 0 ? _entry$type : null,
      composition: entry.composition ? parse_composition(entry.composition) : null
    };
    parsed[entry.name] = Object.freeze(definition);
  }
  return parsed;
};
var MONOSACCHARIDES = load_definitions();
var get_prototype_for = identifier => {
  var def = MONOSACCHARIDES[identifier];
  if (def && def.type) {
    def = MONOSACCHARIDES[def.type];
  }
  return def;
};
var add_derivative = (atoms, position, derivative) => {
  var result = Array.from(atoms);
  // FIXME - the derivative should include the H, so that
  // the underivatised atoms includes the H.
  if (derivative.can_accept(atoms, position)) {
    result = derivative.apply(atoms); //result.concat( DERIVATISATION_DELTAS.get(derivative) )
  }
  return result;
};
var get_ring_atoms_for = function get_ring_atoms_for(identifier) {
  var derivative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : UNDERIVATISED;
  var reducing = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var def = get_prototype_for(identifier);
  if (def && def.ring) {
    return Object.freeze(Array.from(def.ring.values()).filter(val => reducing || !val.reducing).map(position => Array.from(position.atoms)).map((atoms, idx) => add_derivative(atoms, idx + 1, derivative)).map(res => Object.freeze(res)));
  }
  return Object.freeze([]);
};
var composition_to_map = composition => {
  var comp = new Map();
  for (var symbol of composition) {
    var curr = comp.get(symbol) || 0;
    comp.set(symbol, curr + 1);
  }
  return comp;
};
var Mass_composition_to_mass = composition => {
  var regular_atoms = composition.filter(atom => !(atom instanceof RemovableAtom));
  var removable_atoms = composition.filter(atom => atom instanceof RemovableAtom).map(removable => removable.atom);
  regular_atoms = delete_composition(regular_atoms, removable_atoms);
  return Mass.MASS_PROVIDER.composition_to_mass(composition_to_map(regular_atoms));
};
var get_composition_for = (identifier, derivative) => {
  var def = get_prototype_for(identifier);
  if (!def) {
    return Object.freeze([]);
  }
  var base_composition = [O];
  var derivative_composition = get_ring_atoms_for(identifier, derivative, true).flat();
  return [...base_composition, ...derivative_composition];
};
var ReferenceComposition = monosaccharide => {
  return get_composition_for(monosaccharide.identifier, monosaccharide.derivative);
};

// Permethylated masses:
/*
terminii:r1:HOH;2eq:NAc;3eq:OH;4eq:OH;5eq:-;6eq:OH
name:GlcNAc

Skip r1, Then NAc,OH,OH,OH - 1 = 3*14

terminii:r1:HOH;2eq:NH2;3eq:OH;4eq:OH;5eq:-;6eq:OH
name:GalN
Skip r1, Then NH2 (2), OH, OH, OH - 1 = 4*14

terminii:r2:HOH;1ax:COOH;3ax:H;4:OH;5eq:NHAc;6eq:-;7:OH;8:OH;9:OH2
name:NeuAc
Skip r2, Then COOH,OH,NHAc,OH,OH,OH2 - 1 = 5*14

*/

/*
https://www.nist.gov/static/glyco-mass-calc/

*/

var derivative_info = Symbol('derivative');
var reducing_end_info = Symbol('reducing_end');
var Mass = base => {
  class MonosaccharideMass extends base.Monosaccharide {
    get mass() {
      return Mass_composition_to_mass(this.atoms);
    }
    get derivative() {
      if (!this[derivative_info]) {
        this[derivative_info] = UNDERIVATISED;
      }
      return this[derivative_info];
    }
    set derivative(derivative) {
      var valid_derivative = derivative.accepts_residue(this);
      if (!valid_derivative) {
        return;
      }
      this[derivative_info] = derivative;
      return;
    }
    get reducing_end() {
      if (!this[reducing_end_info]) {
        this[reducing_end_info] = REDUCING_END_FREE;
      }
      return this[reducing_end_info];
    }
    set reducing_end(reduction) {
      this[reducing_end_info] = reduction;
    }
    get atoms() {
      var res = [O, ...this.ring_atoms].flat();

      // We should remove the reducing end atoms from the composition
      // for all residues, and then add it back on to the
      // root at the end

      // res = delete_composition(res,this.derivative.reducing_end_atoms);
      var derivative = this.derivative;
      if (this.derivative instanceof NonReducingDerivative) {
        derivative = UNDERIVATISED;
      }
      res = delete_composition(res, REDUCING_END_FREE.calculate_reducing_end([], derivative, this));
      return res;
    }
    get ring_atoms() {
      return get_ring_atoms_for(this.identifier, this.derivative);
    }
    get proto() {
      return (MONOSACCHARIDES[this.identifier] || {}).type;
    }
    clone() {
      var cloned = super.clone();
      cloned[reducing_end_info] = this[reducing_end_info];
      cloned[derivative_info] = this[derivative_info];
      return cloned;
    }
  }
  return class SugarMass extends base {
    static get Monosaccharide() {
      return MonosaccharideMass;
    }
    get atoms() {
      if (!this.root) {
        return [];
      }
      var monosaccharide_atoms = this.composition().map(res => res instanceof TracedMonosaccharide ? res.original : res).map(res => res.atoms).flat();

      // Only the parent sugar gets to add back in the reducing end atoms
      var reducing_end_deriv = this.root ? this.root.reducing_end : null;
      var other_derivative = this.root.derivative;
      var result = reducing_end_deriv.calculate_reducing_end(monosaccharide_atoms, other_derivative, this.root);
      return result;
    }
    get mass() {
      return Mass_composition_to_mass(this.atoms);
    }
    set reducing_end(reduction) {
      if (reduction === void 0) {
        reduction = REDUCING_END_FREE;
      }
      if (!this.root) {
        return;
      }
      this.root.reducing_end = reduction;
    }
    get reducing_end() {
      return this.root ? this.root.reducing_end : null;
    }
    derivatise(derivative) {
      for (var res of this.composition()) {
        if (derivative instanceof DerivativeSet) {
          var valid_derivative = derivative.firstValid(res);
          if (!valid_derivative) {
            continue;
          }
          res.derivative = valid_derivative;
        } else {
          res.derivative = derivative;
        }
      }
    }
  };
};
Object.defineProperty(Mass, 'MASS_PROVIDER', {
  set(provider) {
    CURRENT_MASS_PROVIDER = provider;
    CURRENT_MASS_PROVIDER.importSymbols({
      'C': C,
      'H': H,
      'O': O,
      'N': N,
      'P': P,
      'S': S,
      'NA': NA
    });
  },
  get() {
    return CURRENT_MASS_PROVIDER;
  }
});

;// ./node_modules/glycan.js/js/Fragmentor.js
function Fragmentor_slicedToArray(r, e) { return Fragmentor_arrayWithHoles(r) || Fragmentor_iterableToArrayLimit(r, e) || Fragmentor_unsupportedIterableToArray(r, e) || Fragmentor_nonIterableRest(); }
function Fragmentor_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function Fragmentor_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return Fragmentor_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Fragmentor_arrayLikeToArray(r, a) : void 0; } }
function Fragmentor_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function Fragmentor_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function Fragmentor_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
;

var retained_test = (n, i, j) => n <= j && i === 0 || (n <= i || n > j) && i !== 0;
var is_linkage_retained = (link, type) => {
  if (!type) {
    return true;
  }
  if (type.match(/^[bc]/)) {
    return true;
  }
  var positions = type.match(/(\d),(\d)-([ax])/);
  if (positions) {
    var i = parseInt(positions[1]);
    var j = parseInt(positions[2]);
    var reducing = positions[3] === 'x';
    var retained_test_res = retained_test(link > 5 ? 5 : link, i, j);
    return reducing ? retained_test_res : !retained_test_res;
  }
};
var rewrite_linear = type => {
  var base = type.substring(5);
  var start = type.substring(0, 5);
  var newstart = start;
  switch (start) {
    case '1,1-e':
      newstart = '1,5-a';
      break;
    case '2,2-e':
      newstart = '0,2-a';
      break;
    case '3,3-e':
      newstart = '3,5-a';
      break;
    case '4,4-e':
    case '5,5-e':
      newstart = '0,4-a';
      break;
    case '1,3-e':
      newstart = '1,3-a';
      break;
    case '2,4-e':
      newstart = '2,4-a';
      break;
    case '3,5-e':
      newstart = '3,4-a';
      break;
    case '1,1-w':
      newstart = '1,5-x';
      break;
    case '2,2-w':
      newstart = '0,2-x';
      break;
    case '3,3-w':
      newstart = '3,5-x';
      break;
    case '4,4-w':
    case '5,5-w':
      newstart = '0,4-x';
      break;
  }
  return "".concat(newstart).concat(base);
};
var children_with_fragment = (parent_type, children) => {
  var surviving_kids = children;
  if (parent_type) {
    if (parent_type.match(/^[bc]/)) {
      // surviving_kids = surviving_kids; // Reducing end modificaitions keep all the kids
    }
    var positions = parent_type.match(/(\d),(\d)-([ax])/);
    if (positions) {
      var i = parseInt(positions[1]);
      var j = parseInt(positions[2]);
      var reducing = positions[3] === 'x';
      surviving_kids = surviving_kids.filter(res => {
        var link = res.parent.linkageOf(res);
        var retained_test_res = retained_test(link > 5 ? 5 : link, i, j);
        return reducing ? retained_test_res : !retained_test_res;
      });
    }
  }
  surviving_kids = surviving_kids.filter(res => !(res.type || '').match(/^[yz]/));
  return surviving_kids;
};

// original monosaccharide → { identifier, derivative, parent_linkage, byType: Map(type → frozen atoms) }
var RESIDUE_ATOMS_CACHE = new WeakMap();
class FragmentResidue extends TracedMonosaccharide {
  get children() {
    var all_children = super.children;
    return children_with_fragment(this.type, all_children);
  }
  get parent() {
    if ((this.type || '').match(/(^[bc]|-a)/)) {
      return undefined;
    }
    return super.parent;
  }
  get reducing_end() {
    var _this$original;
    return (_this$original = this.original) === null || _this$original === void 0 ? void 0 : _this$original.reducing_end;
  }
  get mass() {
    return Mass_composition_to_mass(this.atoms);
  }

  // A residue's atoms depend only on its original residue (identifier,
  // derivative, parent linkage) and its cleavage type, but are asked for once
  // per fragment it appears in: thousands of times per glycan at two levels
  // of fragmentation. Cached per original residue and type; the cache resets
  // if the original's identifier, derivative or parent linkage changes.
  get atoms() {
    var _this$type;
    var original = this.original;
    var cached = RESIDUE_ATOMS_CACHE.get(original);
    if (!cached || cached.identifier !== original.identifier || cached.derivative !== original.derivative || cached.parent_linkage !== original.parent_linkage) {
      cached = {
        identifier: original.identifier,
        derivative: original.derivative,
        parent_linkage: original.parent_linkage,
        byType: new Map()
      };
      RESIDUE_ATOMS_CACHE.set(original, cached);
    }
    var key = (_this$type = this.type) !== null && _this$type !== void 0 ? _this$type : '';
    var atoms = cached.byType.get(key);
    if (!atoms) {
      atoms = Object.freeze(this.uncachedAtoms());
      cached.byType.set(key, atoms);
    }
    return atoms;
  }
  uncachedAtoms() {
    var cross_type;
    var a_composition = [];
    var base_atoms = Array.from([[O]].concat(this.original.ring_atoms));
    var result = [];
    if (base_atoms.length < 2) {
      return result;
    }
    if (this.type) {
      cross_type = this.type.match(/(\d,\d)-([ax])/);
      if (cross_type) {
        var frag_key = cross_type[1];
        var _frag_key$split$map = frag_key.split(',').map(val => +val),
          _frag_key$split$map2 = Fragmentor_slicedToArray(_frag_key$split$map, 2),
          start = _frag_key$split$map2[0],
          end = _frag_key$split$map2[1];
        var fragtype = cross_type[2];
        var proto = this.original.proto;
        a_composition = calculate_a_fragment_composition(base_atoms, start, end, this.identifier.indexOf('Neu') >= 0);
        if (fragtype === 'a') {
          result = a_composition.flat();
        }
      }
    }
    if (result.length < 1) {
      result = delete_composition(base_atoms.flat(), a_composition.flat());
    }
    var reducing_end_atoms = REDUCING_END_FREE.calculate_reducing_end([], this.original.derivative, this);
    result = delete_composition(result, reducing_end_atoms);
    return result;
  }
}
var FRAGMENT_ORIGNAL_MAP = new WeakMap();
var Fragmentable = base => class extends base {
  constructor() {
    super();
    this.base_composition = [];
  }
  static get Monosaccharide() {
    return FragmentResidue;
  }
  get original() {
    return FRAGMENT_ORIGNAL_MAP.get(this);
  }
  set original(original) {
    FRAGMENT_ORIGNAL_MAP.set(this, original);
  }
  get is_reducing_end() {
    return this.chordResidues.every(res => res.type.match(/(^[yz])|(\d,\d-[x])/));
  }
  get chord() {
    return this.chordResidues;
  }
  set chord(chord) {
    if (!this.base_root) {
      this.base_root = this.root;
      this.base_composition = this.composition();
    }
    this.root = this.base_root;
    var in_chord = this.base_composition.filter(res => chord.chord.indexOf(res.original) >= 0);
    this.chordResidues = chord.chord.map(res => in_chord.filter(mono => mono.original === res)[0]);
    this.root = chord.root === this.root.original ? this.root : in_chord.filter(res => res.original === chord.root)[0];
  }
  set type(type) {
    for (var res of this.base_composition) {
      res.type = null;
    }
    if (!type) {
      return;
    }
    var fragtypes = type.split('/');
    for (var i = 0; i < fragtypes.length; i++) {
      if (fragtypes[i].match(/-[ew]/)) {
        fragtypes[i] = rewrite_linear(fragtypes[i]);
      }
      this.chordResidues[i].type = fragtypes[i];
    }
    this.typestring = type;
    var chord_root = this.base_root;
    var non_reducing_chord_residues = this.chordResidues.filter((chord_res, i) => type.split('/')[i].match(/^(\d+,\d+-[ae]|[bc])/));
    if (non_reducing_chord_residues.length > 0) {
      chord_root = non_reducing_chord_residues[0];
    }
    this.root = chord_root;
  }
  get type() {
    return this.typestring;
  }
  get atoms() {
    // FIXME - the derivatives should be defined per residue if we are
    // calculating fragment masses
    var R = [H].concat(this.root.original.derivative.derivative_atoms);
    var base_composition = this.composition().map(res => res.atoms).flat();
    var result_composition = [...base_composition];
    var types = this.type.split('/').filter((o, i, a) => a.indexOf(o) == i);
    for (var type of types) {
      if (type.match(/^y/)) {
        result_composition = result_composition.concat([H]);
      }
      if (type.match(/^b/)) {
        result_composition = result_composition.concat(R);
        result_composition = delete_composition(result_composition, [H]);
      }
      if (type.match(/^z/)) {
        result_composition = delete_composition(result_composition, [O, H]);
      }
      if (type.match(/^c/)) {
        result_composition = result_composition.concat(R);
        result_composition = result_composition.concat([H, O]);
      }
      if (type.match(/^\d,\d-[xw]/)) {
        result_composition = result_composition.concat(R);
      }
    }
    var linear_base;
    linear_base = this.type.match(/(\d,\d-[ew])/);
    linear_base = linear_base ? linear_base[1] : null;
    switch (linear_base) {
      case '1,1-e':
        result_composition.push(O);
        break;
      case '3,3-e':
        result_composition.push(O);
        break;
      case '5,5-e':
        result_composition = delete_composition(result_composition, [O, H, H, C]);
        break;
      case '3,5-e':
        result_composition = result_composition.concat([H, H, C]);
        break;
      case '1,1-w':
        result_composition = delete_composition(result_composition, [O, H, H]);
        break;
      case '2,2-w':
        result_composition = delete_composition(result_composition, [H, H]);
        break;
      case '3,3-w':
        result_composition = delete_composition(result_composition, [O, H, H]);
        break;
      case '4,4-w':
        result_composition = delete_composition(result_composition, [H, H]);
        break;
      case '5,5-w':
        result_composition = result_composition.concat([O, H, C]);
        break;
    }

    // The second regex match for a/e fragments is to get the
    // tests passing
    if (this.is_reducing_end) {
      var reducing_end_deriv = this.root.original.reducing_end;
      var other_derivative = this.root.original.derivative;
      result_composition = reducing_end_deriv.calculate_reducing_end(result_composition, other_derivative, this.root);
      result_composition = delete_composition(result_composition, [H].concat(this.root.original.derivative.derivative_atoms));
    } else if (this.type.match(/\d,\d-[a]/)) {
      var _reducing_end_deriv = this.root.original.reducing_end;
      var _other_derivative = this.root.original.derivative;
      result_composition = _reducing_end_deriv.calculate_reducing_end(result_composition, _other_derivative, this.root);
    }
    if (this.type.match(/^1,1-[w]/)) {
      result_composition = delete_composition(result_composition, [H]);
    }
    result_composition = delete_composition(result_composition, Array(types.length - 1).fill(R).flat());
    return result_composition;
  }
};
var get_coordinate = (coords, max_depth, type, idx) => {
  var _coords$idx$split = coords[idx].split(''),
    _coords$idx$split2 = Fragmentor_slicedToArray(_coords$idx$split, 2),
    depth = _coords$idx$split2[0],
    height = _coords$idx$split2[1];
  depth = parseInt(depth);
  if (type.match(/(^[bc]|-a|-e)/)) {
    depth = 1 + max_depth - depth;
  }
  if (type.match(/(^[yz]|-x|-w)/)) {
    depth = depth - 1;
  }
  return type + depth + height;
};
var is_reducing_end = (sugar, chord) => chord.root === sugar.root && chord.chord[0] !== sugar.root;
var fcart = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
var _cartesian = function cartesian(a, b) {
  for (var _len = arguments.length, c = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    c[_key - 2] = arguments[_key];
  }
  return b ? _cartesian(fcart(a, b), ...c) : a;
};
var reducing_types = ['y', 'z', '3,5-x', '1,3-x', '1,5-x', '2,4-x', '0,2-x', '0,4-x'];
var nonreducing_types = ['b', 'c', '3,5-a', '1,3-a', '1,5-a', '2,4-a', '0,2-a', '0,4-a'];
var retains_residue = (composition, res) => {
  if (res.type.match(/^[yz]/)) {
    return composition.indexOf(res.parent) < 0 || !is_linkage_retained(res.parent.linkageOf(res), res.parent.type);
  } else {
    return composition.indexOf(res) < 0;
  }
};
class Fragmentor {
  static getFragment(target, type) {
    var base = target.constructor;
    var Fragment = Fragmentable(base);
    var fragment_template = trace_into_class(target, Fragment);
    var fragment = fragment_template.clone();
    var chord = type.split('/').map(frag_type => {
      var sub_type = frag_type;
      var match = frag_type.match(/(\d+,\d+-[xw]|[yz])(\d+)(.*)/);
      if (match) {
        sub_type = "y".concat(+match[2] + 1).concat(match[3]);
      }
      match = frag_type.match(/(\d+,\d+-[ae]|[bc])(\d+)(.*)/);
      if (match) {
        var max_depth = Math.max(...target.leaves().map(res => res.depth));
        sub_type = "y".concat(max_depth - match[2] + 1).concat(match[3]);
      }
      return target.locate_monosaccharide(sub_type);
    });
    var chord_root = target.root;
    var non_reducing_frags = chord.filter((frag, i) => type.split('/')[i].match(/^(\d+,\d+-[ae]|[bc])/));
    if (non_reducing_frags.length > 0) {
      chord_root = non_reducing_frags[0];
    }
    fragment.original = target;
    fragment.chord = {
      root: chord_root,
      chord
    };
    fragment.type = type;
    return fragment;
  }

  /**
   * Yields { chord, typeString } for every candidate (chord, type) pair after
   * structural early-exit guards, but before the retains_residue check (which
   * needs a Fragment instance). Shared by fragment() and FragmentorMass.
   *
   * Note on root-chord cross-ring types: the comment in the original fragment()
   * explains this is a fix for GlycoWorkBench compatibility — double reducing-end
   * fragments where one chord residue is closer to the root than the other.
   */
  static *_candidateChordTypes(target, depth) {
    var max_depth = Math.max(...target.leaves().map(res => res.depth));
    var get_coord_for_res = (tgt, res) => tgt.location_for_monosaccharide(res).substring(1);
    for (var chord of target.chords(depth)) {
      // See GlycoWorkBench compatibility note above.
      var base_types = [reducing_types.concat(nonreducing_types)];
      var all_types = base_types.concat(new Array(chord.chord.length - 1).fill(reducing_types));
      if (chord.chord.indexOf(target.root) >= 0) {
        if (is_reducing_end(target, chord)) {
          all_types[chord.chord.indexOf(target.root)] = all_types[chord.chord.indexOf(target.root)].concat(['1,1-w', '2,2-w', '3,3-w', '4,4-w', '5,5-w']);
        } else {
          all_types[chord.chord.indexOf(target.root)] = all_types[chord.chord.indexOf(target.root)].concat(['1,1-e', '2,2-e', '3,3-e', '4,4-e', '5,5-e', '3,5-e', '1,3-e', '2,4-e']);
        }
      }
      var types = _cartesian.apply(null, all_types);
      var coordinates = chord.chord.map(get_coord_for_res.bind(null, target));
      var coords = get_coordinate.bind(null, coordinates, max_depth);
      for (var f_type of types) {
        if (!Array.isArray(f_type)) {
          f_type = [f_type];
        }
        if (f_type[0].match(/^[bc]/) && chord.root === target.root) {
          continue;
        }
        if (f_type.length < 2 && chord.root !== chord.chord[0]) {
          continue;
        }
        yield {
          chord,
          typeString: f_type.map(coords).join('/')
        };
      }
    }
    var rootChord = {
      root: target.root,
      chord: [target.root]
    };
    for (var _f_type of ['3,5-x', '1,3-x', '1,5-x', '2,4-x', '0,2-x', '0,4-x', '1,1-w', '2,2-w', '3,3-w', '4,4-w', '5,5-w']) {
      yield {
        chord: rootChord,
        typeString: _f_type + '0a'
      };
    }
  }
  static fragment(target) {
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    var visitor = arguments.length > 2 ? arguments[2] : undefined;
    return function* () {
      if (!('mass' in target)) {
        throw new Error('Sugar object class does not derive from Mass class');
      }
      var Fragment = Fragmentable(target.constructor);
      var fragment_template = trace_into_class(target, Fragment);

      // Single working clone reused across all chord/type combinations when a
      // visitor is provided (fast path).  Without a visitor, a fresh clone is
      // yielded per valid fragment so callers own independent Fragment objects.
      var working = visitor ? fragment_template.clone() : null;
      if (working) working.original = target;
      for (var _ref2 of Fragmentor._candidateChordTypes(target, depth)) {
        var chord = _ref2.chord;
        var typeString = _ref2.typeString;
        if (visitor) {
          working.chord = chord;
          working.type = null;
          working.type = typeString;
          var curr_composition = working.composition();
          if (working.chordResidues.some(retains_residue.bind(null, curr_composition))) {
            continue;
          }
          yield visitor(working);
        } else {
          var fragment = fragment_template.clone();
          fragment.type = null;
          fragment.chord = chord;
          fragment.type = typeString;
          fragment.original = target;
          var _curr_composition = fragment.composition();
          if (fragment.chordResidues.some(retains_residue.bind(null, _curr_composition))) {
            continue;
          }
          yield fragment;
        }
      }
    }();
  }
}

/* harmony default export */ const js_Fragmentor = (Fragmentor);
;// ./node_modules/glycan.js/js/FragmentRenderer.js
function FragmentRenderer_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function FragmentRenderer_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { FragmentRenderer_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { FragmentRenderer_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
;


var FRAGMENT_SYMBOLS = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <defs>\n    <symbol id=\"fragment_3_5_x\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M90 50 50 50 70 15.36 90 50z\" fill=\"#999\"/>\n        <path d=\"M90 50 70 84.64 50 50 90 50z\" fill=\"#999\"/>\n        <path d=\"M70 84.64 30 84.64 50 50 70 84.64z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_3_5_a\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M50 50 10 50 30 15.36 50 50z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_1_3_a\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M70 84.64 30 84.64 50 50 70 84.64z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_1_3_x\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M90 50 50 50 70 15.36 90 50z\" fill=\"#999\"/>\n        <path d=\"M50 50 10 50 30 15.36 50 50z\" fill=\"#999\"/>\n        <path d=\"M70 15.36 50 50 30 15.36 70 15.36z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_1_5_x\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M90 50 50 50 70 15.36 90 50z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_1_5_a\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M70 84.64 30 84.64 50 50 70 84.64z\" fill=\"#999\"/>\n        <path d=\"M50 50 30 84.64 10 50 50 50z\" fill=\"#999\"/>\n        <path d=\"M50 50 10 50 30 15.36 50 50z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_2_4_x\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M90 50 50 50 70 15.36 90 50z\" fill=\"#999\"/>\n        <path d=\"M90 50 70 84.64 50 50 90 50z\" fill=\"#999\"/>\n        <path d=\"M70 15.36 50 50 30 15.36 70 15.36z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_2_4_a\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M50 50 30 84.64 10 50 50 50z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_0_2_x\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M90 50 70 84.64 50 50 90 50z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_0_2_a\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M50 50 30 84.64 10 50 50 50z\" fill=\"#999\"/>\n        <path d=\"M50 50 10 50 30 15.36 50 50z\" fill=\"#999\"/>\n        <path d=\"M70 15.36 50 50 30 15.36 70 15.36z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_0_4_x\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M90 50 70 84.64 50 50 90 50z\" fill=\"#999\"/>\n        <path d=\"M70 84.64 30 84.64 50 50 70 84.64z\" fill=\"#999\"/>\n        <path d=\"M50 50 30 84.64 10 50 50 50z\" fill=\"#999\"/>\n    </symbol>\n    <symbol id=\"fragment_0_4_a\" viewBox=\"0 0 100 100\">\n        <path d=\"M70 15.36 30 15.36 10 50 30 84.64 70 84.64 90 50 70 15.36z\" fill=\"#fff\" data-fixed-fill=\"\" stroke=\"#aaa\" stroke-miterlimit=\"10\" stroke-width=\"3\"/>\n        <path d=\"M70 15.36 50 50 30 15.36 70 15.36z\" fill=\"#999\"/>\n    </symbol>\n    </defs>\n</svg>\n";
var FragmentLayout = baselayout => class extends baselayout {
  static PerformLayout(renderable) {
    if (renderable.original) {
      var ref_layout = baselayout.PerformLayout(renderable.original);
      var result = new WeakMap();
      for (var residue of renderable.composition()) {
        var original_layout = ref_layout.get(residue.original);
        if (renderable.root == residue) {
          original_layout = Object.assign({}, original_layout);
          original_layout.dx = 0;
          original_layout.dy = 0;
        }
        if (renderable.chord.indexOf(residue) >= 0) {
          var type = renderable.type.split('/')[renderable.chord.indexOf(residue)];
          if (type.match(/\d+,\d+/)) {
            original_layout.keep_horizontal = true;
          }
        }
        result.set(residue, original_layout);
      }
      return result;
    }
    return baselayout.PerformLayout(renderable);
  }
};
var fix_rotate = function fix_rotate(position) {
  var ROTATE = this.rotate;
  var LTR = this.leftToRight;
  var xval = position.x;
  var yval = position.y;
  if (ROTATE) {
    position.x = LTR ? -1 * (yval + position.height) : yval;
    position.y = LTR ? xval : -1 * (xval + position.width);
  }
};
var FRAGMENT_MONOSACCHARIDE = Symbol('removed');
var FragmentRenderer = baserenderer => class extends baserenderer {
  static AppendSymbols(element) {
    return FragmentRenderer_asyncToGenerator(function* () {
      yield js_SVGRenderer.AppendSymbols(element);
      yield js_SVGRenderer.AppendSymbols(element, FRAGMENT_SYMBOLS);
    })();
  }
  get LayoutEngine() {
    return super.LayoutEngine;
  }
  set LayoutEngine(engine) {
    super.LayoutEngine = FragmentLayout(engine);
  }
  addSugar(sugar) {
    if (sugar.original) {
      for (var residue of sugar.original.composition()) {
        residue.setTag(FRAGMENT_MONOSACCHARIDE, null);
      }
      super.addSugar(sugar.original);
      for (var mono of sugar.composition()) {
        mono.original.setTag(FRAGMENT_MONOSACCHARIDE);
      }
      for (var _residue of sugar.chord) {
        var type = sugar.type.split('/')[sugar.chord.indexOf(_residue)];
        if (type.indexOf(',') >= 0) {
          _residue.original.setTag(FRAGMENT_MONOSACCHARIDE);
        }
      }
    }
    super.addSugar(sugar);
  }
  renderGlycosidicCleavage(canvas, child_pos, parent_pos, child, parent, flip) {
    var SCALE = 100;
    child_pos = Object.assign({}, child_pos);
    parent_pos = Object.assign({}, parent_pos);
    fix_rotate.call(this, child_pos);
    fix_rotate.call(this, parent_pos);
    var extents = [SCALE * (child_pos.x + child_pos.width / 2), SCALE * (child_pos.y + child_pos.height / 2), SCALE * (parent_pos.x + parent_pos.width / 2), SCALE * (parent_pos.y + parent_pos.height / 2)];
    var is_angled = child_pos.y - parent_pos.y;
    var reverse_cap = flip ? 3 : -3;
    var bracket_scale = 2 / 3;
    if (is_angled != 0) {
      bracket_scale = 0.5;
    }
    var group = canvas.group();
    var extent_fraction = flip ? 0.5 : 0.5;
    var bracket_position = point_along_line(...extents, extent_fraction);
    var perpendicular = perpendicular_line(bracket_position[0], bracket_position[1], extents[2], extents[3], SCALE * child_pos.width * bracket_scale);
    var cap = half_perpendicular_line(...perpendicular, reverse_cap * SCALE * child_pos.width / 8);
    var cap_end = half_perpendicular_line(perpendicular[2], perpendicular[3], perpendicular[0], perpendicular[1], reverse_cap * -1 * SCALE * child_pos.width / 8);
    group.line(...perpendicular, {
      'stroke-width': Renderer_str(10 * SCALE / 100),
      'stroke': 'var(--fragment-stroke-color,#f00)'
    });
    if (is_angled <= 0) {
      group.line(...cap_end, {
        'stroke-width': Renderer_str(10 * SCALE / 100),
        'stroke': 'var(--fragment-stroke-color,#f00)'
      });
    } else {
      group.line(...cap, {
        'stroke-width': Renderer_str(10 * SCALE / 100),
        'stroke': 'var(--fragment-stroke-color,#f00)'
      });
    }
  }
  renderIcon(container, identifier, residue, sugar) {
    var resolved_identifier = identifier;
    if (residue instanceof FragmentResidue) {
      var fragment = sugar;
      if (fragment.chord.indexOf(residue) >= 0) {
        var type = fragment.type.split('/')[fragment.chord.indexOf(residue)];
        if (type.match(/\d+,\d+/)) {
          var clean_type = type.replace(/[\,\-]/g, '_').replace(/\d+[a-z]$/, '');
          resolved_identifier = "fragment_".concat(clean_type);
        }
        if (type.match(/^[bc]/)) {
          var base_layout = this.LayoutEngine.PerformLayout(fragment.original);
          this.renderGlycosidicCleavage(container, base_layout.get(residue.original), base_layout.get(residue.original.parent), residue.original, residue.original.parent, true);
        }
      }
      if (fragment.chord.map(res => res.parent).indexOf(residue) >= 0) {
        var chord_parents = fragment.chord.map(res => res.parent);
        var chord_indices = chord_parents.map((res, idx) => res == residue ? idx : -1).filter(idx => idx > -1);
        var _base_layout = this.LayoutEngine.PerformLayout(fragment.original);
        for (var chord_index of chord_indices) {
          var chord_residue = fragment.chord[chord_index];
          var _type = fragment.type.split('/')[chord_index];
          if (!_type.match(/^[yz]/)) {
            continue;
          }
          this.renderGlycosidicCleavage(container, _base_layout.get(chord_residue.original), _base_layout.get(residue.original), chord_residue.original, residue.original);
        }
      }
    }
    var baseIcon = super.renderIcon(container, resolved_identifier, residue, sugar);
    if (!(residue instanceof FragmentResidue)) {
      if (!residue.getTag(FRAGMENT_MONOSACCHARIDE)) {
        baseIcon.element.style.setProperty('--fill-color', 'var(--fragment-removed-color)');
      } else {
        baseIcon.element.style.opacity = 0;
      }
    } else {
      baseIcon.element.style.setProperty('--fill-color', 'var(--fragment-color)');
    }
    return baseIcon;
  }
};

;// ./node_modules/glycan.js/js/io/glycoct.js
function glycoct_slicedToArray(r, e) { return glycoct_arrayWithHoles(r) || glycoct_iterableToArrayLimit(r, e) || glycoct_unsupportedIterableToArray(r, e) || glycoct_nonIterableRest(); }
function glycoct_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function glycoct_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return glycoct_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? glycoct_arrayLikeToArray(r, a) : void 0; } }
function glycoct_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function glycoct_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function glycoct_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
;

// GlycoCT substituent descriptor that maps to an HSO3 tree node.
var SULFATE_DESCRIPTOR = 'sulfate';



// ---------------------------------------------------------------------------
// Translation tables
// ---------------------------------------------------------------------------

// Key: backbone descriptor + sorted substituents joined with '+'
// Value: canonical MONOSACCHARIDE identifier
//
// NeuAc backbone confirmed against Glygen G17689DH fixture:
//   a-dgro-dgal-NON-2:6|1:a|2:keto|3:d (9-carbon nonose with acid/keto/deoxy mods)
// Fuc confirmed against G00051MO and G17689DH:
//   a-lgal-HEX-1:5|6:d (L-Fucose with C6-deoxy modifier)
var BACKBONE_TO_IDENTIFIER = {
  'b-dglc-HEX-1:5+n-acetyl': MONOSACCHARIDE.GlcNAc,
  'a-dglc-HEX-1:5+n-acetyl': MONOSACCHARIDE.GlcNAc,
  'b-dglc-HEX-1:5': MONOSACCHARIDE.Glc,
  'a-dglc-HEX-1:5': MONOSACCHARIDE.Glc,
  'b-dgal-HEX-1:5+n-acetyl': MONOSACCHARIDE.GalNAc,
  'a-dgal-HEX-1:5+n-acetyl': MONOSACCHARIDE.GalNAc,
  'b-dman-HEX-1:5+n-acetyl': MONOSACCHARIDE.ManNAc,
  'b-dgal-HEX-1:5': MONOSACCHARIDE.Gal,
  'a-dgal-HEX-1:5': MONOSACCHARIDE.Gal,
  'a-dgal-HEX-1:4': MONOSACCHARIDE.Galf,
  'b-dgal-HEX-1:4': MONOSACCHARIDE.Galf,
  'b-dman-HEX-1:5': MONOSACCHARIDE.Man,
  'a-dman-HEX-1:5': MONOSACCHARIDE.Man,
  'a-lgal-HEX-1:5|6:d': MONOSACCHARIDE.Fuc,
  'b-lgal-HEX-1:5|6:d': MONOSACCHARIDE.Fuc,
  'b-dxyl-PEN-1:5': MONOSACCHARIDE.Xyl,
  'a-dxyl-PEN-1:5': MONOSACCHARIDE.Xyl,
  'a-dgro-dgal-NON-2:6|1:a|2:keto|3:d+n-acetyl': MONOSACCHARIDE.NeuAc,
  'a-dgro-dgal-NON-2:6|1:a|2:keto|3:d+n-glycolyl': MONOSACCHARIDE.NeuGc,
  'b-dgro-dgal-NON-2:6|1:a|2:keto|3:d+n-acetyl': MONOSACCHARIDE.NeuAc,
  'b-dgro-dgal-NON-2:6|1:a|2:keto|3:d+n-glycolyl': MONOSACCHARIDE.NeuGc,
  'a-dgro-dgal-NON-2:6|1:a|2:keto|3:d+acetyl+n-acetyl': MONOSACCHARIDE.NeuAc9Ac,
  'a-dgro-dgal-NON-2:6|1:a|2:keto|3:d+acetyl+n-glycolyl': MONOSACCHARIDE.NeuGc9Ac,
  'b-dgro-dgal-NON-2:6|1:a|2:keto|3:d+acetyl+n-acetyl': MONOSACCHARIDE.NeuAc9Ac,
  'b-dgro-dgal-NON-2:6|1:a|2:keto|3:d+acetyl+n-glycolyl': MONOSACCHARIDE.NeuGc9Ac,
  'a-dglc-HEX-1:5|6:a': MONOSACCHARIDE.GlcA,
  'b-dglc-HEX-1:5|6:a': MONOSACCHARIDE.GlcA,
  'a-lido-HEX-1:5': MONOSACCHARIDE.IdoA,
  'b-dglc-HEX-1:5+amino': MONOSACCHARIDE.GlcN,
  'a-dglc-HEX-1:5+amino': MONOSACCHARIDE.GlcN
};

// For writing: identifier → backbone descriptor template + substituents + anomeric_pos.
// anomeric_pos: the GlycoCT toPos for this residue (1 for aldoses, 2 for ketoses like NeuAc).
// The backbone prefix is replaced at write time with the actual node anomer.
var IDENTIFIER_TO_GLYCOCT = {
  [MONOSACCHARIDE.GlcNAc]: {
    backbone: 'b-dglc-HEX-1:5',
    substituents: [{
      name: 'n-acetyl',
      pos: 2
    }],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.GalNAc]: {
    backbone: 'b-dgal-HEX-1:5',
    substituents: [{
      name: 'n-acetyl',
      pos: 2
    }],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.ManNAc]: {
    backbone: 'b-dman-HEX-1:5',
    substituents: [{
      name: 'n-acetyl',
      pos: 2
    }],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.GlcN]: {
    backbone: 'b-dglc-HEX-1:5',
    substituents: [{
      name: 'amino',
      pos: 2
    }],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.Glc]: {
    backbone: 'b-dglc-HEX-1:5',
    substituents: [],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.Gal]: {
    backbone: 'b-dgal-HEX-1:5',
    substituents: [],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.Galf]: {
    backbone: 'b-dgal-HEX-1:4',
    substituents: [],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.Man]: {
    backbone: 'b-dman-HEX-1:5',
    substituents: [],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.Fuc]: {
    backbone: 'a-lgal-HEX-1:5|6:d',
    substituents: [],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.Xyl]: {
    backbone: 'b-dxyl-PEN-1:5',
    substituents: [],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.NeuAc]: {
    backbone: 'a-dgro-dgal-NON-2:6|1:a|2:keto|3:d',
    substituents: [{
      name: 'n-acetyl',
      pos: 5
    }],
    anomeric_pos: 2
  },
  [MONOSACCHARIDE.NeuGc]: {
    backbone: 'a-dgro-dgal-NON-2:6|1:a|2:keto|3:d',
    substituents: [{
      name: 'n-glycolyl',
      pos: 5
    }],
    anomeric_pos: 2
  },
  [MONOSACCHARIDE.NeuAc9Ac]: {
    backbone: 'a-dgro-dgal-NON-2:6|1:a|2:keto|3:d+acetyl',
    substituents: [{
      name: 'n-acetyl',
      pos: 5
    }],
    anomeric_pos: 2
  },
  [MONOSACCHARIDE.NeuGc9Ac]: {
    backbone: 'a-dgro-dgal-NON-2:6|1:a|2:keto|3:d+acetyl',
    substituents: [{
      name: 'n-glycolyl',
      pos: 5
    }],
    anomeric_pos: 2
  },
  [MONOSACCHARIDE.GlcA]: {
    backbone: 'b-dglc-HEX-1:5|6:a',
    substituents: [],
    anomeric_pos: 1
  },
  [MONOSACCHARIDE.IdoA]: {
    backbone: 'a-lido-HEX-1:5',
    substituents: [],
    anomeric_pos: 1
  }
};

// ---------------------------------------------------------------------------
// Internal text parser — no `this` dependency
// ---------------------------------------------------------------------------
function parse_glycoct_text(text) {
  var lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  var residues = new Map(); // id → { type: 'backbone'|'substituent', descriptor }
  var linkages = [];
  var section = null;
  for (var line of lines) {
    if (line === 'RES') {
      section = 'RES';
      continue;
    }
    if (line === 'LIN') {
      section = 'LIN';
      continue;
    }
    if (section === 'RES') {
      var m = line.match(/^(\d+)(b|s):(.+)$/);
      if (!m) continue;
      var _m = glycoct_slicedToArray(m, 4),
        idStr = _m[1],
        type = _m[2],
        descriptor = _m[3];
      residues.set(Number(idStr), {
        type: type === 'b' ? 'backbone' : 'substituent',
        descriptor
      });
    } else if (section === 'LIN') {
      // {id}:{fromId}{fromEnd}({fromPos}+{toPos}){toId}{toType}
      var _m2 = line.match(/^(\d+):(\d+)([do])\((-?\d+|\?)\+(-?\d+|\?)\)(\d+)([dno])$/);
      if (!_m2) continue;
      var _m3 = glycoct_slicedToArray(_m2, 8),
        fromIdStr = _m3[2],
        fromEnd = _m3[3],
        fromPosStr = _m3[4],
        toPosStr = _m3[5],
        toIdStr = _m3[6],
        toType = _m3[7];
      linkages.push({
        fromId: Number(fromIdStr),
        fromEnd,
        fromPos: fromPosStr === '?' ? 0 : Number(fromPosStr),
        toPos: toPosStr === '?' ? 0 : Number(toPosStr),
        toId: Number(toIdStr),
        toType
      });
    }
  }
  return {
    residues,
    linkages
  };
}

// ---------------------------------------------------------------------------
// build_sequence — called with `this` as the sugar instance (Builder target)
// ---------------------------------------------------------------------------
function build_sequence(text) {
  var _blocks$find;
  // For multi-block GlycoCT, use the first block containing a RES section.
  var blocks = text.trim().split(/\n\s*\n/);
  var block = (_blocks$find = blocks.find(b => /^RES/m.test(b))) !== null && _blocks$find !== void 0 ? _blocks$find : blocks[0];
  var mono_class = this.constructor.Monosaccharide;
  var _parse_glycoct_text = parse_glycoct_text(block),
    residues = _parse_glycoct_text.residues,
    linkages = _parse_glycoct_text.linkages;

  // --- 1. Collect substituents attached to each backbone -------------------
  // Sulfate substituents are tracked separately: they become HSO3 child nodes
  // in the sugar tree rather than being folded into the backbone lookup key.
  var substByBackbone = new Map(); // backbone id → { normal: string[], sulfates: number[] }
  for (var lnk of linkages) {
    var from = residues.get(lnk.fromId);
    var to = residues.get(lnk.toId);
    if ((from === null || from === void 0 ? void 0 : from.type) !== 'backbone' || (to === null || to === void 0 ? void 0 : to.type) !== 'substituent') continue;
    if (!substByBackbone.has(lnk.fromId)) {
      substByBackbone.set(lnk.fromId, {
        normal: [],
        sulfates: []
      });
    }
    var info = substByBackbone.get(lnk.fromId);
    if (to.descriptor === SULFATE_DESCRIPTOR) {
      info.sulfates.push(lnk.fromPos);
    } else {
      info.normal.push(to.descriptor);
    }
  }

  // --- 2. Create Monosaccharide instances ----------------------------------
  var monoById = new Map(); // backbone id → Monosaccharide
  for (var _ref3 of residues) {
    var _ref2 = glycoct_slicedToArray(_ref3, 2);
    var id = _ref2[0];
    var res = _ref2[1];
    {
      var _substByBackbone$get;
      if (res.type !== 'backbone') continue;
      var _info = (_substByBackbone$get = substByBackbone.get(id)) !== null && _substByBackbone$get !== void 0 ? _substByBackbone$get : {
        normal: [],
        sulfates: []
      };
      var substs = _info.normal.slice().sort();
      var key = substs.length > 0 ? "".concat(res.descriptor, "+").concat(substs.join('+')) : res.descriptor;
      var identifier = BACKBONE_TO_IDENTIFIER[key];
      if (!identifier) {
        throw new Error("[glycoct] Unknown descriptor: \"".concat(key, "\""));
      }
      var mono = new mono_class(identifier);

      // Sulfate substituents become HSO3 children at the recorded positions.
      for (var pos of _info.sulfates) {
        var hso3 = new mono_class(MONOSACCHARIDE.HSO3);
        hso3.anomer = 'u';
        hso3.parent_linkage = 0; // unknown; written as '?' in IUPAC
        mono.addChild(pos, hso3);
      }
      monoById.set(id, mono);
    }
  }

  // --- 3. Identify root (reducing end = never a backbone link target) ------
  var hasParent = new Set();
  for (var _lnk of linkages) {
    var _residues$get, _residues$get2;
    if (((_residues$get = residues.get(_lnk.fromId)) === null || _residues$get === void 0 ? void 0 : _residues$get.type) === 'backbone' && ((_residues$get2 = residues.get(_lnk.toId)) === null || _residues$get2 === void 0 ? void 0 : _residues$get2.type) === 'backbone') {
      hasParent.add(_lnk.toId);
    }
  }
  var rootId = null;
  for (var _id of monoById.keys()) {
    if (!hasParent.has(_id)) {
      rootId = _id;
      break;
    }
  }
  if (rootId === null) throw new Error('[glycoct] Could not determine root residue');
  this.root = monoById.get(rootId);

  // --- 4. Wire backbone–backbone linkages ----------------------------------
  for (var _lnk2 of linkages) {
    var _residues$get3, _residues$get4;
    if (((_residues$get3 = residues.get(_lnk2.fromId)) === null || _residues$get3 === void 0 ? void 0 : _residues$get3.type) !== 'backbone' || ((_residues$get4 = residues.get(_lnk2.toId)) === null || _residues$get4 === void 0 ? void 0 : _residues$get4.type) !== 'backbone') continue;
    var parent = monoById.get(_lnk2.fromId);
    var child = monoById.get(_lnk2.toId);

    // fromPos = position on parent; toPos = anomeric position on child
    // (1 for aldoses, 2 for ketoses like NeuAc)
    parent.addChild(_lnk2.fromPos, child);
    child.parent_linkage = _lnk2.toPos;

    // Anomer from first character of the child's backbone descriptor
    child.anomer = residues.get(_lnk2.toId).descriptor[0];
  }
}

// ---------------------------------------------------------------------------
// write_sequence — called with `this` as the sugar instance (Writer target)
// ---------------------------------------------------------------------------
function write_sequence() {
  // BFS assigns IDs: reducing end (root) gets id 1.
  // HSO3 sulfate children are excluded from the backbone BFS — they are
  // written as s:sulfate substituents alongside their parent backbone entry.
  var idOf = new Map();
  var order = [];
  var nextId = 1;
  var queue = [this.root];
  var _loop = function _loop() {
    var node = queue.shift();
    idOf.set(node, nextId++);
    order.push(node);
    var children = [...node.children].filter(c => c.identifier !== MONOSACCHARIDE.HSO3).sort((a, b) => node.linkageOf(a) - node.linkageOf(b));
    queue.push(...children);
  };
  while (queue.length) {
    _loop();
  }
  var resLines = [];
  var linLines = [];
  var substId = order.length + 1; // substituent IDs follow all backbone IDs
  var linkId = 1;

  // RES section + substituent LIN entries
  var _loop2 = function _loop2(node) {
    var bId = idOf.get(node);
    var def = IDENTIFIER_TO_GLYCOCT[node.identifier];
    if (!def) throw new Error("[glycoct] No GlycoCT definition for identifier \"".concat(node.identifier, "\""));

    // Use the node's actual anomer for non-root residues; fall back to the
    // table default (used for the reducing-end root which has no parent).
    var anomer = node.parent ? node.anomer || def.backbone[0] : def.backbone[0];
    var backbone = def.backbone.replace(/^[a-z]/, anomer);
    resLines.push("".concat(bId, "b:").concat(backbone));

    // Regular substituents from the identifier table (e.g. n-acetyl).
    for (var subst of def.substituents) {
      var sId = substId++;
      resLines.push("".concat(sId, "s:").concat(subst.name));
      linLines.push("".concat(linkId++, ":").concat(bId, "d(").concat(subst.pos, "+1)").concat(sId, "n"));
    }

    // HSO3 children → written as sulfate substituents.
    var sulfates = [...node.children].filter(c => c.identifier === MONOSACCHARIDE.HSO3).sort((a, b) => node.linkageOf(a) - node.linkageOf(b));
    for (var hso3 of sulfates) {
      var _sId = substId++;
      var pos = node.linkageOf(hso3);
      resLines.push("".concat(_sId, "s:").concat(SULFATE_DESCRIPTOR));
      linLines.push("".concat(linkId++, ":").concat(bId, "o(").concat(pos, "+1)").concat(_sId, "n"));
    }
  };
  for (var node of order) {
    _loop2(node);
  }

  // Backbone–backbone LIN entries
  for (var _node of order) {
    var _def$anomeric_pos;
    if (!_node.parent) continue;
    var pId = idOf.get(_node.parent);
    var cId = idOf.get(_node);
    var def = IDENTIFIER_TO_GLYCOCT[_node.identifier];
    var fromPos = _node.parent.linkageOf(_node);
    var toPos = (_def$anomeric_pos = def === null || def === void 0 ? void 0 : def.anomeric_pos) !== null && _def$anomeric_pos !== void 0 ? _def$anomeric_pos : 1;
    linLines.push("".concat(linkId++, ":").concat(pId, "o(").concat(fromPos, "+").concat(toPos, ")").concat(cId, "d"));
  }
  return "RES\n".concat(resLines.join('\n'), "\nLIN\n").concat(linLines.join('\n'), "\n");
}

// ---------------------------------------------------------------------------
// Mixin helpers (mirrors CondensedIupac.js pattern)
// ---------------------------------------------------------------------------
var glycoct_getPropertyDescriptor = function getPropertyDescriptor(object, descriptor) {
  var retval = null;
  while (!(retval = Object.getOwnPropertyDescriptor(object, descriptor)) && Object.getPrototypeOf(object)) {
    object = Object.getPrototypeOf(object);
  }
  return retval;
};
var glycoct_anonymous_class = superclass => class extends superclass {};

// ---------------------------------------------------------------------------
// Builder — adds a GlycoCT `sequence` setter; preserves any existing getter.
// ---------------------------------------------------------------------------
var glycoct_Builder = function Builder(superclass) {
  var getter = (glycoct_getPropertyDescriptor(superclass.prototype, 'sequence') || {
    get: null
  }).get;
  var setter = function setter(sequence) {
    build_sequence.call(this, sequence);
  };
  var methods = {};
  if (getter) methods.get = getter;
  if (setter) methods.set = setter;
  Object.defineProperty(superclass.prototype, 'sequence', methods);
  return class extends superclass {};
};

// ---------------------------------------------------------------------------
// Writer — adds a GlycoCT `sequence` getter; preserves any existing setter.
// ---------------------------------------------------------------------------
var glycoct_Writer = function Writer(superclass) {
  var setter = (glycoct_getPropertyDescriptor(superclass.prototype, 'sequence') || {
    set: null
  }).set;
  var getter = function getter() {
    return write_sequence.call(this);
  };
  var methods = {};
  if (getter) methods.get = getter;
  if (setter) methods.set = setter;
  Object.defineProperty(superclass.prototype, 'sequence', methods);
  return class extends superclass {};
};

// ---------------------------------------------------------------------------
// IO — full GlycoCT round-trip (reads GlycoCT, writes GlycoCT).
// ---------------------------------------------------------------------------
var glycoct_IO = superclass => glycoct_Builder(glycoct_Writer(glycoct_anonymous_class(superclass)));

// ---------------------------------------------------------------------------
// Convenience functions
// ---------------------------------------------------------------------------

// readGlycoCT: GlycoCT setter layered on top of IupacIO so that
// sugar.sequence getter returns IUPAC condensed format.
var _GlycoCTReader = glycoct_Builder(glycoct_anonymous_class(IO(Sugar)));

/**
 * Parse a GlycoCT string and return a Sugar whose `.sequence` getter
 * returns the IUPAC condensed sequence.
 *
 * @param {string} text  GlycoCT text (first block used if multi-block)
 * @returns {Sugar}
 */
function readGlycoCT(text) {
  var sugar = new _GlycoCTReader();
  sugar.sequence = text;
  return sugar;
}

/**
 * Serialise any Sugar to a GlycoCT string.
 *
 * @param {Sugar} sugar
 * @returns {string}
 */
function writeGlycoCT(sugar) {
  return write_sequence.call(sugar);
}
;// ./node_modules/glycan.js/js/main.js














var main_FishEyeLayout = FishEyeLayout;
var SugarAwareLayoutFishEye = MakeFishEye(SugarAwareLayout);
var LinkageLayoutFishEye = MakeFishEye(js_LinkageLayout);













/***/ }

}]);