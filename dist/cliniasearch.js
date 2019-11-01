(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cliniasearch = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var CliniaSearch = require('../../CliniaSearch.js');
var createCliniasearch = require('../createCliniasearch.js');

module.exports = createCliniasearch(CliniaSearch, 'Browser');

},{"../../CliniaSearch.js":15,"../createCliniasearch.js":19}],2:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
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
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

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
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))

},{"./debug":3,"_process":11}],3:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
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
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":10}],4:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":11}],5:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],6:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],8:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],9:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],10:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
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

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
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
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
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
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
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
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],11:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],14:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":12,"./encode":13}],15:[function(require,module,exports){
module.exports = CliniaSearch;

var CliniaSearchCore = require('./CliniaSearchCore.js');
var inherits = require('inherits');
var errors = require('./errors');

function CliniaSearch() {
  CliniaSearchCore.apply(this, arguments);
}

inherits(CliniaSearch, CliniaSearchCore);

// We do not provide write API at the moment

function notImplemented() {
  var message =
    'Not implemented in this environment.\n' +
    'If you feel this is a mistake, write to support@clinia.ca';

  throw new errors.CliniaSearchError(message);
}

},{"./CliniaSearchCore.js":16,"./errors":24,"inherits":7}],16:[function(require,module,exports){
(function (process){
module.exports = CliniaSearchCore;

var errors = require('./errors');
var exitPromise = require('./exitPromise.js');
var IndexCore = require('./IndexCore.js');
var store = require('./store.js');
var isArray = require('isarray');
var argCheck = require('./argCheck.js')
var logger = require('./logger.js')
var buildSearchMethod = require('./buildSearchMethod.js');

// We will always put the API KEY in the JSON body in case of too long API KEY,
// to avoid query string being too long and failing in various conditions (our server limit, browser limit,
// proxies limit)
var MAX_API_KEY_LENGTH = 500;
var RESET_APP_DATA_TIMER =
  (process.env.RESET_APP_DATA_TIMER &&
    parseInt(process.env.RESET_APP_DATA_TIMER, 10)) ||
  60 * 2 * 1000; // after 2 minutes reset to first host

/**
 * Clinia Search library initialization
 * https://www.cliniahealth.com/
 *
 * @param {string} applicationID - Your applicationID, found in your dashboard
 * @param {string} apiKey - Your API key, found in your dashboard
 * @param {Object} [opts]
 * @param {number} [opts.timeout=2000] - The request timeout set in milliseconds,
 * another request will be issued after this timeout
 * @param {string} [opts.protocol='https:'] - The protocol used to query Clinia Search API.
 *                                        Set to 'http:' to force using http.
 */
function CliniaSearchCore(applicationID, apiKey, opts) {
  var debug = require('debug')('cliniasearch');

  var clone = require('./clone.js');
  var map = require('./map.js');

  var usage = 'Usage: cliniasearch(applicationID, apiKey, opts)';

  if (opts._allowEmptyCredentials !== true && !applicationID) {
    throw new errors.CliniaSearchError(
      'Please provide an application ID. ' + usage
    );
  }

  if (opts._allowEmptyCredentials !== true && !apiKey) {
    throw new errors.CliniaSearchError('Please provide an API key. ' + usage);
  }

  this.applicationID = applicationID;
  this.apiKey = apiKey;
  /** This feels weird and is probably wrong but we need it to access our methods in the client like we do in the indexes. */
  this.as = this

  this.hosts = {
    read: [],
    write: [],
  };

  opts = opts || {};

  this._timeouts = opts.timeouts || {
    connect: 1 * 1000, // 500ms connect is GPRS latency
    read: 2 * 1000,
    write: 30 * 1000,
  };

  // backward compat, if opts.timeout is passed, we use it to configure all timeouts like before
  if (opts.timeout) {
    this._timeouts.connect = this._timeouts.read = this._timeouts.write =
      opts.timeout;
  }

  var protocol = opts.protocol || 'https:';
  // while we advocate for colon-at-the-end values: 'http:' for `opts.protocol`
  // we also accept `http` and `https`. It's a common error.
  if (!/:$/.test(protocol)) {
    protocol = protocol + ':';
  }

  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new errors.CliniaSearchError(
      'protocol must be `http:` or `https:` (was `' + opts.protocol + '`)'
    );
  }

  this._checkAppIdData();

  if (!opts.hosts) {
    var defaultHosts = map(this._shuffleResult, function(hostNumber) {
      return applicationID + '-' + hostNumber + '.clinia.ca';
    });

    // no hosts given, compute defaults
    var mainSuffix = (opts.dsn === false ? '' : '-dsn') + '.clinia.ca';
    this.hosts.read = [this.applicationID + mainSuffix].concat(defaultHosts);
    this.hosts.write = [this.applicationID + '.clinia.ca'].concat(defaultHosts);
  } else if (isArray(opts.hosts)) {
    // when passing custom hosts, we need to have a different host index if the number
    // of write/read hosts are different.
    this.hosts.read = clone(opts.hosts);
    this.hosts.write = clone(opts.hosts);
  } else {
    this.hosts.read = clone(opts.hosts.read);
    this.hosts.write = clone(opts.hosts.write);
  }

  // add protocol and lowercase hosts
  this.hosts.read = map(this.hosts.read, prepareHost(protocol));
  this.hosts.write = map(this.hosts.write, prepareHost(protocol));

  this.extraHeaders = {};

  // In some situations you might want to warm the cache
  this.cache = opts._cache || {};

  this._ua = opts._ua;
  this._useCache =
    opts._useCache === undefined || opts._cache ? true : opts._useCache;
  this._useRequestCache = this._useCache && opts._useRequestCache;
  this._useFallback = opts.useFallback === undefined ? true : opts.useFallback;

  this._setTimeout = opts._setTimeout;

  debug('init done, %j', this);
}

/*
 * Get the index object initialized
 *
 * @param indexName the name of index
 * @param callback the result callback with one argument (the Index instance)
 */
CliniaSearchCore.prototype.initIndex = function(indexName) {
  return new IndexCore(this, indexName);
};

/**
 * Add an extra field to the HTTP request
 *
 * @param name the header field name
 * @param value the header field value
 */
CliniaSearchCore.prototype.setExtraHeader = function(name, value) {
  this.extraHeaders[name.toLowerCase()] = value;
};

/**
 * Get the value of an extra HTTP header
 *
 * @param name the header field name
 */
CliniaSearchCore.prototype.getExtraHeader = function(name) {
  return this.extraHeaders[name.toLowerCase()];
};

/**
 * Remove an extra field from the HTTP request
 *
 * @param name the header field name
 */
CliniaSearchCore.prototype.unsetExtraHeader = function(name) {
  delete this.extraHeaders[name.toLowerCase()];
};

/**
 * Augment sent x-clinia-agent with more data, each agent part
 * is automatically separated from the others by a semicolon;
 *
 * @param cliniaAgent the agent to add
 */
CliniaSearchCore.prototype.addCliniaAgent = function(cliniaAgent) {
  var cliniaAgentWithDelimiter = '; ' + cliniaAgent;

  if (this._ua.indexOf(cliniaAgentWithDelimiter) === -1) {
    this._ua += cliniaAgentWithDelimiter;
  }
};

/*
 * Wrapper that try all hosts to maximize the quality of service
 */
CliniaSearchCore.prototype._jsonRequest = function(initialOpts) {
  this._checkAppIdData();

  var requestDebug = require('debug')('cliniasearch:' + initialOpts.url);

  var body;
  var cacheID;
  var additionalUA = initialOpts.additionalUA || '';
  var cache = initialOpts.cache;
  var client = this;
  var tries = 0;
  var usingFallback = false;
  var hasFallback =
    client._useFallback && client._request.fallback && initialOpts.fallback;
  var headers;

  if (
    this.apiKey.length > MAX_API_KEY_LENGTH &&
    initialOpts.body !== undefined &&
    (initialOpts.body.params !== undefined || // index.search()
      initialOpts.body.requests !== undefined) // client.search()
  ) {
    initialOpts.body.apiKey = this.apiKey;
    headers = this._computeRequestHeaders({
      additionalUA: additionalUA,
      withApiKey: false,
      headers: initialOpts.headers,
    });
  } else {
    headers = this._computeRequestHeaders({
      additionalUA: additionalUA,
      headers: initialOpts.headers,
    });
  }

  if (initialOpts.body !== undefined) {
    body = safeJSONStringify(initialOpts.body);
  }

  requestDebug('request start');
  var debugData = [];

  function doRequest(requester, reqOpts) {
    client._checkAppIdData();

    var startTime = new Date();

    if (client._useCache && !client._useRequestCache) {
      cacheID = initialOpts.url;
    }

    // as we sometime use POST requests to pass parameters (like query='aa'),
    // the cacheID must also include the body to be different between calls
    if (client._useCache && !client._useRequestCache && body) {
      cacheID += '_body_' + reqOpts.body;
    }

    // handle cache existence
    if (isCacheValidWithCurrentID(!client._useRequestCache, cache, cacheID)) {
      requestDebug('serving response from cache');

      var responseText = cache[cacheID];

      // Cache response must match the type of the original one
      return client._promise.resolve({
        body: JSON.parse(responseText),
        responseText: responseText,
      });
    }

    // if we reached max tries
    if (tries >= client.hosts[initialOpts.hostType].length) {
      if (!hasFallback || usingFallback) {
        requestDebug('could not get any response');
        // then stop
        return client._promise.reject(
          new errors.CliniaSearchError(
            'Cannot connect to the CliniaSearch API.' +
              ' Application id was: ' +
              client.applicationID,
            { debugData: debugData }
          )
        );
      }

      requestDebug('switching to fallback');

      // let's try the fallback starting from here
      tries = 0;

      // method, url and body are fallback dependent
      reqOpts.method = initialOpts.fallback.method;
      reqOpts.url = initialOpts.fallback.url;
      reqOpts.jsonBody = initialOpts.fallback.body;
      if (reqOpts.jsonBody) {
        reqOpts.body = safeJSONStringify(reqOpts.jsonBody);
      }
      // re-compute headers, they could be omitting the API KEY
      headers = client._computeRequestHeaders({
        additionalUA: additionalUA,
        headers: initialOpts.headers,
      });

      reqOpts.timeouts = client._getTimeoutsForRequest(initialOpts.hostType);
      client._setHostIndexByType(0, initialOpts.hostType);
      usingFallback = true; // the current request is now using fallback
      return doRequest(client._request.fallback, reqOpts);
    }

    var currentHost = client._getHostByType(initialOpts.hostType);

    var url = currentHost + reqOpts.url;
    var options = {
      body: reqOpts.body,
      jsonBody: reqOpts.jsonBody,
      method: reqOpts.method,
      headers: headers,
      timeouts: reqOpts.timeouts,
      debug: requestDebug,
      forceAuthHeaders: reqOpts.forceAuthHeaders,
    };

    requestDebug(
      'method: %s, url: %s, headers: %j, timeouts: %d',
      options.method,
      url,
      options.headers,
      options.timeouts
    );

    if (requester === client._request.fallback) {
      requestDebug('using fallback');
    }

    // `requester` is any of this._request or this._request.fallback
    // thus it needs to be called using the client as context
    return requester.call(client, url, options).then(success, tryFallback);

    function success(httpResponse) {
      // compute the status of the response,
      //
      // When in browser mode, using XDR or JSONP, we have no statusCode available
      // So we rely on our API response `status` property.
      // But `waitTask` can set a `status` property which is not the statusCode (it's the task status)
      // So we check if there's a `message` along `status` and it means it's an error
      //
      // That's the only case where we have a response.status that's not the http statusCode
      var status =
        (httpResponse &&
          httpResponse.body &&
          httpResponse.body.message &&
          httpResponse.body.status) ||
        // this is important to check the request statusCode AFTER the body eventual
        // statusCode because some implementations (jQuery XDomainRequest transport) may
        // send statusCode 200 while we had an error
        httpResponse.statusCode ||
        // When in browser mode, using XDR or JSONP
        // we default to success when no error (no response.status && response.message)
        // If there was a JSON.parse() error then body is null and it fails
        (httpResponse && httpResponse.body && 200);

      requestDebug(
        'received response: statusCode: %s, computed statusCode: %d, headers: %j',
        httpResponse.statusCode,
        status,
        httpResponse.headers
      );

      var httpResponseOk = Math.floor(status / 100) === 2;

      var endTime = new Date();
      debugData.push({
        currentHost: currentHost,
        headers: removeCredentials(headers),
        content: body || null,
        contentLength: body !== undefined ? body.length : null,
        method: reqOpts.method,
        timeouts: reqOpts.timeouts,
        url: reqOpts.url,
        startTime: startTime,
        endTime: endTime,
        duration: endTime - startTime,
        statusCode: status,
      });

      if (httpResponseOk) {
        if (client._useCache && !client._useRequestCache && cache) {
          cache[cacheID] = httpResponse.responseText;
        }

        return {
          responseText: httpResponse.responseText,
          body: httpResponse.body,
        };
      }

      var shouldRetry = Math.floor(status / 100) !== 4;

      if (shouldRetry) {
        tries += 1;
        return retryRequest();
      }

      requestDebug('unrecoverable error');

      // no success and no retry => fail
      var unrecoverableError = new errors.CliniaSearchError(
        httpResponse.body && httpResponse.body.message,
        { debugData: debugData, statusCode: status }
      );

      return client._promise.reject(unrecoverableError);
    }

    function tryFallback(err) {
      // error cases:
      //  While not in fallback mode:
      //    - CORS not supported
      //    - network error
      //  While in fallback mode:
      //    - timeout
      //    - network error
      //    - badly formatted JSONP (script loaded, did not call our callback)
      //  In both cases:
      //    - uncaught exception occurs (TypeError)
      requestDebug('error: %s, stack: %s', err.message, err.stack);

      var endTime = new Date();
      debugData.push({
        currentHost: currentHost,
        headers: removeCredentials(headers),
        content: body || null,
        contentLength: body !== undefined ? body.length : null,
        method: reqOpts.method,
        timeouts: reqOpts.timeouts,
        url: reqOpts.url,
        startTime: startTime,
        endTime: endTime,
        duration: endTime - startTime,
      });

      if (!(err instanceof errors.CliniaSearchError)) {
        err = new errors.Unknown(err && err.message, err);
      }

      tries += 1;

      // stop the request implementation when:
      if (
        // we did not generate this error,
        // it comes from a throw in some other piece of code
        err instanceof errors.Unknown ||
        // server sent unparsable JSON
        err instanceof errors.UnparsableJSON ||
        // max tries and already using fallback or no fallback
        (tries >= client.hosts[initialOpts.hostType].length &&
          (usingFallback || !hasFallback))
      ) {
        // stop request implementation for this command
        err.debugData = debugData;
        return client._promise.reject(err);
      }

      // When a timeout occurred, retry by raising timeout
      if (err instanceof errors.RequestTimeout) {
        return retryRequestWithHigherTimeout();
      }

      return retryRequest();
    }

    function retryRequest() {
      requestDebug('retrying request');
      client._incrementHostIndex(initialOpts.hostType);
      return doRequest(requester, reqOpts);
    }

    function retryRequestWithHigherTimeout() {
      requestDebug('retrying request with higher timeout');
      client._incrementHostIndex(initialOpts.hostType);
      client._incrementTimeoutMultipler();
      reqOpts.timeouts = client._getTimeoutsForRequest(initialOpts.hostType);
      return doRequest(requester, reqOpts);
    }
  }

  function isCacheValidWithCurrentID(
    useRequestCache,
    currentCache,
    currentCacheID
  ) {
    return (
      client._useCache &&
      useRequestCache &&
      currentCache &&
      currentCache[currentCacheID] !== undefined
    );
  }

  function interopCallbackReturn(request, callback) {
    if (isCacheValidWithCurrentID(client._useRequestCache, cache, cacheID)) {
      request.catch(function() {
        // Release the cache on error
        delete cache[cacheID];
      });
    }

    if (typeof initialOpts.callback === 'function') {
      // either we have a callback
      request.then(
        function okCb(content) {
          exitPromise(function() {
            initialOpts.callback(null, callback(content));
          }, client._setTimeout || setTimeout);
        },
        function nookCb(err) {
          exitPromise(function() {
            initialOpts.callback(err);
          }, client._setTimeout || setTimeout);
        }
      );
    } else {
      // either we are using promises
      return request.then(callback);
    }
  }

  if (client._useCache && client._useRequestCache) {
    cacheID = initialOpts.url;
  }

  // as we sometime use POST requests to pass parameters (like query='aa'),
  // the cacheID must also include the body to be different between calls
  if (client._useCache && client._useRequestCache && body) {
    cacheID += '_body_' + body;
  }

  if (isCacheValidWithCurrentID(client._useRequestCache, cache, cacheID)) {
    requestDebug('serving request from cache');

    var maybePromiseForCache = cache[cacheID];

    // In case the cache is warmup with value that is not a promise
    var promiseForCache =
      typeof maybePromiseForCache.then !== 'function'
        ? client._promise.resolve({ responseText: maybePromiseForCache })
        : maybePromiseForCache;

    return interopCallbackReturn(promiseForCache, function(content) {
      // In case of the cache request, return the original value
      return JSON.parse(content.responseText);
    });
  }

  var request = doRequest(client._request, {
    url: initialOpts.url,
    method: initialOpts.method,
    body: body,
    jsonBody: initialOpts.body,
    timeouts: client._getTimeoutsForRequest(initialOpts.hostType),
    forceAuthHeaders: initialOpts.forceAuthHeaders,
  });

  if (client._useCache && client._useRequestCache && cache) {
    cache[cacheID] = request;
  }

  return interopCallbackReturn(request, function(content) {
    // In case of the first request, return the JSON value
    return content.body;
  });
};

/**
 * Transform search param object in query string
 * @param {object} args arguments to add to the current query string
 * @param {string} params current query string
 * @return {string} the final query string
 */
CliniaSearchCore.prototype._getSearchParams = function(args, params) {
  if (args === undefined || args === null) {
    return params;
  }

  if (argCheck.isNotNullOrUndefined(args.page) && typeof args.page !== 'number') {
    logger.warn('Ignoring search query parameter `page`. Must be a number.')
    delete args.page
  }

  if (argCheck.isNotNullOrUndefined(args.perPage) && typeof args.perPage !== 'number') {
    logger.warn('Ignoring search query parameter `perPage`. Must be a number.')
    delete args.perPage
  }

  if (argCheck.isNotNullOrUndefined(args.filters)) {
    if ((typeof args.filters !== 'object' || isArray(args.filters))) {
      logger.warn('Ignoring search query parameter `filters`. Must be an object.')
      delete args.filters
    } else {
      if (argCheck.isNotNullOrUndefined(args.filters.types) && !isArray(args.filters.types)) {
        logger.warn('Ignoring search query parameter `filters.types`. Must be an array.')
        delete args.filters.types
      }

      if (argCheck.isNotNullOrUndefined(args.filters.hours)) {
        if (typeof args.filters.hours !== 'object' || isArray(args.filters.hours)) {
          logger.warn('Ignoring search query parameter `filters.hours`. Must be an object.')
          delete args.filters.hours
        } else {
          if (argCheck.isNotNullOrUndefined(args.filters.hours.offset) && typeof args.filters.hours.offset !== 'number') {
            logger.warn('Ignoring search query parameter `filters.hours.offset`. Must be a number.')
            delete args.filters.hours.offset
          }

          if (argCheck.isNotNullOrUndefined(args.filters.hours.values) && !isArray(args.filters.hours.values)) {
            logger.warn('Ignoring search query parameter `filters.hours.values`. Must be an array.')
            delete args.filters.hours.values
          }
        }
      }

      if (argCheck.isNotNullOrUndefined(args.filters.geo) && typeof args.filters.geo !== 'string') {
        logger.warn('Ignoring search query parameter `filters.geo`. Must be a string.')
        delete args.filters.geo
      }
    }
  }

  if (argCheck.isNotNullOrUndefined(args.queryTypes) && !isArray(args.queryTypes)) {
    logger.warn('Ignoring search query parameter `queryTypes`. Must be an array.')
    delete args.queryTypes
  }

  for (var key in args) {
    if (key !== null && args[key] !== undefined && args.hasOwnProperty(key)) {
      params[key] = args[key]
    }
  }

  return params
};

/**
 * Compute the headers for a request
 *
 * @param [string] options.additionalUA semi-colon separated string with other user agents to add
 * @param [boolean=true] options.withApiKey Send the api key as a header
 * @param [Object] options.headers Extra headers to send
 */
CliniaSearchCore.prototype._computeRequestHeaders = function(options) {
  var forEach = require('foreach');

  var ua = options.additionalUA
    ? this._ua + '; ' + options.additionalUA
    : this._ua;

  var requestHeaders = {
    'x-clinia-agent': ua,
    'x-clinia-application-id': this.applicationID,
  };

  // browser will inline headers in the url, node.js will use http headers
  // but in some situations, the API KEY will be too long (big secured API keys)
  // so if the request is a POST and the KEY is very long, we will be asked to not put
  // it into headers but in the JSON body
  if (options.withApiKey !== false) {
    requestHeaders['x-clinia-api-key'] = this.apiKey;
  }

  if (this.userToken) {
    requestHeaders['x-clinia-usertoken'] = this.userToken;
  }

  if (this.securityTags) {
    requestHeaders['x-clinia-tagfilters'] = this.securityTags;
  }

  forEach(this.extraHeaders, function addToRequestHeaders(value, key) {
    requestHeaders[key] = value;
  });

  if (options.headers) {
    forEach(options.headers, function addToRequestHeaders(value, key) {
      requestHeaders[key] = value;
    });
  }

  return requestHeaders;
};

/**
 * Search through multiple indices at the same time
 * @param  {Object[]}   queries  An array of queries you want to run.
 * @param {string} queries[].indexName The index name you want to target
 * @param {string} [queries[].query] The query to issue on this index. Can also be passed into `params`
 * @param {Object} queries[].params Any search param like hitsPerPage, ..
 * @param  {Function} callback Callback to be called
 * @return {Promise|undefined} Returns a promise if no callback given
 */

CliniaSearchCore.prototype.search = buildSearchMethod(true)

CliniaSearchCore.prototype._search = function(params, url, callback, additionalUA) {
  // TODO : This is a workaround to simulate the different index endpoint.
  params.documentTypes = ['health_facility', 'professional']
  var tempUrl = '/search/v1/search'
  // var realUrl = '/search/v1/*'
  return this._jsonRequest({
    cache: this.cache,
    method: 'POST',
    url: url || tempUrl,
    body: params,
    hostType: 'read',
    fallback: {
      method: 'GET',
      url: url || tempUrl,
      body: params,
    },
    callback: callback,
  });
};

/**
 * Set the extra security tagFilters header
 * @param {string|array} tags The list of tags defining the current security filters
 */
CliniaSearchCore.prototype.setSecurityTags = function(tags) {
  if (Object.prototype.toString.call(tags) === '[object Array]') {
    var strTags = [];
    for (var i = 0; i < tags.length; ++i) {
      if (Object.prototype.toString.call(tags[i]) === '[object Array]') {
        var oredTags = [];
        for (var j = 0; j < tags[i].length; ++j) {
          oredTags.push(tags[i][j]);
        }
        strTags.push('(' + oredTags.join(',') + ')');
      } else {
        strTags.push(tags[i]);
      }
    }
    tags = strTags.join(',');
  }

  this.securityTags = tags;
};

/**
 * Set the extra user token header
 * @param {string} userToken The token identifying a uniq user (used to apply rate limits)
 */
CliniaSearchCore.prototype.setUserToken = function(userToken) {
  this.userToken = userToken;
};

/**
 * Clear all queries in client's cache
 * @return undefined
 */
CliniaSearchCore.prototype.clearCache = function() {
  this.cache = {};
};

/**
 * Set the three different (connect, read, write) timeouts to be used when requesting
 * @param {Object} timeouts
 */
CliniaSearchCore.prototype.setTimeouts = function(timeouts) {
  this._timeouts = timeouts;
};

/**
 * Get the three different (connect, read, write) timeouts to be used when requesting
 * @param {Object} timeouts
 */
CliniaSearchCore.prototype.getTimeouts = function() {
  return this._timeouts;
};

CliniaSearchCore.prototype._getAppIdData = function() {
  var data = store.get(this.applicationID);
  if (data !== null) this._cacheAppIdData(data);
  return data;
};

CliniaSearchCore.prototype._setAppIdData = function(data) {
  data.lastChange = new Date().getTime();
  this._cacheAppIdData(data);
  return store.set(this.applicationID, data);
};

CliniaSearchCore.prototype._checkAppIdData = function() {
  var data = this._getAppIdData();
  var now = new Date().getTime();
  if (data === null || now - data.lastChange > RESET_APP_DATA_TIMER) {
    return this._resetInitialAppIdData(data);
  }

  return data;
};

CliniaSearchCore.prototype._resetInitialAppIdData = function(data) {
  var newData = data || {};
  newData.hostIndexes = { read: 0, write: 0 };
  newData.timeoutMultiplier = 1;
  newData.shuffleResult = newData.shuffleResult || shuffle([1, 2, 3]);
  return this._setAppIdData(newData);
};

CliniaSearchCore.prototype._cacheAppIdData = function(data) {
  this._hostIndexes = data.hostIndexes;
  this._timeoutMultiplier = data.timeoutMultiplier;
  this._shuffleResult = data.shuffleResult;
};

CliniaSearchCore.prototype._partialAppIdDataUpdate = function(newData) {
  var foreach = require('foreach');
  var currentData = this._getAppIdData();
  foreach(newData, function(value, key) {
    currentData[key] = value;
  });

  return this._setAppIdData(currentData);
};

CliniaSearchCore.prototype._getHostByType = function(hostType) {
  return this.hosts[hostType][this._getHostIndexByType(hostType)];
};

CliniaSearchCore.prototype._getTimeoutMultiplier = function() {
  return this._timeoutMultiplier;
};

CliniaSearchCore.prototype._getHostIndexByType = function(hostType) {
  return this._hostIndexes[hostType];
};

CliniaSearchCore.prototype._setHostIndexByType = function(hostIndex, hostType) {
  var clone = require('./clone');
  var newHostIndexes = clone(this._hostIndexes);
  newHostIndexes[hostType] = hostIndex;
  this._partialAppIdDataUpdate({ hostIndexes: newHostIndexes });
  return hostIndex;
};

CliniaSearchCore.prototype._incrementHostIndex = function(hostType) {
  return this._setHostIndexByType(
    (this._getHostIndexByType(hostType) + 1) % this.hosts[hostType].length,
    hostType
  );
};

CliniaSearchCore.prototype._incrementTimeoutMultipler = function() {
  var timeoutMultiplier = Math.max(this._timeoutMultiplier + 1, 4);
  return this._partialAppIdDataUpdate({ timeoutMultiplier: timeoutMultiplier });
};

CliniaSearchCore.prototype._getTimeoutsForRequest = function(hostType) {
  return {
    connect: this._timeouts.connect * this._timeoutMultiplier,
    complete: this._timeouts[hostType] * this._timeoutMultiplier,
  };
};

function prepareHost(protocol) {
  return function prepare(host) {
    return protocol + '//' + host.toLowerCase();
  };
}

// Prototype.js < 1.7, a widely used library, defines a weird
// Array.prototype.toJSON function that will fail to stringify our content
// appropriately
// refs:
//   - https://groups.google.com/forum/#!topic/prototype-core/E-SAVvV_V9Q
//   - https://github.com/sstephenson/prototype/commit/038a2985a70593c1a86c230fadbdfe2e4898a48c
//   - http://stackoverflow.com/a/3148441/147079
function safeJSONStringify(obj) {
  /* eslint no-extend-native:0 */

  if (Array.prototype.toJSON === undefined) {
    return JSON.stringify(obj);
  }

  var toJSON = Array.prototype.toJSON;
  delete Array.prototype.toJSON;
  var out = JSON.stringify(obj);
  Array.prototype.toJSON = toJSON;

  return out;
}

function shuffle(array) {
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function removeCredentials(headers) {
  var newHeaders = {};

  for (var headerName in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, headerName)) {
      var value;

      if (
        headerName === 'x-clinia-api-key' ||
        headerName === 'x-clinia-application-id'
      ) {
        value = '**hidden for security purposes**';
      } else {
        value = headers[headerName];
      }

      newHeaders[headerName] = value;
    }
  }

  return newHeaders;
}

}).call(this,require('_process'))

},{"./IndexCore.js":17,"./argCheck.js":18,"./buildSearchMethod.js":22,"./clone":23,"./clone.js":23,"./errors":24,"./exitPromise.js":25,"./logger.js":26,"./map.js":27,"./store.js":29,"_process":11,"debug":2,"foreach":5,"isarray":9}],17:[function(require,module,exports){
var buildSearchMethod = require('./buildSearchMethod.js');

module.exports = IndexCore;

/*
 * Index class constructor.
 * You should not use this method directly but use initIndex() function
 */
function IndexCore(cliniasearch, indexName) {
  this.indexName = indexName;
  this.as = cliniasearch;
  this.typeAheadArgs = null;
  this.typeAheadValueOption = null;

  // make sure every index instance has it's own cache
  this.cache = {};
}

/*
 * Clear all queries in cache
 */
IndexCore.prototype.clearCache = function() {
  this.cache = {};
};

/**
 * Search inside the index using XMLHttpRequest request (Using a POST query to
 * minimize number of OPTIONS queries: Cross-Origin Resource Sharing).
 *
 * @param {object} [args] contains an object with query parameters
 * - TODO
 * @param {function} [callback] the result callback called with two arguments:
 *  error: null or Error('message'). If false, the content contains the error.
 *  content: the server answer that contains the list of results.
 */
IndexCore.prototype.search = buildSearchMethod(false)

IndexCore.prototype._search = function(params, url, callback, additionalUA) {
  // TODO : This is a workaround to simulate the different index endpoint.
  params.documentTypes = [this.indexName]
  var tempUrl = '/search/v1/search'
  // var realUrl = '/search/v1/'+this.indexName
  return this.as._jsonRequest({
    cache: this.cache,
    method: 'POST',
    url: url || tempUrl,
    body: params,
    hostType: 'read',
    fallback: {
      method: 'GET',
      url: url || tempUrl,
      body: params,
    },
    callback: callback,
    additionalUA: additionalUA,
  });
};

IndexCore.prototype.as = null;
IndexCore.prototype.indexName = null;
IndexCore.prototype.typeAheadArgs = null;
IndexCore.prototype.typeAheadValueOption = null;

},{"./buildSearchMethod.js":22}],18:[function(require,module,exports){
module.exports = {
  isNullOrUndefined,
  isNotNullOrUndefined,
  isEmpty
};

function isNullOrUndefined(arg) {
  return arg === undefined || arg === null
};

function isNotNullOrUndefined(arg) {
  return !isNullOrUndefined(arg)
};

function isEmpty(arg) {
  for(var key in arg) {
    if (key !== null && arg[key] !== undefined && arg.hasOwnProperty(key)) {
      return false
    }
  }
  return true
};
},{}],19:[function(require,module,exports){
(function (process){
'use strict';

var global = require('global');
var Promise = global.Promise || require('es6-promise').Promise;

// This is the standalone browser build entry point
// Browser implementation of the Clinia Search JavaScript client,
// using XMLHttpRequest, XDomainRequest and JSONP as fallback
module.exports = function createCliniasearch(CliniaSearch, uaSuffix) {
  var inherits = require('inherits');
  var errors = require('../errors');
  var inlineHeaders = require('./inline-headers');
  var jsonpRequest = require('./jsonp-request');
  var places = require('../places.js');
  uaSuffix = uaSuffix || '';

  if (process.env.NODE_ENV === 'debug') {
    require('debug').enable('cliniasearch*');
  }

  function cliniasearch(applicationID, apiKey, opts) {
    var cloneDeep = require('../clone.js');

    opts = cloneDeep(opts || {});

    opts._ua = opts._ua || cliniasearch.ua;

    return new CliniaSearchBrowser(applicationID, apiKey, opts);
  }

  cliniasearch.version = require('../version.js');

  cliniasearch.ua =
    'Clinia for JavaScript (' + cliniasearch.version + '); ' + uaSuffix;

  cliniasearch.initPlaces = places(cliniasearch);

  // we expose into window no matter how we are used, this will allow
  // us to easily debug any website running clinia
  global.__clinia = {
    debug: require('debug'),
    cliniasearch: cliniasearch,
  };

  var support = {
    hasXMLHttpRequest: 'XMLHttpRequest' in global,
    hasXDomainRequest: 'XDomainRequest' in global,
  };

  if (support.hasXMLHttpRequest) {
    support.cors = 'withCredentials' in new XMLHttpRequest();
  }

  function CliniaSearchBrowser() {
    // call CliniaSearch constructor
    CliniaSearch.apply(this, arguments);
  }

  inherits(CliniaSearchBrowser, CliniaSearch);

  CliniaSearchBrowser.prototype._request = function request(url, opts) {
    return new Promise(function wrapRequest(resolve, reject) {
      // no cors or XDomainRequest, no request
      if (!support.cors && !support.hasXDomainRequest) {
        // very old browser, not supported
        reject(new errors.Network('CORS not supported'));
        return;
      }

      url = inlineHeaders(url, opts.headers);

      var body = opts.body;
      var req = support.cors ? new XMLHttpRequest() : new XDomainRequest();
      var reqTimeout;
      var timedOut;
      var connected = false;

      reqTimeout = setTimeout(onTimeout, opts.timeouts.connect);
      // we set an empty onprogress listener
      // so that XDomainRequest on IE9 is not aborted
      // refs:
      //  - https://social.msdn.microsoft.com/Forums/ie/en-US/30ef3add-767c-4436-b8a9-f1ca19b4812e/ie9-rtm-xdomainrequest-issued-requests-may-abort-if-all-event-handlers-not-specified?forum=iewebdevelopment
      req.onprogress = onProgress;
      if ('onreadystatechange' in req)
        req.onreadystatechange = onReadyStateChange;
      req.onload = onLoad;
      req.onerror = onError;

      // do not rely on default XHR async flag, as some analytics code like hotjar
      // breaks it and set it to false by default
      if (req instanceof XMLHttpRequest) {
        req.open(opts.method, url, true);

        // The Analytics API never accepts Auth headers as query string
        // this option exists specifically for them.
        if (opts.forceAuthHeaders) {
          req.setRequestHeader(
            'x-clinia-application-id',
            opts.headers['x-clinia-application-id']
          );
          req.setRequestHeader(
            'x-clinia-api-key',
            opts.headers['x-clinia-api-key']
          );
        }
      } else {
        req.open(opts.method, url);
      }

      // headers are meant to be sent after open
      if (support.cors) {
        if (body) {
          if (opts.method === 'POST') {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests
            req.setRequestHeader(
              'content-type',
              'application/x-www-form-urlencoded'
            );

            body = 'params='+body
          } else {
            req.setRequestHeader('content-type', 'application/json');
          }
        }
        req.setRequestHeader('accept', 'application/json');
      }

      if (body) {
        req.send(body);
      } else {
        req.send();
      }

      // event object not received in IE8, at least
      // but we do not use it, still important to note
      function onLoad(/* event */) {
        // When browser does not supports req.timeout, we can
        // have both a load and timeout event, since handled by a dumb setTimeout
        if (timedOut) {
          return;
        }

        clearTimeout(reqTimeout);

        var out;

        try {
          out = {
            body: JSON.parse(req.responseText),
            responseText: req.responseText,
            statusCode: req.status,
            // XDomainRequest does not have any response headers
            headers:
              (req.getAllResponseHeaders && req.getAllResponseHeaders()) || {},
          };
        } catch (e) {
          out = new errors.UnparsableJSON({
            more: req.responseText,
          });
        }

        if (out instanceof errors.UnparsableJSON) {
          reject(out);
        } else {
          resolve(out);
        }
      }

      function onError(event) {
        if (timedOut) {
          return;
        }

        clearTimeout(reqTimeout);

        // error event is trigerred both with XDR/XHR on:
        //   - DNS error
        //   - unallowed cross domain request
        reject(
          new errors.Network({
            more: event,
          })
        );
      }

      function onTimeout() {
        timedOut = true;
        req.abort();

        reject(new errors.RequestTimeout());
      }

      function onConnect() {
        connected = true;
        clearTimeout(reqTimeout);
        reqTimeout = setTimeout(onTimeout, opts.timeouts.complete);
      }

      function onProgress() {
        if (!connected) onConnect();
      }

      function onReadyStateChange() {
        if (!connected && req.readyState > 1) onConnect();
      }
    });
  };

  CliniaSearchBrowser.prototype._request.fallback = function requestFallback(
    url,
    opts
  ) {
    url = inlineHeaders(url, opts.headers);

    return new Promise(function wrapJsonpRequest(resolve, reject) {
      jsonpRequest(url, opts, function jsonpRequestDone(err, content) {
        if (err) {
          reject(err);
          return;
        }

        resolve(content);
      });
    });
  };

  CliniaSearchBrowser.prototype._promise = {
    reject: function rejectPromise(val) {
      return Promise.reject(val);
    },
    resolve: function resolvePromise(val) {
      return Promise.resolve(val);
    },
    delay: function delayPromise(ms) {
      return new Promise(function resolveOnTimeout(resolve /* , reject*/) {
        setTimeout(resolve, ms);
      });
    },
    all: function all(promises) {
      return Promise.all(promises);
    },
  };

  return cliniasearch;
};

}).call(this,require('_process'))

},{"../clone.js":23,"../errors":24,"../places.js":28,"../version.js":30,"./inline-headers":20,"./jsonp-request":21,"_process":11,"debug":2,"es6-promise":4,"global":6,"inherits":7}],20:[function(require,module,exports){
'use strict';

module.exports = inlineHeaders;

var encode = require('querystring-es3/encode');

function inlineHeaders(url, headers) {
  if (/\?/.test(url)) {
    url += '&';
  } else {
    url += '?';
  }

  return url + encode(headers);
}

},{"querystring-es3/encode":13}],21:[function(require,module,exports){
'use strict';

module.exports = jsonpRequest;

var errors = require('../errors');

var JSONPCounter = 0;

function jsonpRequest(url, opts, cb) {
  if (opts.method !== 'GET') {
    cb(
      new Error(
        'Method ' + opts.method + ' ' + url + ' is not supported by JSONP.'
      )
    );
    return;
  }

  opts.debug('JSONP: start');

  var cbCalled = false;
  var timedOut = false;

  JSONPCounter += 1;
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  var cbName = 'cliniaJSONP_' + JSONPCounter;
  var done = false;

  window[cbName] = function(data) {
    removeGlobals();

    if (timedOut) {
      opts.debug('JSONP: Late answer, ignoring');
      return;
    }

    cbCalled = true;

    clean();

    cb(null, {
      body: data,
      responseText: JSON.stringify(
        data
      ) /* ,
      // We do not send the statusCode, there's no statusCode in JSONP, it will be
      // computed using data.status && data.message like with XDR
      statusCode*/,
    });
  };

  // add callback by hand
  url += '&callback=' + cbName;

  // add body params manually
  if (opts.jsonBody && opts.jsonBody.params) {
    url += '&' + opts.jsonBody.params;
  }

  var ontimeout = setTimeout(timeout, opts.timeouts.complete);

  // script onreadystatechange needed only for
  // <= IE8
  // https://github.com/angular/angular.js/issues/4523
  script.onreadystatechange = readystatechange;
  script.onload = success;
  script.onerror = error;

  script.async = true;
  script.defer = true;
  script.src = url;
  head.appendChild(script);

  function success() {
    opts.debug('JSONP: success');

    if (done || timedOut) {
      return;
    }

    done = true;

    // script loaded but did not call the fn => script loading error
    if (!cbCalled) {
      opts.debug('JSONP: Fail. Script loaded but did not call the callback');
      clean();
      cb(new errors.JSONPScriptFail());
    }
  }

  function readystatechange() {
    if (this.readyState === 'loaded' || this.readyState === 'complete') {
      success();
    }
  }

  function clean() {
    clearTimeout(ontimeout);
    script.onload = null;
    script.onreadystatechange = null;
    script.onerror = null;
    head.removeChild(script);
  }

  function removeGlobals() {
    try {
      delete window[cbName];
      delete window[cbName + '_loaded'];
    } catch (e) {
      window[cbName] = window[cbName + '_loaded'] = undefined;
    }
  }

  function timeout() {
    opts.debug('JSONP: Script timeout');
    timedOut = true;
    clean();
    cb(new errors.RequestTimeout());
  }

  function error() {
    opts.debug('JSONP: Script error');

    if (done || timedOut) {
      return;
    }

    clean();
    cb(new errors.JSONPScriptError());
  }
}

},{"../errors":24}],22:[function(require,module,exports){
module.exports = buildSearchMethod

var isArray = require('isArray');
var foreach = require('foreach')

/**
 * Creates a search method to be used in clients
 * @param {boolean} enableMutliIndexes if the search method should be bundled to handle multi indexes queries
 * @return {function} the search method
 */
function buildSearchMethod(enableMutliIndexes) {
  // Method reused in both implementations
  var buildParams = function(args, getSearchParams) {
    var params = {}
  
    if (args.query !== undefined) {
      params.q = args.query;
    }
  
    var additionalUA;
    if (args !== undefined) {
      if (args.additionalUA) {
        additionalUA = args.additionalUA;
        delete args.additionalUA;
      }
      // `_getSearchParams` will augment params
      params = getSearchParams(args, params)
    }
  
    return [params, additionalUA]
  }
  if (enableMutliIndexes) {
    /**
     * The search method. Prepares the data and send the merged queries to Clinia.
     * @param {object[]} queries search queries/parameters to send
     * @param {function} [callback] the callback to be called with the client gets the answer
     * @return {undefined|Promise} If the callback is not provided then this methods returns a Promise
     */
    return function search(queries, callback) {
      if (!isArray(queries)) {
        queries = [queries]
      }
      
      // Get the method from `this` before entering the foreach
      var getSearchParams = this.as._getSearchParams
      
      processedQueries = []
      foreach(queries, function(query) {
        var values = buildParams(query, getSearchParams)
        processedQueries.push(values[0])
        // TODO : What do we do with the additionalUA when we have mutiple queries?
      }) 

      return this._search(processedQueries, undefined, callback);
    };
  } else {
    /**
     * The search method. Prepares the data and send the query to Clinia.
     * @param {object} query search query/parameters to send
     * @param {function} [callback] the callback to be called with the client gets the answer
     * @return {undefined|Promise} If the callback is not provided then this methods returns a Promise
     */
    return function search(query, callback) {
      var values = buildParams(query, this.as._getSearchParams)
      return this._search(values[0], undefined, callback, values[1]);
    };
  }
}

},{"foreach":5,"isArray":8}],23:[function(require,module,exports){
module.exports = function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
};

},{}],24:[function(require,module,exports){
'use strict';

// This file hosts our error definitions
// We use custom error "types" so that we can act on them when we need it
// e.g.: if error instanceof errors.UnparsableJSON then..

var inherits = require('inherits');

function CliniaSearchError(message, extraProperties) {
  var forEach = require('foreach');

  var error = this;

  // try to get a stacktrace
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    error.stack =
      new Error().stack || 'Cannot get a stacktrace, browser is too old';
  }

  this.name = 'CliniaSearchError';
  this.message = message || 'Unknown error';

  if (extraProperties) {
    forEach(extraProperties, function addToErrorObject(value, key) {
      error[key] = value;
    });
  }
}

inherits(CliniaSearchError, Error);

function createCustomError(name, message) {
  function CliniaSearchCustomError() {
    var args = Array.prototype.slice.call(arguments, 0);

    // custom message not set, use default
    if (typeof args[0] !== 'string') {
      args.unshift(message);
    }

    CliniaSearchError.apply(this, args);
    this.name = 'CliniaSearchError' + name + 'Error';
  }

  inherits(CliniaSearchCustomError, CliniaSearchError);

  return CliniaSearchCustomError;
}

// late exports to let various fn defs and inherits take place
module.exports = {
  CliniaSearchError: CliniaSearchError,
  UnparsableJSON: createCustomError(
    'UnparsableJSON',
    'Could not parse the incoming response as JSON, see err.more for details'
  ),
  RequestTimeout: createCustomError(
    'RequestTimeout',
    'Request timed out before getting a response'
  ),
  Network: createCustomError(
    'Network',
    'Network issue, see err.more for details'
  ),
  JSONPScriptFail: createCustomError(
    'JSONPScriptFail',
    '<script> was loaded but did not call our provided callback'
  ),
  ValidUntilNotFound: createCustomError(
    'ValidUntilNotFound',
    'The SecuredAPIKey does not have a validUntil parameter.'
  ),
  JSONPScriptError: createCustomError(
    'JSONPScriptError',
    '<script> unable to load due to an `error` event on it'
  ),
  ObjectNotFound: createCustomError('ObjectNotFound', 'Object not found'),
  Unknown: createCustomError('Unknown', 'Unknown error occured'),
};

},{"foreach":5,"inherits":7}],25:[function(require,module,exports){
// Parse cloud does not supports setTimeout
// We do not store a setTimeout reference in the client everytime
// We only fallback to a fake setTimeout when not available
// setTimeout cannot be override globally sadly
module.exports = function exitPromise(fn, _setTimeout) {
  _setTimeout(fn, 0);
};

},{}],26:[function(require,module,exports){
module.exports = {
  error,
  warn,
  info,
  debug
}

function error(message) {
  console.error(message)
}

function warn(message) {
  console.warn(message)
}

function info(message) {
  console.info(message)
}

function debug(message) {
  console.debug(message)
}
},{}],27:[function(require,module,exports){
var foreach = require('foreach');

module.exports = function map(arr, fn) {
  var newArr = [];
  foreach(arr, function(item, itemIndex) {
    newArr.push(fn(item, itemIndex, arr));
  });
  return newArr;
};

},{"foreach":5}],28:[function(require,module,exports){
module.exports = createPlacesClient;

var qs3 = require('querystring-es3');
var buildSearchMethod = require('./buildSearchMethod.js');

// TODO
function createPlacesClient(cliniasearch) {}

},{"./buildSearchMethod.js":22,"querystring-es3":14}],29:[function(require,module,exports){
(function (global){
var debug = require('debug')('cliniasearch:src/hostIndexState.js');
var localStorageNamespace = 'cliniasearch-client-js';

var store;
var moduleStore = {
  state: {},
  set: function(key, data) {
    this.state[key] = data;
    return this.state[key];
  },
  get: function(key) {
    return this.state[key] || null;
  },
};

var localStorageStore = {
  set: function(key, data) {
    moduleStore.set(key, data); // always replicate localStorageStore to moduleStore in case of failure

    try {
      var namespace = JSON.parse(global.localStorage[localStorageNamespace]);
      namespace[key] = data;
      global.localStorage[localStorageNamespace] = JSON.stringify(namespace);
      return namespace[key];
    } catch (e) {
      return localStorageFailure(key, e);
    }
  },
  get: function(key) {
    try {
      return (
        JSON.parse(global.localStorage[localStorageNamespace])[key] || null
      );
    } catch (e) {
      return localStorageFailure(key, e);
    }
  },
};

function localStorageFailure(key, e) {
  debug('localStorage failed with', e);
  cleanup();
  store = moduleStore;
  return store.get(key);
}

store = supportsLocalStorage() ? localStorageStore : moduleStore;

module.exports = {
  get: getOrSet,
  set: getOrSet,
  supportsLocalStorage: supportsLocalStorage,
};

function getOrSet(key, data) {
  if (arguments.length === 1) {
    return store.get(key);
  }

  return store.set(key, data);
}

function supportsLocalStorage() {
  try {
    if ('localStorage' in global && global.localStorage !== null) {
      if (!global.localStorage[localStorageNamespace]) {
        // actual creation of the namespace
        global.localStorage.setItem(localStorageNamespace, JSON.stringify({}));
      }
      return true;
    }

    return false;
  } catch (_) {
    return false;
  }
}

// In case of any error on localStorage, we clean our own namespace, this should handle
// quota errors when a lot of keys + data are used
function cleanup() {
  try {
    global.localStorage.removeItem(localStorageNamespace);
  } catch (_) {
    // nothing to do
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"debug":2}],30:[function(require,module,exports){
'use strict';

module.exports = '1.0.0-beta.1';

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kZWJ1Zy9zcmMvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9kZWJ1Zy9zcmMvZGVidWcuanMiLCJub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9mb3JlYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9pc0FycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZGVjb2RlLmpzIiwibm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCJub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2luZGV4LmpzIiwic3JjL0NsaW5pYVNlYXJjaC5qcyIsInNyYy9DbGluaWFTZWFyY2hDb3JlLmpzIiwic3JjL0luZGV4Q29yZS5qcyIsInNyYy9hcmdDaGVjay5qcyIsInNyYy9icm93c2VyL2NyZWF0ZUNsaW5pYXNlYXJjaC5qcyIsInNyYy9icm93c2VyL2lubGluZS1oZWFkZXJzLmpzIiwic3JjL2Jyb3dzZXIvanNvbnAtcmVxdWVzdC5qcyIsInNyYy9idWlsZFNlYXJjaE1ldGhvZC5qcyIsInNyYy9jbG9uZS5qcyIsInNyYy9lcnJvcnMuanMiLCJzcmMvZXhpdFByb21pc2UuanMiLCJzcmMvbG9nZ2VyLmpzIiwic3JjL21hcC5qcyIsInNyYy9wbGFjZXMuanMiLCJzcmMvc3RvcmUuanMiLCJzcmMvdmVyc2lvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0cENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcDVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENsaW5pYVNlYXJjaCA9IHJlcXVpcmUoJy4uLy4uL0NsaW5pYVNlYXJjaC5qcycpO1xudmFyIGNyZWF0ZUNsaW5pYXNlYXJjaCA9IHJlcXVpcmUoJy4uL2NyZWF0ZUNsaW5pYXNlYXJjaC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUNsaW5pYXNlYXJjaChDbGluaWFTZWFyY2gsICdCcm93c2VyJyk7XG4iLCIvKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG5leHBvcnRzLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuZXhwb3J0cy5zYXZlID0gc2F2ZTtcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XG5leHBvcnRzLnVzZUNvbG9ycyA9IHVzZUNvbG9ycztcbmV4cG9ydHMuc3RvcmFnZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWVcbiAgICAgICAgICAgICAgICYmICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWUuc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgPyBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICAgICAgICAgICAgICAgICAgOiBsb2NhbHN0b3JhZ2UoKTtcblxuLyoqXG4gKiBDb2xvcnMuXG4gKi9cblxuZXhwb3J0cy5jb2xvcnMgPSBbXG4gICdsaWdodHNlYWdyZWVuJyxcbiAgJ2ZvcmVzdGdyZWVuJyxcbiAgJ2dvbGRlbnJvZCcsXG4gICdkb2RnZXJibHVlJyxcbiAgJ2RhcmtvcmNoaWQnLFxuICAnY3JpbXNvbidcbl07XG5cbi8qKlxuICogQ3VycmVudGx5IG9ubHkgV2ViS2l0LWJhc2VkIFdlYiBJbnNwZWN0b3JzLCBGaXJlZm94ID49IHYzMSxcbiAqIGFuZCB0aGUgRmlyZWJ1ZyBleHRlbnNpb24gKGFueSBGaXJlZm94IHZlcnNpb24pIGFyZSBrbm93blxuICogdG8gc3VwcG9ydCBcIiVjXCIgQ1NTIGN1c3RvbWl6YXRpb25zLlxuICpcbiAqIFRPRE86IGFkZCBhIGBsb2NhbFN0b3JhZ2VgIHZhcmlhYmxlIHRvIGV4cGxpY2l0bHkgZW5hYmxlL2Rpc2FibGUgY29sb3JzXG4gKi9cblxuZnVuY3Rpb24gdXNlQ29sb3JzKCkge1xuICAvLyBOQjogSW4gYW4gRWxlY3Ryb24gcHJlbG9hZCBzY3JpcHQsIGRvY3VtZW50IHdpbGwgYmUgZGVmaW5lZCBidXQgbm90IGZ1bGx5XG4gIC8vIGluaXRpYWxpemVkLiBTaW5jZSB3ZSBrbm93IHdlJ3JlIGluIENocm9tZSwgd2UnbGwganVzdCBkZXRlY3QgdGhpcyBjYXNlXG4gIC8vIGV4cGxpY2l0bHlcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wcm9jZXNzICYmIHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5XZWJraXRBcHBlYXJhbmNlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLmZpcmVidWcgfHwgKHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Z1snZGVmYXVsdCddID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLCBhbmQgbmFtZXMgdG8gc2tpcC5cbiAqL1xuXG5leHBvcnRzLm5hbWVzID0gW107XG5leHBvcnRzLnNraXBzID0gW107XG5cbi8qKlxuICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICpcbiAqIFZhbGlkIGtleSBuYW1lcyBhcmUgYSBzaW5nbGUsIGxvd2VyIG9yIHVwcGVyLWNhc2UgbGV0dGVyLCBpLmUuIFwiblwiIGFuZCBcIk5cIi5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMgPSB7fTtcblxuLyoqXG4gKiBQcmV2aW91cyBsb2cgdGltZXN0YW1wLlxuICovXG5cbnZhciBwcmV2VGltZTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlbGVjdENvbG9yKG5hbWVzcGFjZSkge1xuICB2YXIgaGFzaCA9IDAsIGk7XG5cbiAgZm9yIChpIGluIG5hbWVzcGFjZSkge1xuICAgIGhhc2ggID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBuYW1lc3BhY2UuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuY29sb3JzW01hdGguYWJzKGhhc2gpICUgZXhwb3J0cy5jb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZXNwYWNlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlRGVidWcobmFtZXNwYWNlKSB7XG5cbiAgZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgLy8gZGlzYWJsZWQ/XG4gICAgaWYgKCFkZWJ1Zy5lbmFibGVkKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IGRlYnVnO1xuXG4gICAgLy8gc2V0IGBkaWZmYCB0aW1lc3RhbXBcbiAgICB2YXIgY3VyciA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldlRpbWUgfHwgY3Vycik7XG4gICAgc2VsZi5kaWZmID0gbXM7XG4gICAgc2VsZi5wcmV2ID0gcHJldlRpbWU7XG4gICAgc2VsZi5jdXJyID0gY3VycjtcbiAgICBwcmV2VGltZSA9IGN1cnI7XG5cbiAgICAvLyB0dXJuIHRoZSBgYXJndW1lbnRzYCBpbnRvIGEgcHJvcGVyIEFycmF5XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGFyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtcblxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0pIHtcbiAgICAgIC8vIGFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVPXG4gICAgICBhcmdzLnVuc2hpZnQoJyVPJyk7XG4gICAgfVxuXG4gICAgLy8gYXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EtekEtWiVdKS9nLCBmdW5jdGlvbihtYXRjaCwgZm9ybWF0KSB7XG4gICAgICAvLyBpZiB3ZSBlbmNvdW50ZXIgYW4gZXNjYXBlZCAlIHRoZW4gZG9uJ3QgaW5jcmVhc2UgdGhlIGFycmF5IGluZGV4XG4gICAgICBpZiAobWF0Y2ggPT09ICclJScpIHJldHVybiBtYXRjaDtcbiAgICAgIGluZGV4Kys7XG4gICAgICB2YXIgZm9ybWF0dGVyID0gZXhwb3J0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07XG4gICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZvcm1hdHRlcikge1xuICAgICAgICB2YXIgdmFsID0gYXJnc1tpbmRleF07XG4gICAgICAgIG1hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsKTtcblxuICAgICAgICAvLyBub3cgd2UgbmVlZCB0byByZW1vdmUgYGFyZ3NbaW5kZXhdYCBzaW5jZSBpdCdzIGlubGluZWQgaW4gdGhlIGBmb3JtYXRgXG4gICAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcblxuICAgIC8vIGFwcGx5IGVudi1zcGVjaWZpYyBmb3JtYXR0aW5nIChjb2xvcnMsIGV0Yy4pXG4gICAgZXhwb3J0cy5mb3JtYXRBcmdzLmNhbGwoc2VsZiwgYXJncyk7XG5cbiAgICB2YXIgbG9nRm4gPSBkZWJ1Zy5sb2cgfHwgZXhwb3J0cy5sb2cgfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtcbiAgICBsb2dGbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuXG4gIGRlYnVnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgZGVidWcuZW5hYmxlZCA9IGV4cG9ydHMuZW5hYmxlZChuYW1lc3BhY2UpO1xuICBkZWJ1Zy51c2VDb2xvcnMgPSBleHBvcnRzLnVzZUNvbG9ycygpO1xuICBkZWJ1Zy5jb2xvciA9IHNlbGVjdENvbG9yKG5hbWVzcGFjZSk7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcbiAgZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO1xuXG4gIGV4cG9ydHMubmFtZXMgPSBbXTtcbiAgZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4gIHZhciBzcGxpdCA9ICh0eXBlb2YgbmFtZXNwYWNlcyA9PT0gJ3N0cmluZycgPyBuYW1lc3BhY2VzIDogJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gIHZhciBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICghc3BsaXRbaV0pIGNvbnRpbnVlOyAvLyBpZ25vcmUgZW1wdHkgc3RyaW5nc1xuICAgIG5hbWVzcGFjZXMgPSBzcGxpdFtpXS5yZXBsYWNlKC9cXCovZywgJy4qPycpO1xuICAgIGlmIChuYW1lc3BhY2VzWzBdID09PSAnLScpIHtcbiAgICAgIGV4cG9ydHMuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMgKyAnJCcpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNhYmxlIGRlYnVnIG91dHB1dC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gIGV4cG9ydHMuZW5hYmxlKCcnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGVuYWJsZWQobmFtZSkge1xuICB2YXIgaSwgbGVuO1xuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLm5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMubmFtZXNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuIiwiLyohXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3N0ZWZhbnBlbm5lci9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICB2NC4yLjgrMWU2OGRjZTZcbiAqL1xuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwuRVM2UHJvbWlzZSA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHg7XG4gIHJldHVybiB4ICE9PSBudWxsICYmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnZnVuY3Rpb24nKTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuXG5cbnZhciBfaXNBcnJheSA9IHZvaWQgMDtcbmlmIChBcnJheS5pc0FycmF5KSB7XG4gIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbn0gZWxzZSB7XG4gIF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xufVxuXG52YXIgaXNBcnJheSA9IF9pc0FycmF5O1xuXG52YXIgbGVuID0gMDtcbnZhciB2ZXJ0eE5leHQgPSB2b2lkIDA7XG52YXIgY3VzdG9tU2NoZWR1bGVyRm4gPSB2b2lkIDA7XG5cbnZhciBhc2FwID0gZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gIHF1ZXVlW2xlbl0gPSBjYWxsYmFjaztcbiAgcXVldWVbbGVuICsgMV0gPSBhcmc7XG4gIGxlbiArPSAyO1xuICBpZiAobGVuID09PSAyKSB7XG4gICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgLy8gd2lsbCBiZSBwcm9jZXNzZWQgYnkgdGhpcyBmbHVzaCB0aGF0IHdlIGFyZSBzY2hlZHVsaW5nLlxuICAgIGlmIChjdXN0b21TY2hlZHVsZXJGbikge1xuICAgICAgY3VzdG9tU2NoZWR1bGVyRm4oZmx1c2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzY2hlZHVsZUZsdXNoKCk7XG4gICAgfVxuICB9XG59O1xuXG5mdW5jdGlvbiBzZXRTY2hlZHVsZXIoc2NoZWR1bGVGbikge1xuICBjdXN0b21TY2hlZHVsZXJGbiA9IHNjaGVkdWxlRm47XG59XG5cbmZ1bmN0aW9uIHNldEFzYXAoYXNhcEZuKSB7XG4gIGFzYXAgPSBhc2FwRm47XG59XG5cbnZhciBicm93c2VyV2luZG93ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB1bmRlZmluZWQ7XG52YXIgYnJvd3Nlckdsb2JhbCA9IGJyb3dzZXJXaW5kb3cgfHwge307XG52YXIgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSBicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xudmFyIGlzTm9kZSA9IHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nO1xuXG4vLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxudmFyIGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcblxuLy8gbm9kZVxuZnVuY3Rpb24gdXNlTmV4dFRpY2soKSB7XG4gIC8vIG5vZGUgdmVyc2lvbiAwLjEwLnggZGlzcGxheXMgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHdoZW4gbmV4dFRpY2sgaXMgdXNlZCByZWN1cnNpdmVseVxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2N1am9qcy93aGVuL2lzc3Vlcy80MTAgZm9yIGRldGFpbHNcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gIH07XG59XG5cbi8vIHZlcnR4XG5mdW5jdGlvbiB1c2VWZXJ0eFRpbWVyKCkge1xuICBpZiAodHlwZW9mIHZlcnR4TmV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmVydHhOZXh0KGZsdXNoKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHVzZVNldFRpbWVvdXQoKTtcbn1cblxuZnVuY3Rpb24gdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICB2YXIgb2JzZXJ2ZXIgPSBuZXcgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIoZmx1c2gpO1xuICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBub2RlLmRhdGEgPSBpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMjtcbiAgfTtcbn1cblxuLy8gd2ViIHdvcmtlclxuZnVuY3Rpb24gdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZmx1c2g7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHVzZVNldFRpbWVvdXQoKSB7XG4gIC8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIGVzNi1wcm9taXNlIHdpbGwgYmUgdW5hZmZlY3RlZCBieVxuICAvLyBvdGhlciBjb2RlIG1vZGlmeWluZyBzZXRUaW1lb3V0IChsaWtlIHNpbm9uLnVzZUZha2VUaW1lcnMoKSlcbiAgdmFyIGdsb2JhbFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnbG9iYWxTZXRUaW1lb3V0KGZsdXNoLCAxKTtcbiAgfTtcbn1cblxudmFyIHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuZnVuY3Rpb24gZmx1c2goKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBxdWV1ZVtpXTtcbiAgICB2YXIgYXJnID0gcXVldWVbaSArIDFdO1xuXG4gICAgY2FsbGJhY2soYXJnKTtcblxuICAgIHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgIHF1ZXVlW2kgKyAxXSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGxlbiA9IDA7XG59XG5cbmZ1bmN0aW9uIGF0dGVtcHRWZXJ0eCgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgdmVydHggPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpLnJlcXVpcmUoJ3ZlcnR4Jyk7XG4gICAgdmVydHhOZXh0ID0gdmVydHgucnVuT25Mb29wIHx8IHZlcnR4LnJ1bk9uQ29udGV4dDtcbiAgICByZXR1cm4gdXNlVmVydHhUaW1lcigpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHVzZVNldFRpbWVvdXQoKTtcbiAgfVxufVxuXG52YXIgc2NoZWR1bGVGbHVzaCA9IHZvaWQgMDtcbi8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG5pZiAoaXNOb2RlKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xufSBlbHNlIGlmIChCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTXV0YXRpb25PYnNlcnZlcigpO1xufSBlbHNlIGlmIChpc1dvcmtlcikge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTWVzc2FnZUNoYW5uZWwoKTtcbn0gZWxzZSBpZiAoYnJvd3NlcldpbmRvdyA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gIHNjaGVkdWxlRmx1c2ggPSBhdHRlbXB0VmVydHgoKTtcbn0gZWxzZSB7XG4gIHNjaGVkdWxlRmx1c2ggPSB1c2VTZXRUaW1lb3V0KCk7XG59XG5cbmZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgdmFyIHBhcmVudCA9IHRoaXM7XG5cbiAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3Iobm9vcCk7XG5cbiAgaWYgKGNoaWxkW1BST01JU0VfSURdID09PSB1bmRlZmluZWQpIHtcbiAgICBtYWtlUHJvbWlzZShjaGlsZCk7XG4gIH1cblxuICB2YXIgX3N0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuXG4gIGlmIChfc3RhdGUpIHtcbiAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbX3N0YXRlIC0gMV07XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW52b2tlQ2FsbGJhY2soX3N0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHBhcmVudC5fcmVzdWx0KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICB9XG5cbiAgcmV0dXJuIGNoaWxkO1xufVxuXG4vKipcbiAgYFByb21pc2UucmVzb2x2ZWAgcmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlY29tZSByZXNvbHZlZCB3aXRoIHRoZVxuICBwYXNzZWQgYHZhbHVlYC4gSXQgaXMgc2hvcnRoYW5kIGZvciB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHJlc29sdmUoMSk7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKDEpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gdmFsdWUgPT09IDFcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgcmVzb2x2ZVxuICBAc3RhdGljXG4gIEBwYXJhbSB7QW55fSB2YWx1ZSB2YWx1ZSB0aGF0IHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aFxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIGZ1bGZpbGxlZCB3aXRoIHRoZSBnaXZlblxuICBgdmFsdWVgXG4qL1xuZnVuY3Rpb24gcmVzb2x2ZSQxKG9iamVjdCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcbiAgcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICByZXR1cm4gcHJvbWlzZTtcbn1cblxudmFyIFBST01JU0VfSUQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMik7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG52YXIgUEVORElORyA9IHZvaWQgMDtcbnZhciBGVUxGSUxMRUQgPSAxO1xudmFyIFJFSkVDVEVEID0gMjtcblxuZnVuY3Rpb24gc2VsZkZ1bGZpbGxtZW50KCkge1xuICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIik7XG59XG5cbmZ1bmN0aW9uIGNhbm5vdFJldHVybk93bigpIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS4nKTtcbn1cblxuZnVuY3Rpb24gdHJ5VGhlbih0aGVuJCQxLCB2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKSB7XG4gIHRyeSB7XG4gICAgdGhlbiQkMS5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlLCB0aGVuJCQxKSB7XG4gIGFzYXAoZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICB2YXIgc2VhbGVkID0gZmFsc2U7XG4gICAgdmFyIGVycm9yID0gdHJ5VGhlbih0aGVuJCQxLCB0aGVuYWJsZSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoc2VhbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgaWYgKHNlYWxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWFsZWQgPSB0cnVlO1xuXG4gICAgICByZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICB9LCAnU2V0dGxlOiAnICsgKHByb21pc2UuX2xhYmVsIHx8ICcgdW5rbm93biBwcm9taXNlJykpO1xuXG4gICAgaWYgKCFzZWFsZWQgJiYgZXJyb3IpIHtcbiAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgIH1cbiAgfSwgcHJvbWlzZSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlKSB7XG4gIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IEZVTEZJTExFRCkge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gIH0gZWxzZSBpZiAodGhlbmFibGUuX3N0YXRlID09PSBSRUpFQ1RFRCkge1xuICAgIHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgfSBlbHNlIHtcbiAgICBzdWJzY3JpYmUodGhlbmFibGUsIHVuZGVmaW5lZCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgcmV0dXJuIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbiQkMSkge1xuICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3RvciAmJiB0aGVuJCQxID09PSB0aGVuICYmIG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IucmVzb2x2ZSA9PT0gcmVzb2x2ZSQxKSB7XG4gICAgaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRoZW4kJDEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odGhlbiQkMSkpIHtcbiAgICAgIGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuJCQxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICByZWplY3QocHJvbWlzZSwgc2VsZkZ1bGZpbGxtZW50KCkpO1xuICB9IGVsc2UgaWYgKG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIHRoZW4kJDEgPSB2b2lkIDA7XG4gICAgdHJ5IHtcbiAgICAgIHRoZW4kJDEgPSB2YWx1ZS50aGVuO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlLCB0aGVuJCQxKTtcbiAgfSBlbHNlIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gIH1cblxuICBwdWJsaXNoKHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICBwcm9taXNlLl9zdGF0ZSA9IEZVTEZJTExFRDtcblxuICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwcm9taXNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuICBwcm9taXNlLl9zdGF0ZSA9IFJFSkVDVEVEO1xuICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgYXNhcChwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBfc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICB2YXIgbGVuZ3RoID0gX3N1YnNjcmliZXJzLmxlbmd0aDtcblxuXG4gIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgX3N1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgX3N1YnNjcmliZXJzW2xlbmd0aCArIEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICBfc3Vic2NyaWJlcnNbbGVuZ3RoICsgUkVKRUNURURdID0gb25SZWplY3Rpb247XG5cbiAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwYXJlbnQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2gocHJvbWlzZSkge1xuICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNoaWxkID0gdm9pZCAwLFxuICAgICAgY2FsbGJhY2sgPSB2b2lkIDAsXG4gICAgICBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICBpZiAoY2hpbGQpIHtcbiAgICAgIGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICB9XG4gIH1cblxuICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xufVxuXG5mdW5jdGlvbiBpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gIHZhciBoYXNDYWxsYmFjayA9IGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgdmFsdWUgPSB2b2lkIDAsXG4gICAgICBlcnJvciA9IHZvaWQgMCxcbiAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG5cbiAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhbHVlID0gY2FsbGJhY2soZGV0YWlsKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzdWNjZWVkZWQgPSBmYWxzZTtcbiAgICAgIGVycm9yID0gZTtcbiAgICB9XG5cbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCBjYW5ub3RSZXR1cm5Pd24oKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gZGV0YWlsO1xuICB9XG5cbiAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgLy8gbm9vcFxuICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKHN1Y2NlZWRlZCA9PT0gZmFsc2UpIHtcbiAgICByZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IEZVTEZJTExFRCkge1xuICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IFJFSkVDVEVEKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICB0cnkge1xuICAgIHJlc29sdmVyKGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbHVlKSB7XG4gICAgICByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZWplY3QocHJvbWlzZSwgZSk7XG4gIH1cbn1cblxudmFyIGlkID0gMDtcbmZ1bmN0aW9uIG5leHRJZCgpIHtcbiAgcmV0dXJuIGlkKys7XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKHByb21pc2UpIHtcbiAgcHJvbWlzZVtQUk9NSVNFX0lEXSA9IGlkKys7XG4gIHByb21pc2UuX3N0YXRlID0gdW5kZWZpbmVkO1xuICBwcm9taXNlLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gIHByb21pc2UuX3N1YnNjcmliZXJzID0gW107XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRpb25FcnJvcigpIHtcbiAgcmV0dXJuIG5ldyBFcnJvcignQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5Jyk7XG59XG5cbnZhciBFbnVtZXJhdG9yID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCkge1xuICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG5cbiAgICBpZiAoIXRoaXMucHJvbWlzZVtQUk9NSVNFX0lEXSkge1xuICAgICAgbWFrZVByb21pc2UodGhpcy5wcm9taXNlKTtcbiAgICB9XG5cbiAgICBpZiAoaXNBcnJheShpbnB1dCkpIHtcbiAgICAgIHRoaXMubGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAgICAgdGhpcy5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuXG4gICAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDA7XG4gICAgICAgIHRoaXMuX2VudW1lcmF0ZShpbnB1dCk7XG4gICAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICBmdWxmaWxsKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZWplY3QodGhpcy5wcm9taXNlLCB2YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgfVxuICB9XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uIF9lbnVtZXJhdGUoaW5wdXQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgdGhpcy5fc3RhdGUgPT09IFBFTkRJTkcgJiYgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgIH1cbiAgfTtcblxuICBFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24gX2VhY2hFbnRyeShlbnRyeSwgaSkge1xuICAgIHZhciBjID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcbiAgICB2YXIgcmVzb2x2ZSQkMSA9IGMucmVzb2x2ZTtcblxuXG4gICAgaWYgKHJlc29sdmUkJDEgPT09IHJlc29sdmUkMSkge1xuICAgICAgdmFyIF90aGVuID0gdm9pZCAwO1xuICAgICAgdmFyIGVycm9yID0gdm9pZCAwO1xuICAgICAgdmFyIGRpZEVycm9yID0gZmFsc2U7XG4gICAgICB0cnkge1xuICAgICAgICBfdGhlbiA9IGVudHJ5LnRoZW47XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGRpZEVycm9yID0gdHJ1ZTtcbiAgICAgICAgZXJyb3IgPSBlO1xuICAgICAgfVxuXG4gICAgICBpZiAoX3RoZW4gPT09IHRoZW4gJiYgZW50cnkuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgX3RoZW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IGVudHJ5O1xuICAgICAgfSBlbHNlIGlmIChjID09PSBQcm9taXNlJDEpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgYyhub29wKTtcbiAgICAgICAgaWYgKGRpZEVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIGVudHJ5LCBfdGhlbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHByb21pc2UsIGkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KG5ldyBjKGZ1bmN0aW9uIChyZXNvbHZlJCQxKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUkJDEoZW50cnkpO1xuICAgICAgICB9KSwgaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChyZXNvbHZlJCQxKGVudHJ5KSwgaSk7XG4gICAgfVxuICB9O1xuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbiBfc2V0dGxlZEF0KHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcy5wcm9taXNlO1xuXG5cbiAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09IFBFTkRJTkcpIHtcbiAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuXG4gICAgICBpZiAoc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgICAgIHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICBmdWxmaWxsKHByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgfVxuICB9O1xuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbiBfd2lsbFNldHRsZUF0KHByb21pc2UsIGkpIHtcbiAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICBzdWJzY3JpYmUocHJvbWlzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgcmV0dXJuIGVudW1lcmF0b3IuX3NldHRsZWRBdChSRUpFQ1RFRCwgaSwgcmVhc29uKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gRW51bWVyYXRvcjtcbn0oKTtcblxuLyoqXG4gIGBQcm9taXNlLmFsbGAgYWNjZXB0cyBhbiBhcnJheSBvZiBwcm9taXNlcywgYW5kIHJldHVybnMgYSBuZXcgcHJvbWlzZSB3aGljaFxuICBpcyBmdWxmaWxsZWQgd2l0aCBhbiBhcnJheSBvZiBmdWxmaWxsbWVudCB2YWx1ZXMgZm9yIHRoZSBwYXNzZWQgcHJvbWlzZXMsIG9yXG4gIHJlamVjdGVkIHdpdGggdGhlIHJlYXNvbiBvZiB0aGUgZmlyc3QgcGFzc2VkIHByb21pc2UgdG8gYmUgcmVqZWN0ZWQuIEl0IGNhc3RzIGFsbFxuICBlbGVtZW50cyBvZiB0aGUgcGFzc2VkIGl0ZXJhYmxlIHRvIHByb21pc2VzIGFzIGl0IHJ1bnMgdGhpcyBhbGdvcml0aG0uXG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IHJlc29sdmUoMSk7XG4gIGxldCBwcm9taXNlMiA9IHJlc29sdmUoMik7XG4gIGxldCBwcm9taXNlMyA9IHJlc29sdmUoMyk7XG4gIGxldCBwcm9taXNlcyA9IFsgcHJvbWlzZTEsIHByb21pc2UyLCBwcm9taXNlMyBdO1xuXG4gIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyBUaGUgYXJyYXkgaGVyZSB3b3VsZCBiZSBbIDEsIDIsIDMgXTtcbiAgfSk7XG4gIGBgYFxuXG4gIElmIGFueSBvZiB0aGUgYHByb21pc2VzYCBnaXZlbiB0byBgYWxsYCBhcmUgcmVqZWN0ZWQsIHRoZSBmaXJzdCBwcm9taXNlXG4gIHRoYXQgaXMgcmVqZWN0ZWQgd2lsbCBiZSBnaXZlbiBhcyBhbiBhcmd1bWVudCB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZXMnc1xuICByZWplY3Rpb24gaGFuZGxlci4gRm9yIGV4YW1wbGU6XG5cbiAgRXhhbXBsZTpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IHJlc29sdmUoMSk7XG4gIGxldCBwcm9taXNlMiA9IHJlamVjdChuZXcgRXJyb3IoXCIyXCIpKTtcbiAgbGV0IHByb21pc2UzID0gcmVqZWN0KG5ldyBFcnJvcihcIjNcIikpO1xuICBsZXQgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihhcnJheSl7XG4gICAgLy8gQ29kZSBoZXJlIG5ldmVyIHJ1bnMgYmVjYXVzZSB0aGVyZSBhcmUgcmVqZWN0ZWQgcHJvbWlzZXMhXG4gIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgLy8gZXJyb3IubWVzc2FnZSA9PT0gXCIyXCJcbiAgfSk7XG4gIGBgYFxuXG4gIEBtZXRob2QgYWxsXG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBcnJheX0gZW50cmllcyBhcnJheSBvZiBwcm9taXNlc1xuICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gYWxsIGBwcm9taXNlc2AgaGF2ZSBiZWVuXG4gIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQgaWYgYW55IG9mIHRoZW0gYmVjb21lIHJlamVjdGVkLlxuICBAc3RhdGljXG4qL1xuZnVuY3Rpb24gYWxsKGVudHJpZXMpIHtcbiAgcmV0dXJuIG5ldyBFbnVtZXJhdG9yKHRoaXMsIGVudHJpZXMpLnByb21pc2U7XG59XG5cbi8qKlxuICBgUHJvbWlzZS5yYWNlYCByZXR1cm5zIGEgbmV3IHByb21pc2Ugd2hpY2ggaXMgc2V0dGxlZCBpbiB0aGUgc2FtZSB3YXkgYXMgdGhlXG4gIGZpcnN0IHBhc3NlZCBwcm9taXNlIHRvIHNldHRsZS5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXNvbHZlKCdwcm9taXNlIDEnKTtcbiAgICB9LCAyMDApO1xuICB9KTtcblxuICBsZXQgcHJvbWlzZTIgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMicpO1xuICAgIH0sIDEwMCk7XG4gIH0pO1xuXG4gIFByb21pc2UucmFjZShbcHJvbWlzZTEsIHByb21pc2UyXSkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIHJlc3VsdCA9PT0gJ3Byb21pc2UgMicgYmVjYXVzZSBpdCB3YXMgcmVzb2x2ZWQgYmVmb3JlIHByb21pc2UxXG4gICAgLy8gd2FzIHJlc29sdmVkLlxuICB9KTtcbiAgYGBgXG5cbiAgYFByb21pc2UucmFjZWAgaXMgZGV0ZXJtaW5pc3RpYyBpbiB0aGF0IG9ubHkgdGhlIHN0YXRlIG9mIHRoZSBmaXJzdFxuICBzZXR0bGVkIHByb21pc2UgbWF0dGVycy4gRm9yIGV4YW1wbGUsIGV2ZW4gaWYgb3RoZXIgcHJvbWlzZXMgZ2l2ZW4gdG8gdGhlXG4gIGBwcm9taXNlc2AgYXJyYXkgYXJndW1lbnQgYXJlIHJlc29sdmVkLCBidXQgdGhlIGZpcnN0IHNldHRsZWQgcHJvbWlzZSBoYXNcbiAgYmVjb21lIHJlamVjdGVkIGJlZm9yZSB0aGUgb3RoZXIgcHJvbWlzZXMgYmVjYW1lIGZ1bGZpbGxlZCwgdGhlIHJldHVybmVkXG4gIHByb21pc2Ugd2lsbCBiZWNvbWUgcmVqZWN0ZWQ6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMScpO1xuICAgIH0sIDIwMCk7XG4gIH0pO1xuXG4gIGxldCBwcm9taXNlMiA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcigncHJvbWlzZSAyJykpO1xuICAgIH0sIDEwMCk7XG4gIH0pO1xuXG4gIFByb21pc2UucmFjZShbcHJvbWlzZTEsIHByb21pc2UyXSkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIENvZGUgaGVyZSBuZXZlciBydW5zXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdwcm9taXNlIDInIGJlY2F1c2UgcHJvbWlzZSAyIGJlY2FtZSByZWplY3RlZCBiZWZvcmVcbiAgICAvLyBwcm9taXNlIDEgYmVjYW1lIGZ1bGZpbGxlZFxuICB9KTtcbiAgYGBgXG5cbiAgQW4gZXhhbXBsZSByZWFsLXdvcmxkIHVzZSBjYXNlIGlzIGltcGxlbWVudGluZyB0aW1lb3V0czpcblxuICBgYGBqYXZhc2NyaXB0XG4gIFByb21pc2UucmFjZShbYWpheCgnZm9vLmpzb24nKSwgdGltZW91dCg1MDAwKV0pXG4gIGBgYFxuXG4gIEBtZXRob2QgcmFjZVxuICBAc3RhdGljXG4gIEBwYXJhbSB7QXJyYXl9IHByb21pc2VzIGFycmF5IG9mIHByb21pc2VzIHRvIG9ic2VydmVcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2Ugd2hpY2ggc2V0dGxlcyBpbiB0aGUgc2FtZSB3YXkgYXMgdGhlIGZpcnN0IHBhc3NlZFxuICBwcm9taXNlIHRvIHNldHRsZS5cbiovXG5mdW5jdGlvbiByYWNlKGVudHJpZXMpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICBpZiAoIWlzQXJyYXkoZW50cmllcykpIHtcbiAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIChfLCByZWplY3QpIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLicpKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBsZW5ndGggPSBlbnRyaWVzLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgQ29uc3RydWN0b3IucmVzb2x2ZShlbnRyaWVzW2ldKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gIGBQcm9taXNlLnJlamVjdGAgcmV0dXJucyBhIHByb21pc2UgcmVqZWN0ZWQgd2l0aCB0aGUgcGFzc2VkIGByZWFzb25gLlxuICBJdCBpcyBzaG9ydGhhbmQgZm9yIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgcmVqZWN0KG5ldyBFcnJvcignV0hPT1BTJykpO1xuICB9KTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIENvZGUgaGVyZSBkb2Vzbid0IHJ1biBiZWNhdXNlIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIVxuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHJlYXNvbi5tZXNzYWdlID09PSAnV0hPT1BTJ1xuICB9KTtcbiAgYGBgXG5cbiAgSW5zdGVhZCBvZiB3cml0aW5nIHRoZSBhYm92ZSwgeW91ciBjb2RlIG5vdyBzaW1wbHkgYmVjb21lcyB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1dIT09QUycpKTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIENvZGUgaGVyZSBkb2Vzbid0IHJ1biBiZWNhdXNlIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIVxuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHJlYXNvbi5tZXNzYWdlID09PSAnV0hPT1BTJ1xuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCByZWplY3RcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FueX0gcmVhc29uIHZhbHVlIHRoYXQgdGhlIHJldHVybmVkIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSByZWplY3RlZCB3aXRoIHRoZSBnaXZlbiBgcmVhc29uYC5cbiovXG5mdW5jdGlvbiByZWplY3QkMShyZWFzb24pIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG4gIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gbmVlZHNSZXNvbHZlcigpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xufVxuXG5mdW5jdGlvbiBuZWVkc05ldygpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbn1cblxuLyoqXG4gIFByb21pc2Ugb2JqZWN0cyByZXByZXNlbnQgdGhlIGV2ZW50dWFsIHJlc3VsdCBvZiBhbiBhc3luY2hyb25vdXMgb3BlcmF0aW9uLiBUaGVcbiAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGUgcmVhc29uXG4gIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gIFRlcm1pbm9sb2d5XG4gIC0tLS0tLS0tLS0tXG5cbiAgLSBgcHJvbWlzZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHdpdGggYSBgdGhlbmAgbWV0aG9kIHdob3NlIGJlaGF2aW9yIGNvbmZvcm1zIHRvIHRoaXMgc3BlY2lmaWNhdGlvbi5cbiAgLSBgdGhlbmFibGVgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBgdGhlbmAgbWV0aG9kLlxuICAtIGB2YWx1ZWAgaXMgYW55IGxlZ2FsIEphdmFTY3JpcHQgdmFsdWUgKGluY2x1ZGluZyB1bmRlZmluZWQsIGEgdGhlbmFibGUsIG9yIGEgcHJvbWlzZSkuXG4gIC0gYGV4Y2VwdGlvbmAgaXMgYSB2YWx1ZSB0aGF0IGlzIHRocm93biB1c2luZyB0aGUgdGhyb3cgc3RhdGVtZW50LlxuICAtIGByZWFzb25gIGlzIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2h5IGEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gIC0gYHNldHRsZWRgIHRoZSBmaW5hbCByZXN0aW5nIHN0YXRlIG9mIGEgcHJvbWlzZSwgZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuXG4gIEEgcHJvbWlzZSBjYW4gYmUgaW4gb25lIG9mIHRocmVlIHN0YXRlczogcGVuZGluZywgZnVsZmlsbGVkLCBvciByZWplY3RlZC5cblxuICBQcm9taXNlcyB0aGF0IGFyZSBmdWxmaWxsZWQgaGF2ZSBhIGZ1bGZpbGxtZW50IHZhbHVlIGFuZCBhcmUgaW4gdGhlIGZ1bGZpbGxlZFxuICBzdGF0ZS4gIFByb21pc2VzIHRoYXQgYXJlIHJlamVjdGVkIGhhdmUgYSByZWplY3Rpb24gcmVhc29uIGFuZCBhcmUgaW4gdGhlXG4gIHJlamVjdGVkIHN0YXRlLiAgQSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZXZlciBhIHRoZW5hYmxlLlxuXG4gIFByb21pc2VzIGNhbiBhbHNvIGJlIHNhaWQgdG8gKnJlc29sdmUqIGEgdmFsdWUuICBJZiB0aGlzIHZhbHVlIGlzIGFsc28gYVxuICBwcm9taXNlLCB0aGVuIHRoZSBvcmlnaW5hbCBwcm9taXNlJ3Mgc2V0dGxlZCBzdGF0ZSB3aWxsIG1hdGNoIHRoZSB2YWx1ZSdzXG4gIHNldHRsZWQgc3RhdGUuICBTbyBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IHJlamVjdHMgd2lsbFxuICBpdHNlbGYgcmVqZWN0LCBhbmQgYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCBmdWxmaWxscyB3aWxsXG4gIGl0c2VsZiBmdWxmaWxsLlxuXG5cbiAgQmFzaWMgVXNhZ2U6XG4gIC0tLS0tLS0tLS0tLVxuXG4gIGBgYGpzXG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgLy8gb24gc3VjY2Vzc1xuICAgIHJlc29sdmUodmFsdWUpO1xuXG4gICAgLy8gb24gZmFpbHVyZVxuICAgIHJlamVjdChyZWFzb24pO1xuICB9KTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAvLyBvbiBmdWxmaWxsbWVudFxuICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAvLyBvbiByZWplY3Rpb25cbiAgfSk7XG4gIGBgYFxuXG4gIEFkdmFuY2VkIFVzYWdlOlxuICAtLS0tLS0tLS0tLS0tLS1cblxuICBQcm9taXNlcyBzaGluZSB3aGVuIGFic3RyYWN0aW5nIGF3YXkgYXN5bmNocm9ub3VzIGludGVyYWN0aW9ucyBzdWNoIGFzXG4gIGBYTUxIdHRwUmVxdWVzdGBzLlxuXG4gIGBgYGpzXG4gIGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGhhbmRsZXI7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICB4aHIuc2VuZCgpO1xuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSB0aGlzLkRPTkUpIHtcbiAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignZ2V0SlNPTjogYCcgKyB1cmwgKyAnYCBmYWlsZWQgd2l0aCBzdGF0dXM6IFsnICsgdGhpcy5zdGF0dXMgKyAnXScpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBnZXRKU09OKCcvcG9zdHMuanNvbicpLnRoZW4oZnVuY3Rpb24oanNvbikge1xuICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgIC8vIG9uIHJlamVjdGlvblxuICB9KTtcbiAgYGBgXG5cbiAgVW5saWtlIGNhbGxiYWNrcywgcHJvbWlzZXMgYXJlIGdyZWF0IGNvbXBvc2FibGUgcHJpbWl0aXZlcy5cblxuICBgYGBqc1xuICBQcm9taXNlLmFsbChbXG4gICAgZ2V0SlNPTignL3Bvc3RzJyksXG4gICAgZ2V0SlNPTignL2NvbW1lbnRzJylcbiAgXSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgIHZhbHVlc1swXSAvLyA9PiBwb3N0c0pTT05cbiAgICB2YWx1ZXNbMV0gLy8gPT4gY29tbWVudHNKU09OXG5cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9KTtcbiAgYGBgXG5cbiAgQGNsYXNzIFByb21pc2VcbiAgQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZXJcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAY29uc3RydWN0b3JcbiovXG5cbnZhciBQcm9taXNlJDEgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFByb21pc2UocmVzb2x2ZXIpIHtcbiAgICB0aGlzW1BST01JU0VfSURdID0gbmV4dElkKCk7XG4gICAgdGhpcy5fcmVzdWx0ID0gdGhpcy5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcblxuICAgIGlmIChub29wICE9PSByZXNvbHZlcikge1xuICAgICAgdHlwZW9mIHJlc29sdmVyICE9PSAnZnVuY3Rpb24nICYmIG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgIHRoaXMgaW5zdGFuY2VvZiBQcm9taXNlID8gaW5pdGlhbGl6ZVByb21pc2UodGhpcywgcmVzb2x2ZXIpIDogbmVlZHNOZXcoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gIHdoaWNoIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlXG4gIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAvLyB1c2VyIGlzIGF2YWlsYWJsZVxuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gIH0pO1xuICBgYGBcbiAgIENoYWluaW5nXG4gIC0tLS0tLS0tXG4gICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZmlyc3QgcHJvbWlzZSdzIGZ1bGZpbGxtZW50XG4gIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIHVzZXIubmFtZTtcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgfSkudGhlbihmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICAvLyBJZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHVzZXJOYW1lYCB3aWxsIGJlIHRoZSB1c2VyJ3MgbmFtZSwgb3RoZXJ3aXNlIGl0XG4gICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gIH0pO1xuICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gbmV2ZXIgcmVhY2hlZFxuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgLy8gaWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGByZWFzb25gIHdpbGwgYmUgJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jy5cbiAgICAvLyBJZiBgZmluZFVzZXJgIHJlamVjdGVkLCBgcmVhc29uYCB3aWxsIGJlICdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jy5cbiAgfSk7XG4gIGBgYFxuICBJZiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIGRvZXMgbm90IHNwZWNpZnkgYSByZWplY3Rpb24gaGFuZGxlciwgcmVqZWN0aW9uIHJlYXNvbnMgd2lsbCBiZSBwcm9wYWdhdGVkIGZ1cnRoZXIgZG93bnN0cmVhbS5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gbmV2ZXIgcmVhY2hlZFxuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgfSk7XG4gIGBgYFxuICAgQXNzaW1pbGF0aW9uXG4gIC0tLS0tLS0tLS0tLVxuICAgU29tZXRpbWVzIHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgdG8gYSBkb3duc3RyZWFtIHByb21pc2UgY2FuIG9ubHkgYmVcbiAgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LiBUaGlzIGNhbiBiZSBhY2hpZXZlZCBieSByZXR1cm5pbmcgYSBwcm9taXNlIGluIHRoZVxuICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICB1bnRpbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBzZXR0bGVkLiBUaGlzIGlzIGNhbGxlZCAqYXNzaW1pbGF0aW9uKi5cbiAgIGBgYGpzXG4gIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gIH0pO1xuICBgYGBcbiAgIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgZnVsZmlsbHMsIHdlJ2xsIGhhdmUgdGhlIHZhbHVlIGhlcmVcbiAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgcmVqZWN0cywgd2UnbGwgaGF2ZSB0aGUgcmVhc29uIGhlcmVcbiAgfSk7XG4gIGBgYFxuICAgU2ltcGxlIEV4YW1wbGVcbiAgLS0tLS0tLS0tLS0tLS1cbiAgIFN5bmNocm9ub3VzIEV4YW1wbGVcbiAgIGBgYGphdmFzY3JpcHRcbiAgbGV0IHJlc3VsdDtcbiAgIHRyeSB7XG4gICAgcmVzdWx0ID0gZmluZFJlc3VsdCgpO1xuICAgIC8vIHN1Y2Nlc3NcbiAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAvLyBmYWlsdXJlXG4gIH1cbiAgYGBgXG4gICBFcnJiYWNrIEV4YW1wbGVcbiAgIGBgYGpzXG4gIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgIGlmIChlcnIpIHtcbiAgICAgIC8vIGZhaWx1cmVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc3VjY2Vzc1xuICAgIH1cbiAgfSk7XG4gIGBgYFxuICAgUHJvbWlzZSBFeGFtcGxlO1xuICAgYGBgamF2YXNjcmlwdFxuICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgIC8vIHN1Y2Nlc3NcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyBmYWlsdXJlXG4gIH0pO1xuICBgYGBcbiAgIEFkdmFuY2VkIEV4YW1wbGVcbiAgLS0tLS0tLS0tLS0tLS1cbiAgIFN5bmNocm9ub3VzIEV4YW1wbGVcbiAgIGBgYGphdmFzY3JpcHRcbiAgbGV0IGF1dGhvciwgYm9va3M7XG4gICB0cnkge1xuICAgIGF1dGhvciA9IGZpbmRBdXRob3IoKTtcbiAgICBib29rcyAgPSBmaW5kQm9va3NCeUF1dGhvcihhdXRob3IpO1xuICAgIC8vIHN1Y2Nlc3NcbiAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAvLyBmYWlsdXJlXG4gIH1cbiAgYGBgXG4gICBFcnJiYWNrIEV4YW1wbGVcbiAgIGBgYGpzXG4gICBmdW5jdGlvbiBmb3VuZEJvb2tzKGJvb2tzKSB7XG4gICB9XG4gICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuICAgfVxuICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgaWYgKGVycikge1xuICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgLy8gZmFpbHVyZVxuICAgIH0gZWxzZSB7XG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmb3VuZEJvb2tzKGJvb2tzKTtcbiAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICB9XG4gICAgICAvLyBzdWNjZXNzXG4gICAgfVxuICB9KTtcbiAgYGBgXG4gICBQcm9taXNlIEV4YW1wbGU7XG4gICBgYGBqYXZhc2NyaXB0XG4gIGZpbmRBdXRob3IoKS5cbiAgICB0aGVuKGZpbmRCb29rc0J5QXV0aG9yKS5cbiAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgIC8vIGZvdW5kIGJvb2tzXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgfSk7XG4gIGBgYFxuICAgQG1ldGhvZCB0aGVuXG4gIEBwYXJhbSB7RnVuY3Rpb259IG9uRnVsZmlsbGVkXG4gIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0ZWRcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfVxuICAqL1xuXG4gIC8qKlxuICBgY2F0Y2hgIGlzIHNpbXBseSBzdWdhciBmb3IgYHRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbilgIHdoaWNoIG1ha2VzIGl0IHRoZSBzYW1lXG4gIGFzIHRoZSBjYXRjaCBibG9jayBvZiBhIHRyeS9jYXRjaCBzdGF0ZW1lbnQuXG4gIGBgYGpzXG4gIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gIH1cbiAgLy8gc3luY2hyb25vdXNcbiAgdHJ5IHtcbiAgZmluZEF1dGhvcigpO1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICB9XG4gIC8vIGFzeW5jIHdpdGggcHJvbWlzZXNcbiAgZmluZEF1dGhvcigpLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gIH0pO1xuICBgYGBcbiAgQG1ldGhvZCBjYXRjaFxuICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGlvblxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG5cblxuICBQcm9taXNlLnByb3RvdHlwZS5jYXRjaCA9IGZ1bmN0aW9uIF9jYXRjaChvblJlamVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24pO1xuICB9O1xuXG4gIC8qKlxuICAgIGBmaW5hbGx5YCB3aWxsIGJlIGludm9rZWQgcmVnYXJkbGVzcyBvZiB0aGUgcHJvbWlzZSdzIGZhdGUganVzdCBhcyBuYXRpdmVcbiAgICB0cnkvY2F0Y2gvZmluYWxseSBiZWhhdmVzXG4gIFxuICAgIFN5bmNocm9ub3VzIGV4YW1wbGU6XG4gIFxuICAgIGBgYGpzXG4gICAgZmluZEF1dGhvcigpIHtcbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBBdXRob3IoKTtcbiAgICB9XG4gIFxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZmluZEF1dGhvcigpOyAvLyBzdWNjZWVkIG9yIGZhaWxcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICByZXR1cm4gZmluZE90aGVyQXV0aGVyKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIGFsd2F5cyBydW5zXG4gICAgICAvLyBkb2Vzbid0IGFmZmVjdCB0aGUgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIGBgYFxuICBcbiAgICBBc3luY2hyb25vdXMgZXhhbXBsZTpcbiAgXG4gICAgYGBganNcbiAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICB9KS5maW5hbGx5KGZ1bmN0aW9uKCl7XG4gICAgICAvLyBhdXRob3Igd2FzIGVpdGhlciBmb3VuZCwgb3Igbm90XG4gICAgfSk7XG4gICAgYGBgXG4gIFxuICAgIEBtZXRob2QgZmluYWxseVxuICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cblxuXG4gIFByb21pc2UucHJvdG90eXBlLmZpbmFsbHkgPSBmdW5jdGlvbiBfZmluYWxseShjYWxsYmFjaykge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICB2YXIgY29uc3RydWN0b3IgPSBwcm9taXNlLmNvbnN0cnVjdG9yO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2UudGhlbihjYWxsYmFjaywgY2FsbGJhY2spO1xuICB9O1xuXG4gIHJldHVybiBQcm9taXNlO1xufSgpO1xuXG5Qcm9taXNlJDEucHJvdG90eXBlLnRoZW4gPSB0aGVuO1xuUHJvbWlzZSQxLmFsbCA9IGFsbDtcblByb21pc2UkMS5yYWNlID0gcmFjZTtcblByb21pc2UkMS5yZXNvbHZlID0gcmVzb2x2ZSQxO1xuUHJvbWlzZSQxLnJlamVjdCA9IHJlamVjdCQxO1xuUHJvbWlzZSQxLl9zZXRTY2hlZHVsZXIgPSBzZXRTY2hlZHVsZXI7XG5Qcm9taXNlJDEuX3NldEFzYXAgPSBzZXRBc2FwO1xuUHJvbWlzZSQxLl9hc2FwID0gYXNhcDtcblxuLypnbG9iYWwgc2VsZiovXG5mdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgdmFyIGxvY2FsID0gdm9pZCAwO1xuXG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvY2FsID0gZ2xvYmFsO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvY2FsID0gc2VsZjtcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWwgPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgdmFyIFAgPSBsb2NhbC5Qcm9taXNlO1xuXG4gIGlmIChQKSB7XG4gICAgdmFyIHByb21pc2VUb1N0cmluZyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHByb21pc2VUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gc2lsZW50bHkgaWdub3JlZFxuICAgIH1cblxuICAgIGlmIChwcm9taXNlVG9TdHJpbmcgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgbG9jYWwuUHJvbWlzZSA9IFByb21pc2UkMTtcbn1cblxuLy8gU3RyYW5nZSBjb21wYXQuLlxuUHJvbWlzZSQxLnBvbHlmaWxsID0gcG9seWZpbGw7XG5Qcm9taXNlJDEuUHJvbWlzZSA9IFByb21pc2UkMTtcblxucmV0dXJuIFByb21pc2UkMTtcblxufSkpKTtcblxuXG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVzNi1wcm9taXNlLm1hcFxuIiwiXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZm9yRWFjaCAob2JqLCBmbiwgY3R4KSB7XG4gICAgaWYgKHRvU3RyaW5nLmNhbGwoZm4pICE9PSAnW29iamVjdCBGdW5jdGlvbl0nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2l0ZXJhdG9yIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICB2YXIgbCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGwgPT09ICtsKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBmbi5jYWxsKGN0eCwgb2JqW2ldLCBpLCBvYmopO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChvYmosIGspKSB7XG4gICAgICAgICAgICAgICAgZm4uY2FsbChjdHgsIG9ialtrXSwgaywgb2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbiIsInZhciB3aW47XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgd2luID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgd2luID0ge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2luO1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgaWYgKHN1cGVyQ3Rvcikge1xuICAgICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBpZiAoc3VwZXJDdG9yKSB7XG4gICAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICAgIH1cbiAgfVxufVxuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc05hTih2YWwpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KHZhbClcbiAgKTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhcbiAgICBzdHJcbiAgKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHk7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCc7XG4gIH1cbiAgaWYgKG1zID49IGgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO1xuICB9XG4gIGlmIChtcyA+PSBtKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztcbiAgfVxuICBpZiAobXMgPj0gcykge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncyc7XG4gIH1cbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpIHx8XG4gICAgcGx1cmFsKG1zLCBoLCAnaG91cicpIHx8XG4gICAgcGx1cmFsKG1zLCBtLCAnbWludXRlJykgfHxcbiAgICBwbHVyYWwobXMsIHMsICdzZWNvbmQnKSB8fFxuICAgIG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKG1zIDwgbiAqIDEuNSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lO1xuICB9XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IENsaW5pYVNlYXJjaDtcblxudmFyIENsaW5pYVNlYXJjaENvcmUgPSByZXF1aXJlKCcuL0NsaW5pYVNlYXJjaENvcmUuanMnKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG52YXIgZXJyb3JzID0gcmVxdWlyZSgnLi9lcnJvcnMnKTtcblxuZnVuY3Rpb24gQ2xpbmlhU2VhcmNoKCkge1xuICBDbGluaWFTZWFyY2hDb3JlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXRzKENsaW5pYVNlYXJjaCwgQ2xpbmlhU2VhcmNoQ29yZSk7XG5cbi8vIFdlIGRvIG5vdCBwcm92aWRlIHdyaXRlIEFQSSBhdCB0aGUgbW9tZW50XG5cbmZ1bmN0aW9uIG5vdEltcGxlbWVudGVkKCkge1xuICB2YXIgbWVzc2FnZSA9XG4gICAgJ05vdCBpbXBsZW1lbnRlZCBpbiB0aGlzIGVudmlyb25tZW50LlxcbicgK1xuICAgICdJZiB5b3UgZmVlbCB0aGlzIGlzIGEgbWlzdGFrZSwgd3JpdGUgdG8gc3VwcG9ydEBjbGluaWEuY2EnO1xuXG4gIHRocm93IG5ldyBlcnJvcnMuQ2xpbmlhU2VhcmNoRXJyb3IobWVzc2FnZSk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IENsaW5pYVNlYXJjaENvcmU7XG5cbnZhciBlcnJvcnMgPSByZXF1aXJlKCcuL2Vycm9ycycpO1xudmFyIGV4aXRQcm9taXNlID0gcmVxdWlyZSgnLi9leGl0UHJvbWlzZS5qcycpO1xudmFyIEluZGV4Q29yZSA9IHJlcXVpcmUoJy4vSW5kZXhDb3JlLmpzJyk7XG52YXIgc3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlLmpzJyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKTtcbnZhciBhcmdDaGVjayA9IHJlcXVpcmUoJy4vYXJnQ2hlY2suanMnKVxudmFyIGxvZ2dlciA9IHJlcXVpcmUoJy4vbG9nZ2VyLmpzJylcbnZhciBidWlsZFNlYXJjaE1ldGhvZCA9IHJlcXVpcmUoJy4vYnVpbGRTZWFyY2hNZXRob2QuanMnKTtcblxuLy8gV2Ugd2lsbCBhbHdheXMgcHV0IHRoZSBBUEkgS0VZIGluIHRoZSBKU09OIGJvZHkgaW4gY2FzZSBvZiB0b28gbG9uZyBBUEkgS0VZLFxuLy8gdG8gYXZvaWQgcXVlcnkgc3RyaW5nIGJlaW5nIHRvbyBsb25nIGFuZCBmYWlsaW5nIGluIHZhcmlvdXMgY29uZGl0aW9ucyAob3VyIHNlcnZlciBsaW1pdCwgYnJvd3NlciBsaW1pdCxcbi8vIHByb3hpZXMgbGltaXQpXG52YXIgTUFYX0FQSV9LRVlfTEVOR1RIID0gNTAwO1xudmFyIFJFU0VUX0FQUF9EQVRBX1RJTUVSID1cbiAgKHByb2Nlc3MuZW52LlJFU0VUX0FQUF9EQVRBX1RJTUVSICYmXG4gICAgcGFyc2VJbnQocHJvY2Vzcy5lbnYuUkVTRVRfQVBQX0RBVEFfVElNRVIsIDEwKSkgfHxcbiAgNjAgKiAyICogMTAwMDsgLy8gYWZ0ZXIgMiBtaW51dGVzIHJlc2V0IHRvIGZpcnN0IGhvc3RcblxuLyoqXG4gKiBDbGluaWEgU2VhcmNoIGxpYnJhcnkgaW5pdGlhbGl6YXRpb25cbiAqIGh0dHBzOi8vd3d3LmNsaW5pYWhlYWx0aC5jb20vXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFwcGxpY2F0aW9uSUQgLSBZb3VyIGFwcGxpY2F0aW9uSUQsIGZvdW5kIGluIHlvdXIgZGFzaGJvYXJkXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBpS2V5IC0gWW91ciBBUEkga2V5LCBmb3VuZCBpbiB5b3VyIGRhc2hib2FyZFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRzXVxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRzLnRpbWVvdXQ9MjAwMF0gLSBUaGUgcmVxdWVzdCB0aW1lb3V0IHNldCBpbiBtaWxsaXNlY29uZHMsXG4gKiBhbm90aGVyIHJlcXVlc3Qgd2lsbCBiZSBpc3N1ZWQgYWZ0ZXIgdGhpcyB0aW1lb3V0XG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMucHJvdG9jb2w9J2h0dHBzOiddIC0gVGhlIHByb3RvY29sIHVzZWQgdG8gcXVlcnkgQ2xpbmlhIFNlYXJjaCBBUEkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZXQgdG8gJ2h0dHA6JyB0byBmb3JjZSB1c2luZyBodHRwLlxuICovXG5mdW5jdGlvbiBDbGluaWFTZWFyY2hDb3JlKGFwcGxpY2F0aW9uSUQsIGFwaUtleSwgb3B0cykge1xuICB2YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdjbGluaWFzZWFyY2gnKTtcblxuICB2YXIgY2xvbmUgPSByZXF1aXJlKCcuL2Nsb25lLmpzJyk7XG4gIHZhciBtYXAgPSByZXF1aXJlKCcuL21hcC5qcycpO1xuXG4gIHZhciB1c2FnZSA9ICdVc2FnZTogY2xpbmlhc2VhcmNoKGFwcGxpY2F0aW9uSUQsIGFwaUtleSwgb3B0cyknO1xuXG4gIGlmIChvcHRzLl9hbGxvd0VtcHR5Q3JlZGVudGlhbHMgIT09IHRydWUgJiYgIWFwcGxpY2F0aW9uSUQpIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLkNsaW5pYVNlYXJjaEVycm9yKFxuICAgICAgJ1BsZWFzZSBwcm92aWRlIGFuIGFwcGxpY2F0aW9uIElELiAnICsgdXNhZ2VcbiAgICApO1xuICB9XG5cbiAgaWYgKG9wdHMuX2FsbG93RW1wdHlDcmVkZW50aWFscyAhPT0gdHJ1ZSAmJiAhYXBpS2V5KSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5DbGluaWFTZWFyY2hFcnJvcignUGxlYXNlIHByb3ZpZGUgYW4gQVBJIGtleS4gJyArIHVzYWdlKTtcbiAgfVxuXG4gIHRoaXMuYXBwbGljYXRpb25JRCA9IGFwcGxpY2F0aW9uSUQ7XG4gIHRoaXMuYXBpS2V5ID0gYXBpS2V5O1xuICAvKiogVGhpcyBmZWVscyB3ZWlyZCBhbmQgaXMgcHJvYmFibHkgd3JvbmcgYnV0IHdlIG5lZWQgaXQgdG8gYWNjZXNzIG91ciBtZXRob2RzIGluIHRoZSBjbGllbnQgbGlrZSB3ZSBkbyBpbiB0aGUgaW5kZXhlcy4gKi9cbiAgdGhpcy5hcyA9IHRoaXNcblxuICB0aGlzLmhvc3RzID0ge1xuICAgIHJlYWQ6IFtdLFxuICAgIHdyaXRlOiBbXSxcbiAgfTtcblxuICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICB0aGlzLl90aW1lb3V0cyA9IG9wdHMudGltZW91dHMgfHwge1xuICAgIGNvbm5lY3Q6IDEgKiAxMDAwLCAvLyA1MDBtcyBjb25uZWN0IGlzIEdQUlMgbGF0ZW5jeVxuICAgIHJlYWQ6IDIgKiAxMDAwLFxuICAgIHdyaXRlOiAzMCAqIDEwMDAsXG4gIH07XG5cbiAgLy8gYmFja3dhcmQgY29tcGF0LCBpZiBvcHRzLnRpbWVvdXQgaXMgcGFzc2VkLCB3ZSB1c2UgaXQgdG8gY29uZmlndXJlIGFsbCB0aW1lb3V0cyBsaWtlIGJlZm9yZVxuICBpZiAob3B0cy50aW1lb3V0KSB7XG4gICAgdGhpcy5fdGltZW91dHMuY29ubmVjdCA9IHRoaXMuX3RpbWVvdXRzLnJlYWQgPSB0aGlzLl90aW1lb3V0cy53cml0ZSA9XG4gICAgICBvcHRzLnRpbWVvdXQ7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSBvcHRzLnByb3RvY29sIHx8ICdodHRwczonO1xuICAvLyB3aGlsZSB3ZSBhZHZvY2F0ZSBmb3IgY29sb24tYXQtdGhlLWVuZCB2YWx1ZXM6ICdodHRwOicgZm9yIGBvcHRzLnByb3RvY29sYFxuICAvLyB3ZSBhbHNvIGFjY2VwdCBgaHR0cGAgYW5kIGBodHRwc2AuIEl0J3MgYSBjb21tb24gZXJyb3IuXG4gIGlmICghLzokLy50ZXN0KHByb3RvY29sKSkge1xuICAgIHByb3RvY29sID0gcHJvdG9jb2wgKyAnOic7XG4gIH1cblxuICBpZiAocHJvdG9jb2wgIT09ICdodHRwOicgJiYgcHJvdG9jb2wgIT09ICdodHRwczonKSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5DbGluaWFTZWFyY2hFcnJvcihcbiAgICAgICdwcm90b2NvbCBtdXN0IGJlIGBodHRwOmAgb3IgYGh0dHBzOmAgKHdhcyBgJyArIG9wdHMucHJvdG9jb2wgKyAnYCknXG4gICAgKTtcbiAgfVxuXG4gIHRoaXMuX2NoZWNrQXBwSWREYXRhKCk7XG5cbiAgaWYgKCFvcHRzLmhvc3RzKSB7XG4gICAgdmFyIGRlZmF1bHRIb3N0cyA9IG1hcCh0aGlzLl9zaHVmZmxlUmVzdWx0LCBmdW5jdGlvbihob3N0TnVtYmVyKSB7XG4gICAgICByZXR1cm4gYXBwbGljYXRpb25JRCArICctJyArIGhvc3ROdW1iZXIgKyAnLmNsaW5pYS5jYSc7XG4gICAgfSk7XG5cbiAgICAvLyBubyBob3N0cyBnaXZlbiwgY29tcHV0ZSBkZWZhdWx0c1xuICAgIHZhciBtYWluU3VmZml4ID0gKG9wdHMuZHNuID09PSBmYWxzZSA/ICcnIDogJy1kc24nKSArICcuY2xpbmlhLmNhJztcbiAgICB0aGlzLmhvc3RzLnJlYWQgPSBbdGhpcy5hcHBsaWNhdGlvbklEICsgbWFpblN1ZmZpeF0uY29uY2F0KGRlZmF1bHRIb3N0cyk7XG4gICAgdGhpcy5ob3N0cy53cml0ZSA9IFt0aGlzLmFwcGxpY2F0aW9uSUQgKyAnLmNsaW5pYS5jYSddLmNvbmNhdChkZWZhdWx0SG9zdHMpO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkob3B0cy5ob3N0cykpIHtcbiAgICAvLyB3aGVuIHBhc3NpbmcgY3VzdG9tIGhvc3RzLCB3ZSBuZWVkIHRvIGhhdmUgYSBkaWZmZXJlbnQgaG9zdCBpbmRleCBpZiB0aGUgbnVtYmVyXG4gICAgLy8gb2Ygd3JpdGUvcmVhZCBob3N0cyBhcmUgZGlmZmVyZW50LlxuICAgIHRoaXMuaG9zdHMucmVhZCA9IGNsb25lKG9wdHMuaG9zdHMpO1xuICAgIHRoaXMuaG9zdHMud3JpdGUgPSBjbG9uZShvcHRzLmhvc3RzKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmhvc3RzLnJlYWQgPSBjbG9uZShvcHRzLmhvc3RzLnJlYWQpO1xuICAgIHRoaXMuaG9zdHMud3JpdGUgPSBjbG9uZShvcHRzLmhvc3RzLndyaXRlKTtcbiAgfVxuXG4gIC8vIGFkZCBwcm90b2NvbCBhbmQgbG93ZXJjYXNlIGhvc3RzXG4gIHRoaXMuaG9zdHMucmVhZCA9IG1hcCh0aGlzLmhvc3RzLnJlYWQsIHByZXBhcmVIb3N0KHByb3RvY29sKSk7XG4gIHRoaXMuaG9zdHMud3JpdGUgPSBtYXAodGhpcy5ob3N0cy53cml0ZSwgcHJlcGFyZUhvc3QocHJvdG9jb2wpKTtcblxuICB0aGlzLmV4dHJhSGVhZGVycyA9IHt9O1xuXG4gIC8vIEluIHNvbWUgc2l0dWF0aW9ucyB5b3UgbWlnaHQgd2FudCB0byB3YXJtIHRoZSBjYWNoZVxuICB0aGlzLmNhY2hlID0gb3B0cy5fY2FjaGUgfHwge307XG5cbiAgdGhpcy5fdWEgPSBvcHRzLl91YTtcbiAgdGhpcy5fdXNlQ2FjaGUgPVxuICAgIG9wdHMuX3VzZUNhY2hlID09PSB1bmRlZmluZWQgfHwgb3B0cy5fY2FjaGUgPyB0cnVlIDogb3B0cy5fdXNlQ2FjaGU7XG4gIHRoaXMuX3VzZVJlcXVlc3RDYWNoZSA9IHRoaXMuX3VzZUNhY2hlICYmIG9wdHMuX3VzZVJlcXVlc3RDYWNoZTtcbiAgdGhpcy5fdXNlRmFsbGJhY2sgPSBvcHRzLnVzZUZhbGxiYWNrID09PSB1bmRlZmluZWQgPyB0cnVlIDogb3B0cy51c2VGYWxsYmFjaztcblxuICB0aGlzLl9zZXRUaW1lb3V0ID0gb3B0cy5fc2V0VGltZW91dDtcblxuICBkZWJ1ZygnaW5pdCBkb25lLCAlaicsIHRoaXMpO1xufVxuXG4vKlxuICogR2V0IHRoZSBpbmRleCBvYmplY3QgaW5pdGlhbGl6ZWRcbiAqXG4gKiBAcGFyYW0gaW5kZXhOYW1lIHRoZSBuYW1lIG9mIGluZGV4XG4gKiBAcGFyYW0gY2FsbGJhY2sgdGhlIHJlc3VsdCBjYWxsYmFjayB3aXRoIG9uZSBhcmd1bWVudCAodGhlIEluZGV4IGluc3RhbmNlKVxuICovXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5pbml0SW5kZXggPSBmdW5jdGlvbihpbmRleE5hbWUpIHtcbiAgcmV0dXJuIG5ldyBJbmRleENvcmUodGhpcywgaW5kZXhOYW1lKTtcbn07XG5cbi8qKlxuICogQWRkIGFuIGV4dHJhIGZpZWxkIHRvIHRoZSBIVFRQIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0gbmFtZSB0aGUgaGVhZGVyIGZpZWxkIG5hbWVcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgaGVhZGVyIGZpZWxkIHZhbHVlXG4gKi9cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLnNldEV4dHJhSGVhZGVyID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdGhpcy5leHRyYUhlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXSA9IHZhbHVlO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlIG9mIGFuIGV4dHJhIEhUVFAgaGVhZGVyXG4gKlxuICogQHBhcmFtIG5hbWUgdGhlIGhlYWRlciBmaWVsZCBuYW1lXG4gKi9cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLmdldEV4dHJhSGVhZGVyID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5leHRyYUhlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV4dHJhIGZpZWxkIGZyb20gdGhlIEhUVFAgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSBuYW1lIHRoZSBoZWFkZXIgZmllbGQgbmFtZVxuICovXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS51bnNldEV4dHJhSGVhZGVyID0gZnVuY3Rpb24obmFtZSkge1xuICBkZWxldGUgdGhpcy5leHRyYUhlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogQXVnbWVudCBzZW50IHgtY2xpbmlhLWFnZW50IHdpdGggbW9yZSBkYXRhLCBlYWNoIGFnZW50IHBhcnRcbiAqIGlzIGF1dG9tYXRpY2FsbHkgc2VwYXJhdGVkIGZyb20gdGhlIG90aGVycyBieSBhIHNlbWljb2xvbjtcbiAqXG4gKiBAcGFyYW0gY2xpbmlhQWdlbnQgdGhlIGFnZW50IHRvIGFkZFxuICovXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5hZGRDbGluaWFBZ2VudCA9IGZ1bmN0aW9uKGNsaW5pYUFnZW50KSB7XG4gIHZhciBjbGluaWFBZ2VudFdpdGhEZWxpbWl0ZXIgPSAnOyAnICsgY2xpbmlhQWdlbnQ7XG5cbiAgaWYgKHRoaXMuX3VhLmluZGV4T2YoY2xpbmlhQWdlbnRXaXRoRGVsaW1pdGVyKSA9PT0gLTEpIHtcbiAgICB0aGlzLl91YSArPSBjbGluaWFBZ2VudFdpdGhEZWxpbWl0ZXI7XG4gIH1cbn07XG5cbi8qXG4gKiBXcmFwcGVyIHRoYXQgdHJ5IGFsbCBob3N0cyB0byBtYXhpbWl6ZSB0aGUgcXVhbGl0eSBvZiBzZXJ2aWNlXG4gKi9cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLl9qc29uUmVxdWVzdCA9IGZ1bmN0aW9uKGluaXRpYWxPcHRzKSB7XG4gIHRoaXMuX2NoZWNrQXBwSWREYXRhKCk7XG5cbiAgdmFyIHJlcXVlc3REZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2NsaW5pYXNlYXJjaDonICsgaW5pdGlhbE9wdHMudXJsKTtcblxuICB2YXIgYm9keTtcbiAgdmFyIGNhY2hlSUQ7XG4gIHZhciBhZGRpdGlvbmFsVUEgPSBpbml0aWFsT3B0cy5hZGRpdGlvbmFsVUEgfHwgJyc7XG4gIHZhciBjYWNoZSA9IGluaXRpYWxPcHRzLmNhY2hlO1xuICB2YXIgY2xpZW50ID0gdGhpcztcbiAgdmFyIHRyaWVzID0gMDtcbiAgdmFyIHVzaW5nRmFsbGJhY2sgPSBmYWxzZTtcbiAgdmFyIGhhc0ZhbGxiYWNrID1cbiAgICBjbGllbnQuX3VzZUZhbGxiYWNrICYmIGNsaWVudC5fcmVxdWVzdC5mYWxsYmFjayAmJiBpbml0aWFsT3B0cy5mYWxsYmFjaztcbiAgdmFyIGhlYWRlcnM7XG5cbiAgaWYgKFxuICAgIHRoaXMuYXBpS2V5Lmxlbmd0aCA+IE1BWF9BUElfS0VZX0xFTkdUSCAmJlxuICAgIGluaXRpYWxPcHRzLmJvZHkgIT09IHVuZGVmaW5lZCAmJlxuICAgIChpbml0aWFsT3B0cy5ib2R5LnBhcmFtcyAhPT0gdW5kZWZpbmVkIHx8IC8vIGluZGV4LnNlYXJjaCgpXG4gICAgICBpbml0aWFsT3B0cy5ib2R5LnJlcXVlc3RzICE9PSB1bmRlZmluZWQpIC8vIGNsaWVudC5zZWFyY2goKVxuICApIHtcbiAgICBpbml0aWFsT3B0cy5ib2R5LmFwaUtleSA9IHRoaXMuYXBpS2V5O1xuICAgIGhlYWRlcnMgPSB0aGlzLl9jb21wdXRlUmVxdWVzdEhlYWRlcnMoe1xuICAgICAgYWRkaXRpb25hbFVBOiBhZGRpdGlvbmFsVUEsXG4gICAgICB3aXRoQXBpS2V5OiBmYWxzZSxcbiAgICAgIGhlYWRlcnM6IGluaXRpYWxPcHRzLmhlYWRlcnMsXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgaGVhZGVycyA9IHRoaXMuX2NvbXB1dGVSZXF1ZXN0SGVhZGVycyh7XG4gICAgICBhZGRpdGlvbmFsVUE6IGFkZGl0aW9uYWxVQSxcbiAgICAgIGhlYWRlcnM6IGluaXRpYWxPcHRzLmhlYWRlcnMsXG4gICAgfSk7XG4gIH1cblxuICBpZiAoaW5pdGlhbE9wdHMuYm9keSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYm9keSA9IHNhZmVKU09OU3RyaW5naWZ5KGluaXRpYWxPcHRzLmJvZHkpO1xuICB9XG5cbiAgcmVxdWVzdERlYnVnKCdyZXF1ZXN0IHN0YXJ0Jyk7XG4gIHZhciBkZWJ1Z0RhdGEgPSBbXTtcblxuICBmdW5jdGlvbiBkb1JlcXVlc3QocmVxdWVzdGVyLCByZXFPcHRzKSB7XG4gICAgY2xpZW50Ll9jaGVja0FwcElkRGF0YSgpO1xuXG4gICAgdmFyIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cbiAgICBpZiAoY2xpZW50Ll91c2VDYWNoZSAmJiAhY2xpZW50Ll91c2VSZXF1ZXN0Q2FjaGUpIHtcbiAgICAgIGNhY2hlSUQgPSBpbml0aWFsT3B0cy51cmw7XG4gICAgfVxuXG4gICAgLy8gYXMgd2Ugc29tZXRpbWUgdXNlIFBPU1QgcmVxdWVzdHMgdG8gcGFzcyBwYXJhbWV0ZXJzIChsaWtlIHF1ZXJ5PSdhYScpLFxuICAgIC8vIHRoZSBjYWNoZUlEIG11c3QgYWxzbyBpbmNsdWRlIHRoZSBib2R5IHRvIGJlIGRpZmZlcmVudCBiZXR3ZWVuIGNhbGxzXG4gICAgaWYgKGNsaWVudC5fdXNlQ2FjaGUgJiYgIWNsaWVudC5fdXNlUmVxdWVzdENhY2hlICYmIGJvZHkpIHtcbiAgICAgIGNhY2hlSUQgKz0gJ19ib2R5XycgKyByZXFPcHRzLmJvZHk7XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIGNhY2hlIGV4aXN0ZW5jZVxuICAgIGlmIChpc0NhY2hlVmFsaWRXaXRoQ3VycmVudElEKCFjbGllbnQuX3VzZVJlcXVlc3RDYWNoZSwgY2FjaGUsIGNhY2hlSUQpKSB7XG4gICAgICByZXF1ZXN0RGVidWcoJ3NlcnZpbmcgcmVzcG9uc2UgZnJvbSBjYWNoZScpO1xuXG4gICAgICB2YXIgcmVzcG9uc2VUZXh0ID0gY2FjaGVbY2FjaGVJRF07XG5cbiAgICAgIC8vIENhY2hlIHJlc3BvbnNlIG11c3QgbWF0Y2ggdGhlIHR5cGUgb2YgdGhlIG9yaWdpbmFsIG9uZVxuICAgICAgcmV0dXJuIGNsaWVudC5fcHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgYm9keTogSlNPTi5wYXJzZShyZXNwb25zZVRleHQpLFxuICAgICAgICByZXNwb25zZVRleHQ6IHJlc3BvbnNlVGV4dCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIHJlYWNoZWQgbWF4IHRyaWVzXG4gICAgaWYgKHRyaWVzID49IGNsaWVudC5ob3N0c1tpbml0aWFsT3B0cy5ob3N0VHlwZV0ubGVuZ3RoKSB7XG4gICAgICBpZiAoIWhhc0ZhbGxiYWNrIHx8IHVzaW5nRmFsbGJhY2spIHtcbiAgICAgICAgcmVxdWVzdERlYnVnKCdjb3VsZCBub3QgZ2V0IGFueSByZXNwb25zZScpO1xuICAgICAgICAvLyB0aGVuIHN0b3BcbiAgICAgICAgcmV0dXJuIGNsaWVudC5fcHJvbWlzZS5yZWplY3QoXG4gICAgICAgICAgbmV3IGVycm9ycy5DbGluaWFTZWFyY2hFcnJvcihcbiAgICAgICAgICAgICdDYW5ub3QgY29ubmVjdCB0byB0aGUgQ2xpbmlhU2VhcmNoIEFQSS4nICtcbiAgICAgICAgICAgICAgJyBBcHBsaWNhdGlvbiBpZCB3YXM6ICcgK1xuICAgICAgICAgICAgICBjbGllbnQuYXBwbGljYXRpb25JRCxcbiAgICAgICAgICAgIHsgZGVidWdEYXRhOiBkZWJ1Z0RhdGEgfVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdERlYnVnKCdzd2l0Y2hpbmcgdG8gZmFsbGJhY2snKTtcblxuICAgICAgLy8gbGV0J3MgdHJ5IHRoZSBmYWxsYmFjayBzdGFydGluZyBmcm9tIGhlcmVcbiAgICAgIHRyaWVzID0gMDtcblxuICAgICAgLy8gbWV0aG9kLCB1cmwgYW5kIGJvZHkgYXJlIGZhbGxiYWNrIGRlcGVuZGVudFxuICAgICAgcmVxT3B0cy5tZXRob2QgPSBpbml0aWFsT3B0cy5mYWxsYmFjay5tZXRob2Q7XG4gICAgICByZXFPcHRzLnVybCA9IGluaXRpYWxPcHRzLmZhbGxiYWNrLnVybDtcbiAgICAgIHJlcU9wdHMuanNvbkJvZHkgPSBpbml0aWFsT3B0cy5mYWxsYmFjay5ib2R5O1xuICAgICAgaWYgKHJlcU9wdHMuanNvbkJvZHkpIHtcbiAgICAgICAgcmVxT3B0cy5ib2R5ID0gc2FmZUpTT05TdHJpbmdpZnkocmVxT3B0cy5qc29uQm9keSk7XG4gICAgICB9XG4gICAgICAvLyByZS1jb21wdXRlIGhlYWRlcnMsIHRoZXkgY291bGQgYmUgb21pdHRpbmcgdGhlIEFQSSBLRVlcbiAgICAgIGhlYWRlcnMgPSBjbGllbnQuX2NvbXB1dGVSZXF1ZXN0SGVhZGVycyh7XG4gICAgICAgIGFkZGl0aW9uYWxVQTogYWRkaXRpb25hbFVBLFxuICAgICAgICBoZWFkZXJzOiBpbml0aWFsT3B0cy5oZWFkZXJzLFxuICAgICAgfSk7XG5cbiAgICAgIHJlcU9wdHMudGltZW91dHMgPSBjbGllbnQuX2dldFRpbWVvdXRzRm9yUmVxdWVzdChpbml0aWFsT3B0cy5ob3N0VHlwZSk7XG4gICAgICBjbGllbnQuX3NldEhvc3RJbmRleEJ5VHlwZSgwLCBpbml0aWFsT3B0cy5ob3N0VHlwZSk7XG4gICAgICB1c2luZ0ZhbGxiYWNrID0gdHJ1ZTsgLy8gdGhlIGN1cnJlbnQgcmVxdWVzdCBpcyBub3cgdXNpbmcgZmFsbGJhY2tcbiAgICAgIHJldHVybiBkb1JlcXVlc3QoY2xpZW50Ll9yZXF1ZXN0LmZhbGxiYWNrLCByZXFPcHRzKTtcbiAgICB9XG5cbiAgICB2YXIgY3VycmVudEhvc3QgPSBjbGllbnQuX2dldEhvc3RCeVR5cGUoaW5pdGlhbE9wdHMuaG9zdFR5cGUpO1xuXG4gICAgdmFyIHVybCA9IGN1cnJlbnRIb3N0ICsgcmVxT3B0cy51cmw7XG4gICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICBib2R5OiByZXFPcHRzLmJvZHksXG4gICAgICBqc29uQm9keTogcmVxT3B0cy5qc29uQm9keSxcbiAgICAgIG1ldGhvZDogcmVxT3B0cy5tZXRob2QsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgdGltZW91dHM6IHJlcU9wdHMudGltZW91dHMsXG4gICAgICBkZWJ1ZzogcmVxdWVzdERlYnVnLFxuICAgICAgZm9yY2VBdXRoSGVhZGVyczogcmVxT3B0cy5mb3JjZUF1dGhIZWFkZXJzLFxuICAgIH07XG5cbiAgICByZXF1ZXN0RGVidWcoXG4gICAgICAnbWV0aG9kOiAlcywgdXJsOiAlcywgaGVhZGVyczogJWosIHRpbWVvdXRzOiAlZCcsXG4gICAgICBvcHRpb25zLm1ldGhvZCxcbiAgICAgIHVybCxcbiAgICAgIG9wdGlvbnMuaGVhZGVycyxcbiAgICAgIG9wdGlvbnMudGltZW91dHNcbiAgICApO1xuXG4gICAgaWYgKHJlcXVlc3RlciA9PT0gY2xpZW50Ll9yZXF1ZXN0LmZhbGxiYWNrKSB7XG4gICAgICByZXF1ZXN0RGVidWcoJ3VzaW5nIGZhbGxiYWNrJyk7XG4gICAgfVxuXG4gICAgLy8gYHJlcXVlc3RlcmAgaXMgYW55IG9mIHRoaXMuX3JlcXVlc3Qgb3IgdGhpcy5fcmVxdWVzdC5mYWxsYmFja1xuICAgIC8vIHRodXMgaXQgbmVlZHMgdG8gYmUgY2FsbGVkIHVzaW5nIHRoZSBjbGllbnQgYXMgY29udGV4dFxuICAgIHJldHVybiByZXF1ZXN0ZXIuY2FsbChjbGllbnQsIHVybCwgb3B0aW9ucykudGhlbihzdWNjZXNzLCB0cnlGYWxsYmFjayk7XG5cbiAgICBmdW5jdGlvbiBzdWNjZXNzKGh0dHBSZXNwb25zZSkge1xuICAgICAgLy8gY29tcHV0ZSB0aGUgc3RhdHVzIG9mIHRoZSByZXNwb25zZSxcbiAgICAgIC8vXG4gICAgICAvLyBXaGVuIGluIGJyb3dzZXIgbW9kZSwgdXNpbmcgWERSIG9yIEpTT05QLCB3ZSBoYXZlIG5vIHN0YXR1c0NvZGUgYXZhaWxhYmxlXG4gICAgICAvLyBTbyB3ZSByZWx5IG9uIG91ciBBUEkgcmVzcG9uc2UgYHN0YXR1c2AgcHJvcGVydHkuXG4gICAgICAvLyBCdXQgYHdhaXRUYXNrYCBjYW4gc2V0IGEgYHN0YXR1c2AgcHJvcGVydHkgd2hpY2ggaXMgbm90IHRoZSBzdGF0dXNDb2RlIChpdCdzIHRoZSB0YXNrIHN0YXR1cylcbiAgICAgIC8vIFNvIHdlIGNoZWNrIGlmIHRoZXJlJ3MgYSBgbWVzc2FnZWAgYWxvbmcgYHN0YXR1c2AgYW5kIGl0IG1lYW5zIGl0J3MgYW4gZXJyb3JcbiAgICAgIC8vXG4gICAgICAvLyBUaGF0J3MgdGhlIG9ubHkgY2FzZSB3aGVyZSB3ZSBoYXZlIGEgcmVzcG9uc2Uuc3RhdHVzIHRoYXQncyBub3QgdGhlIGh0dHAgc3RhdHVzQ29kZVxuICAgICAgdmFyIHN0YXR1cyA9XG4gICAgICAgIChodHRwUmVzcG9uc2UgJiZcbiAgICAgICAgICBodHRwUmVzcG9uc2UuYm9keSAmJlxuICAgICAgICAgIGh0dHBSZXNwb25zZS5ib2R5Lm1lc3NhZ2UgJiZcbiAgICAgICAgICBodHRwUmVzcG9uc2UuYm9keS5zdGF0dXMpIHx8XG4gICAgICAgIC8vIHRoaXMgaXMgaW1wb3J0YW50IHRvIGNoZWNrIHRoZSByZXF1ZXN0IHN0YXR1c0NvZGUgQUZURVIgdGhlIGJvZHkgZXZlbnR1YWxcbiAgICAgICAgLy8gc3RhdHVzQ29kZSBiZWNhdXNlIHNvbWUgaW1wbGVtZW50YXRpb25zIChqUXVlcnkgWERvbWFpblJlcXVlc3QgdHJhbnNwb3J0KSBtYXlcbiAgICAgICAgLy8gc2VuZCBzdGF0dXNDb2RlIDIwMCB3aGlsZSB3ZSBoYWQgYW4gZXJyb3JcbiAgICAgICAgaHR0cFJlc3BvbnNlLnN0YXR1c0NvZGUgfHxcbiAgICAgICAgLy8gV2hlbiBpbiBicm93c2VyIG1vZGUsIHVzaW5nIFhEUiBvciBKU09OUFxuICAgICAgICAvLyB3ZSBkZWZhdWx0IHRvIHN1Y2Nlc3Mgd2hlbiBubyBlcnJvciAobm8gcmVzcG9uc2Uuc3RhdHVzICYmIHJlc3BvbnNlLm1lc3NhZ2UpXG4gICAgICAgIC8vIElmIHRoZXJlIHdhcyBhIEpTT04ucGFyc2UoKSBlcnJvciB0aGVuIGJvZHkgaXMgbnVsbCBhbmQgaXQgZmFpbHNcbiAgICAgICAgKGh0dHBSZXNwb25zZSAmJiBodHRwUmVzcG9uc2UuYm9keSAmJiAyMDApO1xuXG4gICAgICByZXF1ZXN0RGVidWcoXG4gICAgICAgICdyZWNlaXZlZCByZXNwb25zZTogc3RhdHVzQ29kZTogJXMsIGNvbXB1dGVkIHN0YXR1c0NvZGU6ICVkLCBoZWFkZXJzOiAlaicsXG4gICAgICAgIGh0dHBSZXNwb25zZS5zdGF0dXNDb2RlLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIGh0dHBSZXNwb25zZS5oZWFkZXJzXG4gICAgICApO1xuXG4gICAgICB2YXIgaHR0cFJlc3BvbnNlT2sgPSBNYXRoLmZsb29yKHN0YXR1cyAvIDEwMCkgPT09IDI7XG5cbiAgICAgIHZhciBlbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgIGRlYnVnRGF0YS5wdXNoKHtcbiAgICAgICAgY3VycmVudEhvc3Q6IGN1cnJlbnRIb3N0LFxuICAgICAgICBoZWFkZXJzOiByZW1vdmVDcmVkZW50aWFscyhoZWFkZXJzKSxcbiAgICAgICAgY29udGVudDogYm9keSB8fCBudWxsLFxuICAgICAgICBjb250ZW50TGVuZ3RoOiBib2R5ICE9PSB1bmRlZmluZWQgPyBib2R5Lmxlbmd0aCA6IG51bGwsXG4gICAgICAgIG1ldGhvZDogcmVxT3B0cy5tZXRob2QsXG4gICAgICAgIHRpbWVvdXRzOiByZXFPcHRzLnRpbWVvdXRzLFxuICAgICAgICB1cmw6IHJlcU9wdHMudXJsLFxuICAgICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZSxcbiAgICAgICAgZW5kVGltZTogZW5kVGltZSxcbiAgICAgICAgZHVyYXRpb246IGVuZFRpbWUgLSBzdGFydFRpbWUsXG4gICAgICAgIHN0YXR1c0NvZGU6IHN0YXR1cyxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaHR0cFJlc3BvbnNlT2spIHtcbiAgICAgICAgaWYgKGNsaWVudC5fdXNlQ2FjaGUgJiYgIWNsaWVudC5fdXNlUmVxdWVzdENhY2hlICYmIGNhY2hlKSB7XG4gICAgICAgICAgY2FjaGVbY2FjaGVJRF0gPSBodHRwUmVzcG9uc2UucmVzcG9uc2VUZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXNwb25zZVRleHQ6IGh0dHBSZXNwb25zZS5yZXNwb25zZVRleHQsXG4gICAgICAgICAgYm9keTogaHR0cFJlc3BvbnNlLmJvZHksXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHZhciBzaG91bGRSZXRyeSA9IE1hdGguZmxvb3Ioc3RhdHVzIC8gMTAwKSAhPT0gNDtcblxuICAgICAgaWYgKHNob3VsZFJldHJ5KSB7XG4gICAgICAgIHRyaWVzICs9IDE7XG4gICAgICAgIHJldHVybiByZXRyeVJlcXVlc3QoKTtcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdERlYnVnKCd1bnJlY292ZXJhYmxlIGVycm9yJyk7XG5cbiAgICAgIC8vIG5vIHN1Y2Nlc3MgYW5kIG5vIHJldHJ5ID0+IGZhaWxcbiAgICAgIHZhciB1bnJlY292ZXJhYmxlRXJyb3IgPSBuZXcgZXJyb3JzLkNsaW5pYVNlYXJjaEVycm9yKFxuICAgICAgICBodHRwUmVzcG9uc2UuYm9keSAmJiBodHRwUmVzcG9uc2UuYm9keS5tZXNzYWdlLFxuICAgICAgICB7IGRlYnVnRGF0YTogZGVidWdEYXRhLCBzdGF0dXNDb2RlOiBzdGF0dXMgfVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGNsaWVudC5fcHJvbWlzZS5yZWplY3QodW5yZWNvdmVyYWJsZUVycm9yKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cnlGYWxsYmFjayhlcnIpIHtcbiAgICAgIC8vIGVycm9yIGNhc2VzOlxuICAgICAgLy8gIFdoaWxlIG5vdCBpbiBmYWxsYmFjayBtb2RlOlxuICAgICAgLy8gICAgLSBDT1JTIG5vdCBzdXBwb3J0ZWRcbiAgICAgIC8vICAgIC0gbmV0d29yayBlcnJvclxuICAgICAgLy8gIFdoaWxlIGluIGZhbGxiYWNrIG1vZGU6XG4gICAgICAvLyAgICAtIHRpbWVvdXRcbiAgICAgIC8vICAgIC0gbmV0d29yayBlcnJvclxuICAgICAgLy8gICAgLSBiYWRseSBmb3JtYXR0ZWQgSlNPTlAgKHNjcmlwdCBsb2FkZWQsIGRpZCBub3QgY2FsbCBvdXIgY2FsbGJhY2spXG4gICAgICAvLyAgSW4gYm90aCBjYXNlczpcbiAgICAgIC8vICAgIC0gdW5jYXVnaHQgZXhjZXB0aW9uIG9jY3VycyAoVHlwZUVycm9yKVxuICAgICAgcmVxdWVzdERlYnVnKCdlcnJvcjogJXMsIHN0YWNrOiAlcycsIGVyci5tZXNzYWdlLCBlcnIuc3RhY2spO1xuXG4gICAgICB2YXIgZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICBkZWJ1Z0RhdGEucHVzaCh7XG4gICAgICAgIGN1cnJlbnRIb3N0OiBjdXJyZW50SG9zdCxcbiAgICAgICAgaGVhZGVyczogcmVtb3ZlQ3JlZGVudGlhbHMoaGVhZGVycyksXG4gICAgICAgIGNvbnRlbnQ6IGJvZHkgfHwgbnVsbCxcbiAgICAgICAgY29udGVudExlbmd0aDogYm9keSAhPT0gdW5kZWZpbmVkID8gYm9keS5sZW5ndGggOiBudWxsLFxuICAgICAgICBtZXRob2Q6IHJlcU9wdHMubWV0aG9kLFxuICAgICAgICB0aW1lb3V0czogcmVxT3B0cy50aW1lb3V0cyxcbiAgICAgICAgdXJsOiByZXFPcHRzLnVybCxcbiAgICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUsXG4gICAgICAgIGVuZFRpbWU6IGVuZFRpbWUsXG4gICAgICAgIGR1cmF0aW9uOiBlbmRUaW1lIC0gc3RhcnRUaW1lLFxuICAgICAgfSk7XG5cbiAgICAgIGlmICghKGVyciBpbnN0YW5jZW9mIGVycm9ycy5DbGluaWFTZWFyY2hFcnJvcikpIHtcbiAgICAgICAgZXJyID0gbmV3IGVycm9ycy5Vbmtub3duKGVyciAmJiBlcnIubWVzc2FnZSwgZXJyKTtcbiAgICAgIH1cblxuICAgICAgdHJpZXMgKz0gMTtcblxuICAgICAgLy8gc3RvcCB0aGUgcmVxdWVzdCBpbXBsZW1lbnRhdGlvbiB3aGVuOlxuICAgICAgaWYgKFxuICAgICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIHRoaXMgZXJyb3IsXG4gICAgICAgIC8vIGl0IGNvbWVzIGZyb20gYSB0aHJvdyBpbiBzb21lIG90aGVyIHBpZWNlIG9mIGNvZGVcbiAgICAgICAgZXJyIGluc3RhbmNlb2YgZXJyb3JzLlVua25vd24gfHxcbiAgICAgICAgLy8gc2VydmVyIHNlbnQgdW5wYXJzYWJsZSBKU09OXG4gICAgICAgIGVyciBpbnN0YW5jZW9mIGVycm9ycy5VbnBhcnNhYmxlSlNPTiB8fFxuICAgICAgICAvLyBtYXggdHJpZXMgYW5kIGFscmVhZHkgdXNpbmcgZmFsbGJhY2sgb3Igbm8gZmFsbGJhY2tcbiAgICAgICAgKHRyaWVzID49IGNsaWVudC5ob3N0c1tpbml0aWFsT3B0cy5ob3N0VHlwZV0ubGVuZ3RoICYmXG4gICAgICAgICAgKHVzaW5nRmFsbGJhY2sgfHwgIWhhc0ZhbGxiYWNrKSlcbiAgICAgICkge1xuICAgICAgICAvLyBzdG9wIHJlcXVlc3QgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgY29tbWFuZFxuICAgICAgICBlcnIuZGVidWdEYXRhID0gZGVidWdEYXRhO1xuICAgICAgICByZXR1cm4gY2xpZW50Ll9wcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgfVxuXG4gICAgICAvLyBXaGVuIGEgdGltZW91dCBvY2N1cnJlZCwgcmV0cnkgYnkgcmFpc2luZyB0aW1lb3V0XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgZXJyb3JzLlJlcXVlc3RUaW1lb3V0KSB7XG4gICAgICAgIHJldHVybiByZXRyeVJlcXVlc3RXaXRoSGlnaGVyVGltZW91dCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0cnlSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmV0cnlSZXF1ZXN0KCkge1xuICAgICAgcmVxdWVzdERlYnVnKCdyZXRyeWluZyByZXF1ZXN0Jyk7XG4gICAgICBjbGllbnQuX2luY3JlbWVudEhvc3RJbmRleChpbml0aWFsT3B0cy5ob3N0VHlwZSk7XG4gICAgICByZXR1cm4gZG9SZXF1ZXN0KHJlcXVlc3RlciwgcmVxT3B0cyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmV0cnlSZXF1ZXN0V2l0aEhpZ2hlclRpbWVvdXQoKSB7XG4gICAgICByZXF1ZXN0RGVidWcoJ3JldHJ5aW5nIHJlcXVlc3Qgd2l0aCBoaWdoZXIgdGltZW91dCcpO1xuICAgICAgY2xpZW50Ll9pbmNyZW1lbnRIb3N0SW5kZXgoaW5pdGlhbE9wdHMuaG9zdFR5cGUpO1xuICAgICAgY2xpZW50Ll9pbmNyZW1lbnRUaW1lb3V0TXVsdGlwbGVyKCk7XG4gICAgICByZXFPcHRzLnRpbWVvdXRzID0gY2xpZW50Ll9nZXRUaW1lb3V0c0ZvclJlcXVlc3QoaW5pdGlhbE9wdHMuaG9zdFR5cGUpO1xuICAgICAgcmV0dXJuIGRvUmVxdWVzdChyZXF1ZXN0ZXIsIHJlcU9wdHMpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQ2FjaGVWYWxpZFdpdGhDdXJyZW50SUQoXG4gICAgdXNlUmVxdWVzdENhY2hlLFxuICAgIGN1cnJlbnRDYWNoZSxcbiAgICBjdXJyZW50Q2FjaGVJRFxuICApIHtcbiAgICByZXR1cm4gKFxuICAgICAgY2xpZW50Ll91c2VDYWNoZSAmJlxuICAgICAgdXNlUmVxdWVzdENhY2hlICYmXG4gICAgICBjdXJyZW50Q2FjaGUgJiZcbiAgICAgIGN1cnJlbnRDYWNoZVtjdXJyZW50Q2FjaGVJRF0gIT09IHVuZGVmaW5lZFxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnRlcm9wQ2FsbGJhY2tSZXR1cm4ocmVxdWVzdCwgY2FsbGJhY2spIHtcbiAgICBpZiAoaXNDYWNoZVZhbGlkV2l0aEN1cnJlbnRJRChjbGllbnQuX3VzZVJlcXVlc3RDYWNoZSwgY2FjaGUsIGNhY2hlSUQpKSB7XG4gICAgICByZXF1ZXN0LmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBSZWxlYXNlIHRoZSBjYWNoZSBvbiBlcnJvclxuICAgICAgICBkZWxldGUgY2FjaGVbY2FjaGVJRF07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGluaXRpYWxPcHRzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBlaXRoZXIgd2UgaGF2ZSBhIGNhbGxiYWNrXG4gICAgICByZXF1ZXN0LnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uIG9rQ2IoY29udGVudCkge1xuICAgICAgICAgIGV4aXRQcm9taXNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5pdGlhbE9wdHMuY2FsbGJhY2sobnVsbCwgY2FsbGJhY2soY29udGVudCkpO1xuICAgICAgICAgIH0sIGNsaWVudC5fc2V0VGltZW91dCB8fCBzZXRUaW1lb3V0KTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gbm9va0NiKGVycikge1xuICAgICAgICAgIGV4aXRQcm9taXNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5pdGlhbE9wdHMuY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICB9LCBjbGllbnQuX3NldFRpbWVvdXQgfHwgc2V0VGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGVpdGhlciB3ZSBhcmUgdXNpbmcgcHJvbWlzZXNcbiAgICAgIHJldHVybiByZXF1ZXN0LnRoZW4oY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjbGllbnQuX3VzZUNhY2hlICYmIGNsaWVudC5fdXNlUmVxdWVzdENhY2hlKSB7XG4gICAgY2FjaGVJRCA9IGluaXRpYWxPcHRzLnVybDtcbiAgfVxuXG4gIC8vIGFzIHdlIHNvbWV0aW1lIHVzZSBQT1NUIHJlcXVlc3RzIHRvIHBhc3MgcGFyYW1ldGVycyAobGlrZSBxdWVyeT0nYWEnKSxcbiAgLy8gdGhlIGNhY2hlSUQgbXVzdCBhbHNvIGluY2x1ZGUgdGhlIGJvZHkgdG8gYmUgZGlmZmVyZW50IGJldHdlZW4gY2FsbHNcbiAgaWYgKGNsaWVudC5fdXNlQ2FjaGUgJiYgY2xpZW50Ll91c2VSZXF1ZXN0Q2FjaGUgJiYgYm9keSkge1xuICAgIGNhY2hlSUQgKz0gJ19ib2R5XycgKyBib2R5O1xuICB9XG5cbiAgaWYgKGlzQ2FjaGVWYWxpZFdpdGhDdXJyZW50SUQoY2xpZW50Ll91c2VSZXF1ZXN0Q2FjaGUsIGNhY2hlLCBjYWNoZUlEKSkge1xuICAgIHJlcXVlc3REZWJ1Zygnc2VydmluZyByZXF1ZXN0IGZyb20gY2FjaGUnKTtcblxuICAgIHZhciBtYXliZVByb21pc2VGb3JDYWNoZSA9IGNhY2hlW2NhY2hlSURdO1xuXG4gICAgLy8gSW4gY2FzZSB0aGUgY2FjaGUgaXMgd2FybXVwIHdpdGggdmFsdWUgdGhhdCBpcyBub3QgYSBwcm9taXNlXG4gICAgdmFyIHByb21pc2VGb3JDYWNoZSA9XG4gICAgICB0eXBlb2YgbWF5YmVQcm9taXNlRm9yQ2FjaGUudGhlbiAhPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IGNsaWVudC5fcHJvbWlzZS5yZXNvbHZlKHsgcmVzcG9uc2VUZXh0OiBtYXliZVByb21pc2VGb3JDYWNoZSB9KVxuICAgICAgICA6IG1heWJlUHJvbWlzZUZvckNhY2hlO1xuXG4gICAgcmV0dXJuIGludGVyb3BDYWxsYmFja1JldHVybihwcm9taXNlRm9yQ2FjaGUsIGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgICAgIC8vIEluIGNhc2Ugb2YgdGhlIGNhY2hlIHJlcXVlc3QsIHJldHVybiB0aGUgb3JpZ2luYWwgdmFsdWVcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQucmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciByZXF1ZXN0ID0gZG9SZXF1ZXN0KGNsaWVudC5fcmVxdWVzdCwge1xuICAgIHVybDogaW5pdGlhbE9wdHMudXJsLFxuICAgIG1ldGhvZDogaW5pdGlhbE9wdHMubWV0aG9kLFxuICAgIGJvZHk6IGJvZHksXG4gICAganNvbkJvZHk6IGluaXRpYWxPcHRzLmJvZHksXG4gICAgdGltZW91dHM6IGNsaWVudC5fZ2V0VGltZW91dHNGb3JSZXF1ZXN0KGluaXRpYWxPcHRzLmhvc3RUeXBlKSxcbiAgICBmb3JjZUF1dGhIZWFkZXJzOiBpbml0aWFsT3B0cy5mb3JjZUF1dGhIZWFkZXJzLFxuICB9KTtcblxuICBpZiAoY2xpZW50Ll91c2VDYWNoZSAmJiBjbGllbnQuX3VzZVJlcXVlc3RDYWNoZSAmJiBjYWNoZSkge1xuICAgIGNhY2hlW2NhY2hlSURdID0gcmVxdWVzdDtcbiAgfVxuXG4gIHJldHVybiBpbnRlcm9wQ2FsbGJhY2tSZXR1cm4ocmVxdWVzdCwgZnVuY3Rpb24oY29udGVudCkge1xuICAgIC8vIEluIGNhc2Ugb2YgdGhlIGZpcnN0IHJlcXVlc3QsIHJldHVybiB0aGUgSlNPTiB2YWx1ZVxuICAgIHJldHVybiBjb250ZW50LmJvZHk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gc2VhcmNoIHBhcmFtIG9iamVjdCBpbiBxdWVyeSBzdHJpbmdcbiAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzIGFyZ3VtZW50cyB0byBhZGQgdG8gdGhlIGN1cnJlbnQgcXVlcnkgc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1zIGN1cnJlbnQgcXVlcnkgc3RyaW5nXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBmaW5hbCBxdWVyeSBzdHJpbmdcbiAqL1xuQ2xpbmlhU2VhcmNoQ29yZS5wcm90b3R5cGUuX2dldFNlYXJjaFBhcmFtcyA9IGZ1bmN0aW9uKGFyZ3MsIHBhcmFtcykge1xuICBpZiAoYXJncyA9PT0gdW5kZWZpbmVkIHx8IGFyZ3MgPT09IG51bGwpIHtcbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG5cbiAgaWYgKGFyZ0NoZWNrLmlzTm90TnVsbE9yVW5kZWZpbmVkKGFyZ3MucGFnZSkgJiYgdHlwZW9mIGFyZ3MucGFnZSAhPT0gJ251bWJlcicpIHtcbiAgICBsb2dnZXIud2FybignSWdub3Jpbmcgc2VhcmNoIHF1ZXJ5IHBhcmFtZXRlciBgcGFnZWAuIE11c3QgYmUgYSBudW1iZXIuJylcbiAgICBkZWxldGUgYXJncy5wYWdlXG4gIH1cblxuICBpZiAoYXJnQ2hlY2suaXNOb3ROdWxsT3JVbmRlZmluZWQoYXJncy5wZXJQYWdlKSAmJiB0eXBlb2YgYXJncy5wZXJQYWdlICE9PSAnbnVtYmVyJykge1xuICAgIGxvZ2dlci53YXJuKCdJZ25vcmluZyBzZWFyY2ggcXVlcnkgcGFyYW1ldGVyIGBwZXJQYWdlYC4gTXVzdCBiZSBhIG51bWJlci4nKVxuICAgIGRlbGV0ZSBhcmdzLnBlclBhZ2VcbiAgfVxuXG4gIGlmIChhcmdDaGVjay5pc05vdE51bGxPclVuZGVmaW5lZChhcmdzLmZpbHRlcnMpKSB7XG4gICAgaWYgKCh0eXBlb2YgYXJncy5maWx0ZXJzICE9PSAnb2JqZWN0JyB8fCBpc0FycmF5KGFyZ3MuZmlsdGVycykpKSB7XG4gICAgICBsb2dnZXIud2FybignSWdub3Jpbmcgc2VhcmNoIHF1ZXJ5IHBhcmFtZXRlciBgZmlsdGVyc2AuIE11c3QgYmUgYW4gb2JqZWN0LicpXG4gICAgICBkZWxldGUgYXJncy5maWx0ZXJzXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhcmdDaGVjay5pc05vdE51bGxPclVuZGVmaW5lZChhcmdzLmZpbHRlcnMudHlwZXMpICYmICFpc0FycmF5KGFyZ3MuZmlsdGVycy50eXBlcykpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nIHNlYXJjaCBxdWVyeSBwYXJhbWV0ZXIgYGZpbHRlcnMudHlwZXNgLiBNdXN0IGJlIGFuIGFycmF5LicpXG4gICAgICAgIGRlbGV0ZSBhcmdzLmZpbHRlcnMudHlwZXNcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ0NoZWNrLmlzTm90TnVsbE9yVW5kZWZpbmVkKGFyZ3MuZmlsdGVycy5ob3VycykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmdzLmZpbHRlcnMuaG91cnMgIT09ICdvYmplY3QnIHx8IGlzQXJyYXkoYXJncy5maWx0ZXJzLmhvdXJzKSkge1xuICAgICAgICAgIGxvZ2dlci53YXJuKCdJZ25vcmluZyBzZWFyY2ggcXVlcnkgcGFyYW1ldGVyIGBmaWx0ZXJzLmhvdXJzYC4gTXVzdCBiZSBhbiBvYmplY3QuJylcbiAgICAgICAgICBkZWxldGUgYXJncy5maWx0ZXJzLmhvdXJzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGFyZ0NoZWNrLmlzTm90TnVsbE9yVW5kZWZpbmVkKGFyZ3MuZmlsdGVycy5ob3Vycy5vZmZzZXQpICYmIHR5cGVvZiBhcmdzLmZpbHRlcnMuaG91cnMub2Zmc2V0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nIHNlYXJjaCBxdWVyeSBwYXJhbWV0ZXIgYGZpbHRlcnMuaG91cnMub2Zmc2V0YC4gTXVzdCBiZSBhIG51bWJlci4nKVxuICAgICAgICAgICAgZGVsZXRlIGFyZ3MuZmlsdGVycy5ob3Vycy5vZmZzZXRcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYXJnQ2hlY2suaXNOb3ROdWxsT3JVbmRlZmluZWQoYXJncy5maWx0ZXJzLmhvdXJzLnZhbHVlcykgJiYgIWlzQXJyYXkoYXJncy5maWx0ZXJzLmhvdXJzLnZhbHVlcykpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKCdJZ25vcmluZyBzZWFyY2ggcXVlcnkgcGFyYW1ldGVyIGBmaWx0ZXJzLmhvdXJzLnZhbHVlc2AuIE11c3QgYmUgYW4gYXJyYXkuJylcbiAgICAgICAgICAgIGRlbGV0ZSBhcmdzLmZpbHRlcnMuaG91cnMudmFsdWVzXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdDaGVjay5pc05vdE51bGxPclVuZGVmaW5lZChhcmdzLmZpbHRlcnMuZ2VvKSAmJiB0eXBlb2YgYXJncy5maWx0ZXJzLmdlbyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ0lnbm9yaW5nIHNlYXJjaCBxdWVyeSBwYXJhbWV0ZXIgYGZpbHRlcnMuZ2VvYC4gTXVzdCBiZSBhIHN0cmluZy4nKVxuICAgICAgICBkZWxldGUgYXJncy5maWx0ZXJzLmdlb1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChhcmdDaGVjay5pc05vdE51bGxPclVuZGVmaW5lZChhcmdzLnF1ZXJ5VHlwZXMpICYmICFpc0FycmF5KGFyZ3MucXVlcnlUeXBlcykpIHtcbiAgICBsb2dnZXIud2FybignSWdub3Jpbmcgc2VhcmNoIHF1ZXJ5IHBhcmFtZXRlciBgcXVlcnlUeXBlc2AuIE11c3QgYmUgYW4gYXJyYXkuJylcbiAgICBkZWxldGUgYXJncy5xdWVyeVR5cGVzXG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gYXJncykge1xuICAgIGlmIChrZXkgIT09IG51bGwgJiYgYXJnc1trZXldICE9PSB1bmRlZmluZWQgJiYgYXJncy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBwYXJhbXNba2V5XSA9IGFyZ3Nba2V5XVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJhbXNcbn07XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgaGVhZGVycyBmb3IgYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIFtzdHJpbmddIG9wdGlvbnMuYWRkaXRpb25hbFVBIHNlbWktY29sb24gc2VwYXJhdGVkIHN0cmluZyB3aXRoIG90aGVyIHVzZXIgYWdlbnRzIHRvIGFkZFxuICogQHBhcmFtIFtib29sZWFuPXRydWVdIG9wdGlvbnMud2l0aEFwaUtleSBTZW5kIHRoZSBhcGkga2V5IGFzIGEgaGVhZGVyXG4gKiBAcGFyYW0gW09iamVjdF0gb3B0aW9ucy5oZWFkZXJzIEV4dHJhIGhlYWRlcnMgdG8gc2VuZFxuICovXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5fY29tcHV0ZVJlcXVlc3RIZWFkZXJzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgZm9yRWFjaCA9IHJlcXVpcmUoJ2ZvcmVhY2gnKTtcblxuICB2YXIgdWEgPSBvcHRpb25zLmFkZGl0aW9uYWxVQVxuICAgID8gdGhpcy5fdWEgKyAnOyAnICsgb3B0aW9ucy5hZGRpdGlvbmFsVUFcbiAgICA6IHRoaXMuX3VhO1xuXG4gIHZhciByZXF1ZXN0SGVhZGVycyA9IHtcbiAgICAneC1jbGluaWEtYWdlbnQnOiB1YSxcbiAgICAneC1jbGluaWEtYXBwbGljYXRpb24taWQnOiB0aGlzLmFwcGxpY2F0aW9uSUQsXG4gIH07XG5cbiAgLy8gYnJvd3NlciB3aWxsIGlubGluZSBoZWFkZXJzIGluIHRoZSB1cmwsIG5vZGUuanMgd2lsbCB1c2UgaHR0cCBoZWFkZXJzXG4gIC8vIGJ1dCBpbiBzb21lIHNpdHVhdGlvbnMsIHRoZSBBUEkgS0VZIHdpbGwgYmUgdG9vIGxvbmcgKGJpZyBzZWN1cmVkIEFQSSBrZXlzKVxuICAvLyBzbyBpZiB0aGUgcmVxdWVzdCBpcyBhIFBPU1QgYW5kIHRoZSBLRVkgaXMgdmVyeSBsb25nLCB3ZSB3aWxsIGJlIGFza2VkIHRvIG5vdCBwdXRcbiAgLy8gaXQgaW50byBoZWFkZXJzIGJ1dCBpbiB0aGUgSlNPTiBib2R5XG4gIGlmIChvcHRpb25zLndpdGhBcGlLZXkgIT09IGZhbHNlKSB7XG4gICAgcmVxdWVzdEhlYWRlcnNbJ3gtY2xpbmlhLWFwaS1rZXknXSA9IHRoaXMuYXBpS2V5O1xuICB9XG5cbiAgaWYgKHRoaXMudXNlclRva2VuKSB7XG4gICAgcmVxdWVzdEhlYWRlcnNbJ3gtY2xpbmlhLXVzZXJ0b2tlbiddID0gdGhpcy51c2VyVG9rZW47XG4gIH1cblxuICBpZiAodGhpcy5zZWN1cml0eVRhZ3MpIHtcbiAgICByZXF1ZXN0SGVhZGVyc1sneC1jbGluaWEtdGFnZmlsdGVycyddID0gdGhpcy5zZWN1cml0eVRhZ3M7XG4gIH1cblxuICBmb3JFYWNoKHRoaXMuZXh0cmFIZWFkZXJzLCBmdW5jdGlvbiBhZGRUb1JlcXVlc3RIZWFkZXJzKHZhbHVlLCBrZXkpIHtcbiAgICByZXF1ZXN0SGVhZGVyc1trZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIGlmIChvcHRpb25zLmhlYWRlcnMpIHtcbiAgICBmb3JFYWNoKG9wdGlvbnMuaGVhZGVycywgZnVuY3Rpb24gYWRkVG9SZXF1ZXN0SGVhZGVycyh2YWx1ZSwga2V5KSB7XG4gICAgICByZXF1ZXN0SGVhZGVyc1trZXldID0gdmFsdWU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVxdWVzdEhlYWRlcnM7XG59O1xuXG4vKipcbiAqIFNlYXJjaCB0aHJvdWdoIG11bHRpcGxlIGluZGljZXMgYXQgdGhlIHNhbWUgdGltZVxuICogQHBhcmFtICB7T2JqZWN0W119ICAgcXVlcmllcyAgQW4gYXJyYXkgb2YgcXVlcmllcyB5b3Ugd2FudCB0byBydW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gcXVlcmllc1tdLmluZGV4TmFtZSBUaGUgaW5kZXggbmFtZSB5b3Ugd2FudCB0byB0YXJnZXRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcXVlcmllc1tdLnF1ZXJ5XSBUaGUgcXVlcnkgdG8gaXNzdWUgb24gdGhpcyBpbmRleC4gQ2FuIGFsc28gYmUgcGFzc2VkIGludG8gYHBhcmFtc2BcbiAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyaWVzW10ucGFyYW1zIEFueSBzZWFyY2ggcGFyYW0gbGlrZSBoaXRzUGVyUGFnZSwgLi5cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBiZSBjYWxsZWRcbiAqIEByZXR1cm4ge1Byb21pc2V8dW5kZWZpbmVkfSBSZXR1cm5zIGEgcHJvbWlzZSBpZiBubyBjYWxsYmFjayBnaXZlblxuICovXG5cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLnNlYXJjaCA9IGJ1aWxkU2VhcmNoTWV0aG9kKHRydWUpXG5cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLl9zZWFyY2ggPSBmdW5jdGlvbihwYXJhbXMsIHVybCwgY2FsbGJhY2ssIGFkZGl0aW9uYWxVQSkge1xuICAvLyBUT0RPIDogVGhpcyBpcyBhIHdvcmthcm91bmQgdG8gc2ltdWxhdGUgdGhlIGRpZmZlcmVudCBpbmRleCBlbmRwb2ludC5cbiAgcGFyYW1zLmRvY3VtZW50VHlwZXMgPSBbJ2hlYWx0aF9mYWNpbGl0eScsICdwcm9mZXNzaW9uYWwnXVxuICB2YXIgdGVtcFVybCA9ICcvc2VhcmNoL3YxL3NlYXJjaCdcbiAgLy8gdmFyIHJlYWxVcmwgPSAnL3NlYXJjaC92MS8qJ1xuICByZXR1cm4gdGhpcy5fanNvblJlcXVlc3Qoe1xuICAgIGNhY2hlOiB0aGlzLmNhY2hlLFxuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogdXJsIHx8IHRlbXBVcmwsXG4gICAgYm9keTogcGFyYW1zLFxuICAgIGhvc3RUeXBlOiAncmVhZCcsXG4gICAgZmFsbGJhY2s6IHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmw6IHVybCB8fCB0ZW1wVXJsLFxuICAgICAgYm9keTogcGFyYW1zLFxuICAgIH0sXG4gICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICB9KTtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBleHRyYSBzZWN1cml0eSB0YWdGaWx0ZXJzIGhlYWRlclxuICogQHBhcmFtIHtzdHJpbmd8YXJyYXl9IHRhZ3MgVGhlIGxpc3Qgb2YgdGFncyBkZWZpbmluZyB0aGUgY3VycmVudCBzZWN1cml0eSBmaWx0ZXJzXG4gKi9cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLnNldFNlY3VyaXR5VGFncyA9IGZ1bmN0aW9uKHRhZ3MpIHtcbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0YWdzKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgIHZhciBzdHJUYWdzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWdzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRhZ3NbaV0pID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgIHZhciBvcmVkVGFncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRhZ3NbaV0ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICBvcmVkVGFncy5wdXNoKHRhZ3NbaV1bal0pO1xuICAgICAgICB9XG4gICAgICAgIHN0clRhZ3MucHVzaCgnKCcgKyBvcmVkVGFncy5qb2luKCcsJykgKyAnKScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyVGFncy5wdXNoKHRhZ3NbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0YWdzID0gc3RyVGFncy5qb2luKCcsJyk7XG4gIH1cblxuICB0aGlzLnNlY3VyaXR5VGFncyA9IHRhZ3M7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgZXh0cmEgdXNlciB0b2tlbiBoZWFkZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSB1c2VyVG9rZW4gVGhlIHRva2VuIGlkZW50aWZ5aW5nIGEgdW5pcSB1c2VyICh1c2VkIHRvIGFwcGx5IHJhdGUgbGltaXRzKVxuICovXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5zZXRVc2VyVG9rZW4gPSBmdW5jdGlvbih1c2VyVG9rZW4pIHtcbiAgdGhpcy51c2VyVG9rZW4gPSB1c2VyVG9rZW47XG59O1xuXG4vKipcbiAqIENsZWFyIGFsbCBxdWVyaWVzIGluIGNsaWVudCdzIGNhY2hlXG4gKiBAcmV0dXJuIHVuZGVmaW5lZFxuICovXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2FjaGUgPSB7fTtcbn07XG5cbi8qKlxuICogU2V0IHRoZSB0aHJlZSBkaWZmZXJlbnQgKGNvbm5lY3QsIHJlYWQsIHdyaXRlKSB0aW1lb3V0cyB0byBiZSB1c2VkIHdoZW4gcmVxdWVzdGluZ1xuICogQHBhcmFtIHtPYmplY3R9IHRpbWVvdXRzXG4gKi9cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLnNldFRpbWVvdXRzID0gZnVuY3Rpb24odGltZW91dHMpIHtcbiAgdGhpcy5fdGltZW91dHMgPSB0aW1lb3V0cztcbn07XG5cbi8qKlxuICogR2V0IHRoZSB0aHJlZSBkaWZmZXJlbnQgKGNvbm5lY3QsIHJlYWQsIHdyaXRlKSB0aW1lb3V0cyB0byBiZSB1c2VkIHdoZW4gcmVxdWVzdGluZ1xuICogQHBhcmFtIHtPYmplY3R9IHRpbWVvdXRzXG4gKi9cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLmdldFRpbWVvdXRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl90aW1lb3V0cztcbn07XG5cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLl9nZXRBcHBJZERhdGEgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGRhdGEgPSBzdG9yZS5nZXQodGhpcy5hcHBsaWNhdGlvbklEKTtcbiAgaWYgKGRhdGEgIT09IG51bGwpIHRoaXMuX2NhY2hlQXBwSWREYXRhKGRhdGEpO1xuICByZXR1cm4gZGF0YTtcbn07XG5cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLl9zZXRBcHBJZERhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gIGRhdGEubGFzdENoYW5nZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB0aGlzLl9jYWNoZUFwcElkRGF0YShkYXRhKTtcbiAgcmV0dXJuIHN0b3JlLnNldCh0aGlzLmFwcGxpY2F0aW9uSUQsIGRhdGEpO1xufTtcblxuQ2xpbmlhU2VhcmNoQ29yZS5wcm90b3R5cGUuX2NoZWNrQXBwSWREYXRhID0gZnVuY3Rpb24oKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fZ2V0QXBwSWREYXRhKCk7XG4gIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgaWYgKGRhdGEgPT09IG51bGwgfHwgbm93IC0gZGF0YS5sYXN0Q2hhbmdlID4gUkVTRVRfQVBQX0RBVEFfVElNRVIpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzZXRJbml0aWFsQXBwSWREYXRhKGRhdGEpO1xuICB9XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5fcmVzZXRJbml0aWFsQXBwSWREYXRhID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgbmV3RGF0YSA9IGRhdGEgfHwge307XG4gIG5ld0RhdGEuaG9zdEluZGV4ZXMgPSB7IHJlYWQ6IDAsIHdyaXRlOiAwIH07XG4gIG5ld0RhdGEudGltZW91dE11bHRpcGxpZXIgPSAxO1xuICBuZXdEYXRhLnNodWZmbGVSZXN1bHQgPSBuZXdEYXRhLnNodWZmbGVSZXN1bHQgfHwgc2h1ZmZsZShbMSwgMiwgM10pO1xuICByZXR1cm4gdGhpcy5fc2V0QXBwSWREYXRhKG5ld0RhdGEpO1xufTtcblxuQ2xpbmlhU2VhcmNoQ29yZS5wcm90b3R5cGUuX2NhY2hlQXBwSWREYXRhID0gZnVuY3Rpb24oZGF0YSkge1xuICB0aGlzLl9ob3N0SW5kZXhlcyA9IGRhdGEuaG9zdEluZGV4ZXM7XG4gIHRoaXMuX3RpbWVvdXRNdWx0aXBsaWVyID0gZGF0YS50aW1lb3V0TXVsdGlwbGllcjtcbiAgdGhpcy5fc2h1ZmZsZVJlc3VsdCA9IGRhdGEuc2h1ZmZsZVJlc3VsdDtcbn07XG5cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLl9wYXJ0aWFsQXBwSWREYXRhVXBkYXRlID0gZnVuY3Rpb24obmV3RGF0YSkge1xuICB2YXIgZm9yZWFjaCA9IHJlcXVpcmUoJ2ZvcmVhY2gnKTtcbiAgdmFyIGN1cnJlbnREYXRhID0gdGhpcy5fZ2V0QXBwSWREYXRhKCk7XG4gIGZvcmVhY2gobmV3RGF0YSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIGN1cnJlbnREYXRhW2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXMuX3NldEFwcElkRGF0YShjdXJyZW50RGF0YSk7XG59O1xuXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5fZ2V0SG9zdEJ5VHlwZSA9IGZ1bmN0aW9uKGhvc3RUeXBlKSB7XG4gIHJldHVybiB0aGlzLmhvc3RzW2hvc3RUeXBlXVt0aGlzLl9nZXRIb3N0SW5kZXhCeVR5cGUoaG9zdFR5cGUpXTtcbn07XG5cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLl9nZXRUaW1lb3V0TXVsdGlwbGllciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fdGltZW91dE11bHRpcGxpZXI7XG59O1xuXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5fZ2V0SG9zdEluZGV4QnlUeXBlID0gZnVuY3Rpb24oaG9zdFR5cGUpIHtcbiAgcmV0dXJuIHRoaXMuX2hvc3RJbmRleGVzW2hvc3RUeXBlXTtcbn07XG5cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLl9zZXRIb3N0SW5kZXhCeVR5cGUgPSBmdW5jdGlvbihob3N0SW5kZXgsIGhvc3RUeXBlKSB7XG4gIHZhciBjbG9uZSA9IHJlcXVpcmUoJy4vY2xvbmUnKTtcbiAgdmFyIG5ld0hvc3RJbmRleGVzID0gY2xvbmUodGhpcy5faG9zdEluZGV4ZXMpO1xuICBuZXdIb3N0SW5kZXhlc1tob3N0VHlwZV0gPSBob3N0SW5kZXg7XG4gIHRoaXMuX3BhcnRpYWxBcHBJZERhdGFVcGRhdGUoeyBob3N0SW5kZXhlczogbmV3SG9zdEluZGV4ZXMgfSk7XG4gIHJldHVybiBob3N0SW5kZXg7XG59O1xuXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5faW5jcmVtZW50SG9zdEluZGV4ID0gZnVuY3Rpb24oaG9zdFR5cGUpIHtcbiAgcmV0dXJuIHRoaXMuX3NldEhvc3RJbmRleEJ5VHlwZShcbiAgICAodGhpcy5fZ2V0SG9zdEluZGV4QnlUeXBlKGhvc3RUeXBlKSArIDEpICUgdGhpcy5ob3N0c1tob3N0VHlwZV0ubGVuZ3RoLFxuICAgIGhvc3RUeXBlXG4gICk7XG59O1xuXG5DbGluaWFTZWFyY2hDb3JlLnByb3RvdHlwZS5faW5jcmVtZW50VGltZW91dE11bHRpcGxlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdGltZW91dE11bHRpcGxpZXIgPSBNYXRoLm1heCh0aGlzLl90aW1lb3V0TXVsdGlwbGllciArIDEsIDQpO1xuICByZXR1cm4gdGhpcy5fcGFydGlhbEFwcElkRGF0YVVwZGF0ZSh7IHRpbWVvdXRNdWx0aXBsaWVyOiB0aW1lb3V0TXVsdGlwbGllciB9KTtcbn07XG5cbkNsaW5pYVNlYXJjaENvcmUucHJvdG90eXBlLl9nZXRUaW1lb3V0c0ZvclJlcXVlc3QgPSBmdW5jdGlvbihob3N0VHlwZSkge1xuICByZXR1cm4ge1xuICAgIGNvbm5lY3Q6IHRoaXMuX3RpbWVvdXRzLmNvbm5lY3QgKiB0aGlzLl90aW1lb3V0TXVsdGlwbGllcixcbiAgICBjb21wbGV0ZTogdGhpcy5fdGltZW91dHNbaG9zdFR5cGVdICogdGhpcy5fdGltZW91dE11bHRpcGxpZXIsXG4gIH07XG59O1xuXG5mdW5jdGlvbiBwcmVwYXJlSG9zdChwcm90b2NvbCkge1xuICByZXR1cm4gZnVuY3Rpb24gcHJlcGFyZShob3N0KSB7XG4gICAgcmV0dXJuIHByb3RvY29sICsgJy8vJyArIGhvc3QudG9Mb3dlckNhc2UoKTtcbiAgfTtcbn1cblxuLy8gUHJvdG90eXBlLmpzIDwgMS43LCBhIHdpZGVseSB1c2VkIGxpYnJhcnksIGRlZmluZXMgYSB3ZWlyZFxuLy8gQXJyYXkucHJvdG90eXBlLnRvSlNPTiBmdW5jdGlvbiB0aGF0IHdpbGwgZmFpbCB0byBzdHJpbmdpZnkgb3VyIGNvbnRlbnRcbi8vIGFwcHJvcHJpYXRlbHlcbi8vIHJlZnM6XG4vLyAgIC0gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3Byb3RvdHlwZS1jb3JlL0UtU0FWdlZfVjlRXG4vLyAgIC0gaHR0cHM6Ly9naXRodWIuY29tL3NzdGVwaGVuc29uL3Byb3RvdHlwZS9jb21taXQvMDM4YTI5ODVhNzA1OTNjMWE4NmMyMzBmYWRiZGZlMmU0ODk4YTQ4Y1xuLy8gICAtIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMxNDg0NDEvMTQ3MDc5XG5mdW5jdGlvbiBzYWZlSlNPTlN0cmluZ2lmeShvYmopIHtcbiAgLyogZXNsaW50IG5vLWV4dGVuZC1uYXRpdmU6MCAqL1xuXG4gIGlmIChBcnJheS5wcm90b3R5cGUudG9KU09OID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqKTtcbiAgfVxuXG4gIHZhciB0b0pTT04gPSBBcnJheS5wcm90b3R5cGUudG9KU09OO1xuICBkZWxldGUgQXJyYXkucHJvdG90eXBlLnRvSlNPTjtcbiAgdmFyIG91dCA9IEpTT04uc3RyaW5naWZ5KG9iaik7XG4gIEFycmF5LnByb3RvdHlwZS50b0pTT04gPSB0b0pTT047XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gc2h1ZmZsZShhcnJheSkge1xuICB2YXIgY3VycmVudEluZGV4ID0gYXJyYXkubGVuZ3RoO1xuICB2YXIgdGVtcG9yYXJ5VmFsdWU7XG4gIHZhciByYW5kb21JbmRleDtcblxuICAvLyBXaGlsZSB0aGVyZSByZW1haW4gZWxlbWVudHMgdG8gc2h1ZmZsZS4uLlxuICB3aGlsZSAoY3VycmVudEluZGV4ICE9PSAwKSB7XG4gICAgLy8gUGljayBhIHJlbWFpbmluZyBlbGVtZW50Li4uXG4gICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjdXJyZW50SW5kZXgpO1xuICAgIGN1cnJlbnRJbmRleCAtPSAxO1xuXG4gICAgLy8gQW5kIHN3YXAgaXQgd2l0aCB0aGUgY3VycmVudCBlbGVtZW50LlxuICAgIHRlbXBvcmFyeVZhbHVlID0gYXJyYXlbY3VycmVudEluZGV4XTtcbiAgICBhcnJheVtjdXJyZW50SW5kZXhdID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xuICAgIGFycmF5W3JhbmRvbUluZGV4XSA9IHRlbXBvcmFyeVZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5mdW5jdGlvbiByZW1vdmVDcmVkZW50aWFscyhoZWFkZXJzKSB7XG4gIHZhciBuZXdIZWFkZXJzID0ge307XG5cbiAgZm9yICh2YXIgaGVhZGVyTmFtZSBpbiBoZWFkZXJzKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChoZWFkZXJzLCBoZWFkZXJOYW1lKSkge1xuICAgICAgdmFyIHZhbHVlO1xuXG4gICAgICBpZiAoXG4gICAgICAgIGhlYWRlck5hbWUgPT09ICd4LWNsaW5pYS1hcGkta2V5JyB8fFxuICAgICAgICBoZWFkZXJOYW1lID09PSAneC1jbGluaWEtYXBwbGljYXRpb24taWQnXG4gICAgICApIHtcbiAgICAgICAgdmFsdWUgPSAnKipoaWRkZW4gZm9yIHNlY3VyaXR5IHB1cnBvc2VzKionO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBoZWFkZXJzW2hlYWRlck5hbWVdO1xuICAgICAgfVxuXG4gICAgICBuZXdIZWFkZXJzW2hlYWRlck5hbWVdID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ld0hlYWRlcnM7XG59XG4iLCJ2YXIgYnVpbGRTZWFyY2hNZXRob2QgPSByZXF1aXJlKCcuL2J1aWxkU2VhcmNoTWV0aG9kLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW5kZXhDb3JlO1xuXG4vKlxuICogSW5kZXggY2xhc3MgY29uc3RydWN0b3IuXG4gKiBZb3Ugc2hvdWxkIG5vdCB1c2UgdGhpcyBtZXRob2QgZGlyZWN0bHkgYnV0IHVzZSBpbml0SW5kZXgoKSBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBJbmRleENvcmUoY2xpbmlhc2VhcmNoLCBpbmRleE5hbWUpIHtcbiAgdGhpcy5pbmRleE5hbWUgPSBpbmRleE5hbWU7XG4gIHRoaXMuYXMgPSBjbGluaWFzZWFyY2g7XG4gIHRoaXMudHlwZUFoZWFkQXJncyA9IG51bGw7XG4gIHRoaXMudHlwZUFoZWFkVmFsdWVPcHRpb24gPSBudWxsO1xuXG4gIC8vIG1ha2Ugc3VyZSBldmVyeSBpbmRleCBpbnN0YW5jZSBoYXMgaXQncyBvd24gY2FjaGVcbiAgdGhpcy5jYWNoZSA9IHt9O1xufVxuXG4vKlxuICogQ2xlYXIgYWxsIHF1ZXJpZXMgaW4gY2FjaGVcbiAqL1xuSW5kZXhDb3JlLnByb3RvdHlwZS5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2FjaGUgPSB7fTtcbn07XG5cbi8qKlxuICogU2VhcmNoIGluc2lkZSB0aGUgaW5kZXggdXNpbmcgWE1MSHR0cFJlcXVlc3QgcmVxdWVzdCAoVXNpbmcgYSBQT1NUIHF1ZXJ5IHRvXG4gKiBtaW5pbWl6ZSBudW1iZXIgb2YgT1BUSU9OUyBxdWVyaWVzOiBDcm9zcy1PcmlnaW4gUmVzb3VyY2UgU2hhcmluZykuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IFthcmdzXSBjb250YWlucyBhbiBvYmplY3Qgd2l0aCBxdWVyeSBwYXJhbWV0ZXJzXG4gKiAtIFRPRE9cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYWxsYmFja10gdGhlIHJlc3VsdCBjYWxsYmFjayBjYWxsZWQgd2l0aCB0d28gYXJndW1lbnRzOlxuICogIGVycm9yOiBudWxsIG9yIEVycm9yKCdtZXNzYWdlJykuIElmIGZhbHNlLCB0aGUgY29udGVudCBjb250YWlucyB0aGUgZXJyb3IuXG4gKiAgY29udGVudDogdGhlIHNlcnZlciBhbnN3ZXIgdGhhdCBjb250YWlucyB0aGUgbGlzdCBvZiByZXN1bHRzLlxuICovXG5JbmRleENvcmUucHJvdG90eXBlLnNlYXJjaCA9IGJ1aWxkU2VhcmNoTWV0aG9kKGZhbHNlKVxuXG5JbmRleENvcmUucHJvdG90eXBlLl9zZWFyY2ggPSBmdW5jdGlvbihwYXJhbXMsIHVybCwgY2FsbGJhY2ssIGFkZGl0aW9uYWxVQSkge1xuICAvLyBUT0RPIDogVGhpcyBpcyBhIHdvcmthcm91bmQgdG8gc2ltdWxhdGUgdGhlIGRpZmZlcmVudCBpbmRleCBlbmRwb2ludC5cbiAgcGFyYW1zLmRvY3VtZW50VHlwZXMgPSBbdGhpcy5pbmRleE5hbWVdXG4gIHZhciB0ZW1wVXJsID0gJy9zZWFyY2gvdjEvc2VhcmNoJ1xuICAvLyB2YXIgcmVhbFVybCA9ICcvc2VhcmNoL3YxLycrdGhpcy5pbmRleE5hbWVcbiAgcmV0dXJuIHRoaXMuYXMuX2pzb25SZXF1ZXN0KHtcbiAgICBjYWNoZTogdGhpcy5jYWNoZSxcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IHVybCB8fCB0ZW1wVXJsLFxuICAgIGJvZHk6IHBhcmFtcyxcbiAgICBob3N0VHlwZTogJ3JlYWQnLFxuICAgIGZhbGxiYWNrOiB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJsOiB1cmwgfHwgdGVtcFVybCxcbiAgICAgIGJvZHk6IHBhcmFtcyxcbiAgICB9LFxuICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICBhZGRpdGlvbmFsVUE6IGFkZGl0aW9uYWxVQSxcbiAgfSk7XG59O1xuXG5JbmRleENvcmUucHJvdG90eXBlLmFzID0gbnVsbDtcbkluZGV4Q29yZS5wcm90b3R5cGUuaW5kZXhOYW1lID0gbnVsbDtcbkluZGV4Q29yZS5wcm90b3R5cGUudHlwZUFoZWFkQXJncyA9IG51bGw7XG5JbmRleENvcmUucHJvdG90eXBlLnR5cGVBaGVhZFZhbHVlT3B0aW9uID0gbnVsbDtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpc051bGxPclVuZGVmaW5lZCxcbiAgaXNOb3ROdWxsT3JVbmRlZmluZWQsXG4gIGlzRW1wdHlcbn07XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB1bmRlZmluZWQgfHwgYXJnID09PSBudWxsXG59O1xuXG5mdW5jdGlvbiBpc05vdE51bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuICFpc051bGxPclVuZGVmaW5lZChhcmcpXG59O1xuXG5mdW5jdGlvbiBpc0VtcHR5KGFyZykge1xuICBmb3IodmFyIGtleSBpbiBhcmcpIHtcbiAgICBpZiAoa2V5ICE9PSBudWxsICYmIGFyZ1trZXldICE9PSB1bmRlZmluZWQgJiYgYXJnLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWwgPSByZXF1aXJlKCdnbG9iYWwnKTtcbnZhciBQcm9taXNlID0gZ2xvYmFsLlByb21pc2UgfHwgcmVxdWlyZSgnZXM2LXByb21pc2UnKS5Qcm9taXNlO1xuXG4vLyBUaGlzIGlzIHRoZSBzdGFuZGFsb25lIGJyb3dzZXIgYnVpbGQgZW50cnkgcG9pbnRcbi8vIEJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgdGhlIENsaW5pYSBTZWFyY2ggSmF2YVNjcmlwdCBjbGllbnQsXG4vLyB1c2luZyBYTUxIdHRwUmVxdWVzdCwgWERvbWFpblJlcXVlc3QgYW5kIEpTT05QIGFzIGZhbGxiYWNrXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUNsaW5pYXNlYXJjaChDbGluaWFTZWFyY2gsIHVhU3VmZml4KSB7XG4gIHZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG4gIHZhciBlcnJvcnMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcbiAgdmFyIGlubGluZUhlYWRlcnMgPSByZXF1aXJlKCcuL2lubGluZS1oZWFkZXJzJyk7XG4gIHZhciBqc29ucFJlcXVlc3QgPSByZXF1aXJlKCcuL2pzb25wLXJlcXVlc3QnKTtcbiAgdmFyIHBsYWNlcyA9IHJlcXVpcmUoJy4uL3BsYWNlcy5qcycpO1xuICB1YVN1ZmZpeCA9IHVhU3VmZml4IHx8ICcnO1xuXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RlYnVnJykge1xuICAgIHJlcXVpcmUoJ2RlYnVnJykuZW5hYmxlKCdjbGluaWFzZWFyY2gqJyk7XG4gIH1cblxuICBmdW5jdGlvbiBjbGluaWFzZWFyY2goYXBwbGljYXRpb25JRCwgYXBpS2V5LCBvcHRzKSB7XG4gICAgdmFyIGNsb25lRGVlcCA9IHJlcXVpcmUoJy4uL2Nsb25lLmpzJyk7XG5cbiAgICBvcHRzID0gY2xvbmVEZWVwKG9wdHMgfHwge30pO1xuXG4gICAgb3B0cy5fdWEgPSBvcHRzLl91YSB8fCBjbGluaWFzZWFyY2gudWE7XG5cbiAgICByZXR1cm4gbmV3IENsaW5pYVNlYXJjaEJyb3dzZXIoYXBwbGljYXRpb25JRCwgYXBpS2V5LCBvcHRzKTtcbiAgfVxuXG4gIGNsaW5pYXNlYXJjaC52ZXJzaW9uID0gcmVxdWlyZSgnLi4vdmVyc2lvbi5qcycpO1xuXG4gIGNsaW5pYXNlYXJjaC51YSA9XG4gICAgJ0NsaW5pYSBmb3IgSmF2YVNjcmlwdCAoJyArIGNsaW5pYXNlYXJjaC52ZXJzaW9uICsgJyk7ICcgKyB1YVN1ZmZpeDtcblxuICBjbGluaWFzZWFyY2guaW5pdFBsYWNlcyA9IHBsYWNlcyhjbGluaWFzZWFyY2gpO1xuXG4gIC8vIHdlIGV4cG9zZSBpbnRvIHdpbmRvdyBubyBtYXR0ZXIgaG93IHdlIGFyZSB1c2VkLCB0aGlzIHdpbGwgYWxsb3dcbiAgLy8gdXMgdG8gZWFzaWx5IGRlYnVnIGFueSB3ZWJzaXRlIHJ1bm5pbmcgY2xpbmlhXG4gIGdsb2JhbC5fX2NsaW5pYSA9IHtcbiAgICBkZWJ1ZzogcmVxdWlyZSgnZGVidWcnKSxcbiAgICBjbGluaWFzZWFyY2g6IGNsaW5pYXNlYXJjaCxcbiAgfTtcblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBoYXNYTUxIdHRwUmVxdWVzdDogJ1hNTEh0dHBSZXF1ZXN0JyBpbiBnbG9iYWwsXG4gICAgaGFzWERvbWFpblJlcXVlc3Q6ICdYRG9tYWluUmVxdWVzdCcgaW4gZ2xvYmFsLFxuICB9O1xuXG4gIGlmIChzdXBwb3J0Lmhhc1hNTEh0dHBSZXF1ZXN0KSB7XG4gICAgc3VwcG9ydC5jb3JzID0gJ3dpdGhDcmVkZW50aWFscycgaW4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIH1cblxuICBmdW5jdGlvbiBDbGluaWFTZWFyY2hCcm93c2VyKCkge1xuICAgIC8vIGNhbGwgQ2xpbmlhU2VhcmNoIGNvbnN0cnVjdG9yXG4gICAgQ2xpbmlhU2VhcmNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBpbmhlcml0cyhDbGluaWFTZWFyY2hCcm93c2VyLCBDbGluaWFTZWFyY2gpO1xuXG4gIENsaW5pYVNlYXJjaEJyb3dzZXIucHJvdG90eXBlLl9yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdCh1cmwsIG9wdHMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gd3JhcFJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAvLyBubyBjb3JzIG9yIFhEb21haW5SZXF1ZXN0LCBubyByZXF1ZXN0XG4gICAgICBpZiAoIXN1cHBvcnQuY29ycyAmJiAhc3VwcG9ydC5oYXNYRG9tYWluUmVxdWVzdCkge1xuICAgICAgICAvLyB2ZXJ5IG9sZCBicm93c2VyLCBub3Qgc3VwcG9ydGVkXG4gICAgICAgIHJlamVjdChuZXcgZXJyb3JzLk5ldHdvcmsoJ0NPUlMgbm90IHN1cHBvcnRlZCcpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB1cmwgPSBpbmxpbmVIZWFkZXJzKHVybCwgb3B0cy5oZWFkZXJzKTtcblxuICAgICAgdmFyIGJvZHkgPSBvcHRzLmJvZHk7XG4gICAgICB2YXIgcmVxID0gc3VwcG9ydC5jb3JzID8gbmV3IFhNTEh0dHBSZXF1ZXN0KCkgOiBuZXcgWERvbWFpblJlcXVlc3QoKTtcbiAgICAgIHZhciByZXFUaW1lb3V0O1xuICAgICAgdmFyIHRpbWVkT3V0O1xuICAgICAgdmFyIGNvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgICByZXFUaW1lb3V0ID0gc2V0VGltZW91dChvblRpbWVvdXQsIG9wdHMudGltZW91dHMuY29ubmVjdCk7XG4gICAgICAvLyB3ZSBzZXQgYW4gZW1wdHkgb25wcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgLy8gc28gdGhhdCBYRG9tYWluUmVxdWVzdCBvbiBJRTkgaXMgbm90IGFib3J0ZWRcbiAgICAgIC8vIHJlZnM6XG4gICAgICAvLyAgLSBodHRwczovL3NvY2lhbC5tc2RuLm1pY3Jvc29mdC5jb20vRm9ydW1zL2llL2VuLVVTLzMwZWYzYWRkLTc2N2MtNDQzNi1iOGE5LWYxY2ExOWI0ODEyZS9pZTktcnRtLXhkb21haW5yZXF1ZXN0LWlzc3VlZC1yZXF1ZXN0cy1tYXktYWJvcnQtaWYtYWxsLWV2ZW50LWhhbmRsZXJzLW5vdC1zcGVjaWZpZWQ/Zm9ydW09aWV3ZWJkZXZlbG9wbWVudFxuICAgICAgcmVxLm9ucHJvZ3Jlc3MgPSBvblByb2dyZXNzO1xuICAgICAgaWYgKCdvbnJlYWR5c3RhdGVjaGFuZ2UnIGluIHJlcSlcbiAgICAgICAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG9uUmVhZHlTdGF0ZUNoYW5nZTtcbiAgICAgIHJlcS5vbmxvYWQgPSBvbkxvYWQ7XG4gICAgICByZXEub25lcnJvciA9IG9uRXJyb3I7XG5cbiAgICAgIC8vIGRvIG5vdCByZWx5IG9uIGRlZmF1bHQgWEhSIGFzeW5jIGZsYWcsIGFzIHNvbWUgYW5hbHl0aWNzIGNvZGUgbGlrZSBob3RqYXJcbiAgICAgIC8vIGJyZWFrcyBpdCBhbmQgc2V0IGl0IHRvIGZhbHNlIGJ5IGRlZmF1bHRcbiAgICAgIGlmIChyZXEgaW5zdGFuY2VvZiBYTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICByZXEub3BlbihvcHRzLm1ldGhvZCwgdXJsLCB0cnVlKTtcblxuICAgICAgICAvLyBUaGUgQW5hbHl0aWNzIEFQSSBuZXZlciBhY2NlcHRzIEF1dGggaGVhZGVycyBhcyBxdWVyeSBzdHJpbmdcbiAgICAgICAgLy8gdGhpcyBvcHRpb24gZXhpc3RzIHNwZWNpZmljYWxseSBmb3IgdGhlbS5cbiAgICAgICAgaWYgKG9wdHMuZm9yY2VBdXRoSGVhZGVycykge1xuICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFxuICAgICAgICAgICAgJ3gtY2xpbmlhLWFwcGxpY2F0aW9uLWlkJyxcbiAgICAgICAgICAgIG9wdHMuaGVhZGVyc1sneC1jbGluaWEtYXBwbGljYXRpb24taWQnXVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICAneC1jbGluaWEtYXBpLWtleScsXG4gICAgICAgICAgICBvcHRzLmhlYWRlcnNbJ3gtY2xpbmlhLWFwaS1rZXknXVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcS5vcGVuKG9wdHMubWV0aG9kLCB1cmwpO1xuICAgICAgfVxuXG4gICAgICAvLyBoZWFkZXJzIGFyZSBtZWFudCB0byBiZSBzZW50IGFmdGVyIG9wZW5cbiAgICAgIGlmIChzdXBwb3J0LmNvcnMpIHtcbiAgICAgICAgaWYgKGJvZHkpIHtcbiAgICAgICAgICBpZiAob3B0cy5tZXRob2QgPT09ICdQT1NUJykge1xuICAgICAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRUUC9BY2Nlc3NfY29udHJvbF9DT1JTI1NpbXBsZV9yZXF1ZXN0c1xuICAgICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICAgICAgICAgICdjb250ZW50LXR5cGUnLFxuICAgICAgICAgICAgICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgYm9keSA9ICdwYXJhbXM9Jytib2R5XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcignYWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGJvZHkpIHtcbiAgICAgICAgcmVxLnNlbmQoYm9keSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBldmVudCBvYmplY3Qgbm90IHJlY2VpdmVkIGluIElFOCwgYXQgbGVhc3RcbiAgICAgIC8vIGJ1dCB3ZSBkbyBub3QgdXNlIGl0LCBzdGlsbCBpbXBvcnRhbnQgdG8gbm90ZVxuICAgICAgZnVuY3Rpb24gb25Mb2FkKC8qIGV2ZW50ICovKSB7XG4gICAgICAgIC8vIFdoZW4gYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0cyByZXEudGltZW91dCwgd2UgY2FuXG4gICAgICAgIC8vIGhhdmUgYm90aCBhIGxvYWQgYW5kIHRpbWVvdXQgZXZlbnQsIHNpbmNlIGhhbmRsZWQgYnkgYSBkdW1iIHNldFRpbWVvdXRcbiAgICAgICAgaWYgKHRpbWVkT3V0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHJlcVRpbWVvdXQpO1xuXG4gICAgICAgIHZhciBvdXQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBvdXQgPSB7XG4gICAgICAgICAgICBib2R5OiBKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpLFxuICAgICAgICAgICAgcmVzcG9uc2VUZXh0OiByZXEucmVzcG9uc2VUZXh0LFxuICAgICAgICAgICAgc3RhdHVzQ29kZTogcmVxLnN0YXR1cyxcbiAgICAgICAgICAgIC8vIFhEb21haW5SZXF1ZXN0IGRvZXMgbm90IGhhdmUgYW55IHJlc3BvbnNlIGhlYWRlcnNcbiAgICAgICAgICAgIGhlYWRlcnM6XG4gICAgICAgICAgICAgIChyZXEuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzICYmIHJlcS5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgfHwge30sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIG91dCA9IG5ldyBlcnJvcnMuVW5wYXJzYWJsZUpTT04oe1xuICAgICAgICAgICAgbW9yZTogcmVxLnJlc3BvbnNlVGV4dCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvdXQgaW5zdGFuY2VvZiBlcnJvcnMuVW5wYXJzYWJsZUpTT04pIHtcbiAgICAgICAgICByZWplY3Qob3V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKG91dCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25FcnJvcihldmVudCkge1xuICAgICAgICBpZiAodGltZWRPdXQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRpbWVvdXQocmVxVGltZW91dCk7XG5cbiAgICAgICAgLy8gZXJyb3IgZXZlbnQgaXMgdHJpZ2VycmVkIGJvdGggd2l0aCBYRFIvWEhSIG9uOlxuICAgICAgICAvLyAgIC0gRE5TIGVycm9yXG4gICAgICAgIC8vICAgLSB1bmFsbG93ZWQgY3Jvc3MgZG9tYWluIHJlcXVlc3RcbiAgICAgICAgcmVqZWN0KFxuICAgICAgICAgIG5ldyBlcnJvcnMuTmV0d29yayh7XG4gICAgICAgICAgICBtb3JlOiBldmVudCxcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblRpbWVvdXQoKSB7XG4gICAgICAgIHRpbWVkT3V0ID0gdHJ1ZTtcbiAgICAgICAgcmVxLmFib3J0KCk7XG5cbiAgICAgICAgcmVqZWN0KG5ldyBlcnJvcnMuUmVxdWVzdFRpbWVvdXQoKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uQ29ubmVjdCgpIHtcbiAgICAgICAgY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHJlcVRpbWVvdXQpO1xuICAgICAgICByZXFUaW1lb3V0ID0gc2V0VGltZW91dChvblRpbWVvdXQsIG9wdHMudGltZW91dHMuY29tcGxldGUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblByb2dyZXNzKCkge1xuICAgICAgICBpZiAoIWNvbm5lY3RlZCkgb25Db25uZWN0KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVhZHlTdGF0ZUNoYW5nZSgpIHtcbiAgICAgICAgaWYgKCFjb25uZWN0ZWQgJiYgcmVxLnJlYWR5U3RhdGUgPiAxKSBvbkNvbm5lY3QoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBDbGluaWFTZWFyY2hCcm93c2VyLnByb3RvdHlwZS5fcmVxdWVzdC5mYWxsYmFjayA9IGZ1bmN0aW9uIHJlcXVlc3RGYWxsYmFjayhcbiAgICB1cmwsXG4gICAgb3B0c1xuICApIHtcbiAgICB1cmwgPSBpbmxpbmVIZWFkZXJzKHVybCwgb3B0cy5oZWFkZXJzKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiB3cmFwSnNvbnBSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgICAganNvbnBSZXF1ZXN0KHVybCwgb3B0cywgZnVuY3Rpb24ganNvbnBSZXF1ZXN0RG9uZShlcnIsIGNvbnRlbnQpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUoY29udGVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBDbGluaWFTZWFyY2hCcm93c2VyLnByb3RvdHlwZS5fcHJvbWlzZSA9IHtcbiAgICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdFByb21pc2UodmFsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodmFsKTtcbiAgICB9LFxuICAgIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWwpO1xuICAgIH0sXG4gICAgZGVsYXk6IGZ1bmN0aW9uIGRlbGF5UHJvbWlzZShtcykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIHJlc29sdmVPblRpbWVvdXQocmVzb2x2ZSAvKiAsIHJlamVjdCovKSB7XG4gICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBhbGw6IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICB9LFxuICB9O1xuXG4gIHJldHVybiBjbGluaWFzZWFyY2g7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlubGluZUhlYWRlcnM7XG5cbnZhciBlbmNvZGUgPSByZXF1aXJlKCdxdWVyeXN0cmluZy1lczMvZW5jb2RlJyk7XG5cbmZ1bmN0aW9uIGlubGluZUhlYWRlcnModXJsLCBoZWFkZXJzKSB7XG4gIGlmICgvXFw/Ly50ZXN0KHVybCkpIHtcbiAgICB1cmwgKz0gJyYnO1xuICB9IGVsc2Uge1xuICAgIHVybCArPSAnPyc7XG4gIH1cblxuICByZXR1cm4gdXJsICsgZW5jb2RlKGhlYWRlcnMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGpzb25wUmVxdWVzdDtcblxudmFyIGVycm9ycyA9IHJlcXVpcmUoJy4uL2Vycm9ycycpO1xuXG52YXIgSlNPTlBDb3VudGVyID0gMDtcblxuZnVuY3Rpb24ganNvbnBSZXF1ZXN0KHVybCwgb3B0cywgY2IpIHtcbiAgaWYgKG9wdHMubWV0aG9kICE9PSAnR0VUJykge1xuICAgIGNiKFxuICAgICAgbmV3IEVycm9yKFxuICAgICAgICAnTWV0aG9kICcgKyBvcHRzLm1ldGhvZCArICcgJyArIHVybCArICcgaXMgbm90IHN1cHBvcnRlZCBieSBKU09OUC4nXG4gICAgICApXG4gICAgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBvcHRzLmRlYnVnKCdKU09OUDogc3RhcnQnKTtcblxuICB2YXIgY2JDYWxsZWQgPSBmYWxzZTtcbiAgdmFyIHRpbWVkT3V0ID0gZmFsc2U7XG5cbiAgSlNPTlBDb3VudGVyICs9IDE7XG4gIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICB2YXIgY2JOYW1lID0gJ2NsaW5pYUpTT05QXycgKyBKU09OUENvdW50ZXI7XG4gIHZhciBkb25lID0gZmFsc2U7XG5cbiAgd2luZG93W2NiTmFtZV0gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmVtb3ZlR2xvYmFscygpO1xuXG4gICAgaWYgKHRpbWVkT3V0KSB7XG4gICAgICBvcHRzLmRlYnVnKCdKU09OUDogTGF0ZSBhbnN3ZXIsIGlnbm9yaW5nJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY2JDYWxsZWQgPSB0cnVlO1xuXG4gICAgY2xlYW4oKTtcblxuICAgIGNiKG51bGwsIHtcbiAgICAgIGJvZHk6IGRhdGEsXG4gICAgICByZXNwb25zZVRleHQ6IEpTT04uc3RyaW5naWZ5KFxuICAgICAgICBkYXRhXG4gICAgICApIC8qICxcbiAgICAgIC8vIFdlIGRvIG5vdCBzZW5kIHRoZSBzdGF0dXNDb2RlLCB0aGVyZSdzIG5vIHN0YXR1c0NvZGUgaW4gSlNPTlAsIGl0IHdpbGwgYmVcbiAgICAgIC8vIGNvbXB1dGVkIHVzaW5nIGRhdGEuc3RhdHVzICYmIGRhdGEubWVzc2FnZSBsaWtlIHdpdGggWERSXG4gICAgICBzdGF0dXNDb2RlKi8sXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gYWRkIGNhbGxiYWNrIGJ5IGhhbmRcbiAgdXJsICs9ICcmY2FsbGJhY2s9JyArIGNiTmFtZTtcblxuICAvLyBhZGQgYm9keSBwYXJhbXMgbWFudWFsbHlcbiAgaWYgKG9wdHMuanNvbkJvZHkgJiYgb3B0cy5qc29uQm9keS5wYXJhbXMpIHtcbiAgICB1cmwgKz0gJyYnICsgb3B0cy5qc29uQm9keS5wYXJhbXM7XG4gIH1cblxuICB2YXIgb250aW1lb3V0ID0gc2V0VGltZW91dCh0aW1lb3V0LCBvcHRzLnRpbWVvdXRzLmNvbXBsZXRlKTtcblxuICAvLyBzY3JpcHQgb25yZWFkeXN0YXRlY2hhbmdlIG5lZWRlZCBvbmx5IGZvclxuICAvLyA8PSBJRThcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9pc3N1ZXMvNDUyM1xuICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gcmVhZHlzdGF0ZWNoYW5nZTtcbiAgc2NyaXB0Lm9ubG9hZCA9IHN1Y2Nlc3M7XG4gIHNjcmlwdC5vbmVycm9yID0gZXJyb3I7XG5cbiAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgc2NyaXB0LmRlZmVyID0gdHJ1ZTtcbiAgc2NyaXB0LnNyYyA9IHVybDtcbiAgaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXG4gIGZ1bmN0aW9uIHN1Y2Nlc3MoKSB7XG4gICAgb3B0cy5kZWJ1ZygnSlNPTlA6IHN1Y2Nlc3MnKTtcblxuICAgIGlmIChkb25lIHx8IHRpbWVkT3V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZG9uZSA9IHRydWU7XG5cbiAgICAvLyBzY3JpcHQgbG9hZGVkIGJ1dCBkaWQgbm90IGNhbGwgdGhlIGZuID0+IHNjcmlwdCBsb2FkaW5nIGVycm9yXG4gICAgaWYgKCFjYkNhbGxlZCkge1xuICAgICAgb3B0cy5kZWJ1ZygnSlNPTlA6IEZhaWwuIFNjcmlwdCBsb2FkZWQgYnV0IGRpZCBub3QgY2FsbCB0aGUgY2FsbGJhY2snKTtcbiAgICAgIGNsZWFuKCk7XG4gICAgICBjYihuZXcgZXJyb3JzLkpTT05QU2NyaXB0RmFpbCgpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkeXN0YXRlY2hhbmdlKCkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09ICdsb2FkZWQnIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgc3VjY2VzcygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFuKCkge1xuICAgIGNsZWFyVGltZW91dChvbnRpbWVvdXQpO1xuICAgIHNjcmlwdC5vbmxvYWQgPSBudWxsO1xuICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuICAgIHNjcmlwdC5vbmVycm9yID0gbnVsbDtcbiAgICBoZWFkLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVHbG9iYWxzKCkge1xuICAgIHRyeSB7XG4gICAgICBkZWxldGUgd2luZG93W2NiTmFtZV07XG4gICAgICBkZWxldGUgd2luZG93W2NiTmFtZSArICdfbG9hZGVkJ107XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2luZG93W2NiTmFtZV0gPSB3aW5kb3dbY2JOYW1lICsgJ19sb2FkZWQnXSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lb3V0KCkge1xuICAgIG9wdHMuZGVidWcoJ0pTT05QOiBTY3JpcHQgdGltZW91dCcpO1xuICAgIHRpbWVkT3V0ID0gdHJ1ZTtcbiAgICBjbGVhbigpO1xuICAgIGNiKG5ldyBlcnJvcnMuUmVxdWVzdFRpbWVvdXQoKSk7XG4gIH1cblxuICBmdW5jdGlvbiBlcnJvcigpIHtcbiAgICBvcHRzLmRlYnVnKCdKU09OUDogU2NyaXB0IGVycm9yJyk7XG5cbiAgICBpZiAoZG9uZSB8fCB0aW1lZE91dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNsZWFuKCk7XG4gICAgY2IobmV3IGVycm9ycy5KU09OUFNjcmlwdEVycm9yKCkpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGJ1aWxkU2VhcmNoTWV0aG9kXG5cbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNBcnJheScpO1xudmFyIGZvcmVhY2ggPSByZXF1aXJlKCdmb3JlYWNoJylcblxuLyoqXG4gKiBDcmVhdGVzIGEgc2VhcmNoIG1ldGhvZCB0byBiZSB1c2VkIGluIGNsaWVudHNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlTXV0bGlJbmRleGVzIGlmIHRoZSBzZWFyY2ggbWV0aG9kIHNob3VsZCBiZSBidW5kbGVkIHRvIGhhbmRsZSBtdWx0aSBpbmRleGVzIHF1ZXJpZXNcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufSB0aGUgc2VhcmNoIG1ldGhvZFxuICovXG5mdW5jdGlvbiBidWlsZFNlYXJjaE1ldGhvZChlbmFibGVNdXRsaUluZGV4ZXMpIHtcbiAgLy8gTWV0aG9kIHJldXNlZCBpbiBib3RoIGltcGxlbWVudGF0aW9uc1xuICB2YXIgYnVpbGRQYXJhbXMgPSBmdW5jdGlvbihhcmdzLCBnZXRTZWFyY2hQYXJhbXMpIHtcbiAgICB2YXIgcGFyYW1zID0ge31cbiAgXG4gICAgaWYgKGFyZ3MucXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcGFyYW1zLnEgPSBhcmdzLnF1ZXJ5O1xuICAgIH1cbiAgXG4gICAgdmFyIGFkZGl0aW9uYWxVQTtcbiAgICBpZiAoYXJncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoYXJncy5hZGRpdGlvbmFsVUEpIHtcbiAgICAgICAgYWRkaXRpb25hbFVBID0gYXJncy5hZGRpdGlvbmFsVUE7XG4gICAgICAgIGRlbGV0ZSBhcmdzLmFkZGl0aW9uYWxVQTtcbiAgICAgIH1cbiAgICAgIC8vIGBfZ2V0U2VhcmNoUGFyYW1zYCB3aWxsIGF1Z21lbnQgcGFyYW1zXG4gICAgICBwYXJhbXMgPSBnZXRTZWFyY2hQYXJhbXMoYXJncywgcGFyYW1zKVxuICAgIH1cbiAgXG4gICAgcmV0dXJuIFtwYXJhbXMsIGFkZGl0aW9uYWxVQV1cbiAgfVxuICBpZiAoZW5hYmxlTXV0bGlJbmRleGVzKSB7XG4gICAgLyoqXG4gICAgICogVGhlIHNlYXJjaCBtZXRob2QuIFByZXBhcmVzIHRoZSBkYXRhIGFuZCBzZW5kIHRoZSBtZXJnZWQgcXVlcmllcyB0byBDbGluaWEuXG4gICAgICogQHBhcmFtIHtvYmplY3RbXX0gcXVlcmllcyBzZWFyY2ggcXVlcmllcy9wYXJhbWV0ZXJzIHRvIHNlbmRcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2FsbGJhY2tdIHRoZSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2l0aCB0aGUgY2xpZW50IGdldHMgdGhlIGFuc3dlclxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZHxQcm9taXNlfSBJZiB0aGUgY2FsbGJhY2sgaXMgbm90IHByb3ZpZGVkIHRoZW4gdGhpcyBtZXRob2RzIHJldHVybnMgYSBQcm9taXNlXG4gICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHNlYXJjaChxdWVyaWVzLCBjYWxsYmFjaykge1xuICAgICAgaWYgKCFpc0FycmF5KHF1ZXJpZXMpKSB7XG4gICAgICAgIHF1ZXJpZXMgPSBbcXVlcmllc11cbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gR2V0IHRoZSBtZXRob2QgZnJvbSBgdGhpc2AgYmVmb3JlIGVudGVyaW5nIHRoZSBmb3JlYWNoXG4gICAgICB2YXIgZ2V0U2VhcmNoUGFyYW1zID0gdGhpcy5hcy5fZ2V0U2VhcmNoUGFyYW1zXG4gICAgICBcbiAgICAgIHByb2Nlc3NlZFF1ZXJpZXMgPSBbXVxuICAgICAgZm9yZWFjaChxdWVyaWVzLCBmdW5jdGlvbihxdWVyeSkge1xuICAgICAgICB2YXIgdmFsdWVzID0gYnVpbGRQYXJhbXMocXVlcnksIGdldFNlYXJjaFBhcmFtcylcbiAgICAgICAgcHJvY2Vzc2VkUXVlcmllcy5wdXNoKHZhbHVlc1swXSlcbiAgICAgICAgLy8gVE9ETyA6IFdoYXQgZG8gd2UgZG8gd2l0aCB0aGUgYWRkaXRpb25hbFVBIHdoZW4gd2UgaGF2ZSBtdXRpcGxlIHF1ZXJpZXM/XG4gICAgICB9KSBcblxuICAgICAgcmV0dXJuIHRoaXMuX3NlYXJjaChwcm9jZXNzZWRRdWVyaWVzLCB1bmRlZmluZWQsIGNhbGxiYWNrKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8qKlxuICAgICAqIFRoZSBzZWFyY2ggbWV0aG9kLiBQcmVwYXJlcyB0aGUgZGF0YSBhbmQgc2VuZCB0aGUgcXVlcnkgdG8gQ2xpbmlhLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBxdWVyeSBzZWFyY2ggcXVlcnkvcGFyYW1ldGVycyB0byBzZW5kXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NhbGxiYWNrXSB0aGUgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdpdGggdGhlIGNsaWVudCBnZXRzIHRoZSBhbnN3ZXJcbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR8UHJvbWlzZX0gSWYgdGhlIGNhbGxiYWNrIGlzIG5vdCBwcm92aWRlZCB0aGVuIHRoaXMgbWV0aG9kcyByZXR1cm5zIGEgUHJvbWlzZVxuICAgICAqL1xuICAgIHJldHVybiBmdW5jdGlvbiBzZWFyY2gocXVlcnksIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgdmFsdWVzID0gYnVpbGRQYXJhbXMocXVlcnksIHRoaXMuYXMuX2dldFNlYXJjaFBhcmFtcylcbiAgICAgIHJldHVybiB0aGlzLl9zZWFyY2godmFsdWVzWzBdLCB1bmRlZmluZWQsIGNhbGxiYWNrLCB2YWx1ZXNbMV0pO1xuICAgIH07XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2xvbmUob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gVGhpcyBmaWxlIGhvc3RzIG91ciBlcnJvciBkZWZpbml0aW9uc1xuLy8gV2UgdXNlIGN1c3RvbSBlcnJvciBcInR5cGVzXCIgc28gdGhhdCB3ZSBjYW4gYWN0IG9uIHRoZW0gd2hlbiB3ZSBuZWVkIGl0XG4vLyBlLmcuOiBpZiBlcnJvciBpbnN0YW5jZW9mIGVycm9ycy5VbnBhcnNhYmxlSlNPTiB0aGVuLi5cblxudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZnVuY3Rpb24gQ2xpbmlhU2VhcmNoRXJyb3IobWVzc2FnZSwgZXh0cmFQcm9wZXJ0aWVzKSB7XG4gIHZhciBmb3JFYWNoID0gcmVxdWlyZSgnZm9yZWFjaCcpO1xuXG4gIHZhciBlcnJvciA9IHRoaXM7XG5cbiAgLy8gdHJ5IHRvIGdldCBhIHN0YWNrdHJhY2VcbiAgaWYgKHR5cGVvZiBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHRoaXMuY29uc3RydWN0b3IpO1xuICB9IGVsc2Uge1xuICAgIGVycm9yLnN0YWNrID1cbiAgICAgIG5ldyBFcnJvcigpLnN0YWNrIHx8ICdDYW5ub3QgZ2V0IGEgc3RhY2t0cmFjZSwgYnJvd3NlciBpcyB0b28gb2xkJztcbiAgfVxuXG4gIHRoaXMubmFtZSA9ICdDbGluaWFTZWFyY2hFcnJvcic7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InO1xuXG4gIGlmIChleHRyYVByb3BlcnRpZXMpIHtcbiAgICBmb3JFYWNoKGV4dHJhUHJvcGVydGllcywgZnVuY3Rpb24gYWRkVG9FcnJvck9iamVjdCh2YWx1ZSwga2V5KSB7XG4gICAgICBlcnJvcltrZXldID0gdmFsdWU7XG4gICAgfSk7XG4gIH1cbn1cblxuaW5oZXJpdHMoQ2xpbmlhU2VhcmNoRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gY3JlYXRlQ3VzdG9tRXJyb3IobmFtZSwgbWVzc2FnZSkge1xuICBmdW5jdGlvbiBDbGluaWFTZWFyY2hDdXN0b21FcnJvcigpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG5cbiAgICAvLyBjdXN0b20gbWVzc2FnZSBub3Qgc2V0LCB1c2UgZGVmYXVsdFxuICAgIGlmICh0eXBlb2YgYXJnc1swXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGFyZ3MudW5zaGlmdChtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBDbGluaWFTZWFyY2hFcnJvci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB0aGlzLm5hbWUgPSAnQ2xpbmlhU2VhcmNoRXJyb3InICsgbmFtZSArICdFcnJvcic7XG4gIH1cblxuICBpbmhlcml0cyhDbGluaWFTZWFyY2hDdXN0b21FcnJvciwgQ2xpbmlhU2VhcmNoRXJyb3IpO1xuXG4gIHJldHVybiBDbGluaWFTZWFyY2hDdXN0b21FcnJvcjtcbn1cblxuLy8gbGF0ZSBleHBvcnRzIHRvIGxldCB2YXJpb3VzIGZuIGRlZnMgYW5kIGluaGVyaXRzIHRha2UgcGxhY2Vcbm1vZHVsZS5leHBvcnRzID0ge1xuICBDbGluaWFTZWFyY2hFcnJvcjogQ2xpbmlhU2VhcmNoRXJyb3IsXG4gIFVucGFyc2FibGVKU09OOiBjcmVhdGVDdXN0b21FcnJvcihcbiAgICAnVW5wYXJzYWJsZUpTT04nLFxuICAgICdDb3VsZCBub3QgcGFyc2UgdGhlIGluY29taW5nIHJlc3BvbnNlIGFzIEpTT04sIHNlZSBlcnIubW9yZSBmb3IgZGV0YWlscydcbiAgKSxcbiAgUmVxdWVzdFRpbWVvdXQ6IGNyZWF0ZUN1c3RvbUVycm9yKFxuICAgICdSZXF1ZXN0VGltZW91dCcsXG4gICAgJ1JlcXVlc3QgdGltZWQgb3V0IGJlZm9yZSBnZXR0aW5nIGEgcmVzcG9uc2UnXG4gICksXG4gIE5ldHdvcms6IGNyZWF0ZUN1c3RvbUVycm9yKFxuICAgICdOZXR3b3JrJyxcbiAgICAnTmV0d29yayBpc3N1ZSwgc2VlIGVyci5tb3JlIGZvciBkZXRhaWxzJ1xuICApLFxuICBKU09OUFNjcmlwdEZhaWw6IGNyZWF0ZUN1c3RvbUVycm9yKFxuICAgICdKU09OUFNjcmlwdEZhaWwnLFxuICAgICc8c2NyaXB0PiB3YXMgbG9hZGVkIGJ1dCBkaWQgbm90IGNhbGwgb3VyIHByb3ZpZGVkIGNhbGxiYWNrJ1xuICApLFxuICBWYWxpZFVudGlsTm90Rm91bmQ6IGNyZWF0ZUN1c3RvbUVycm9yKFxuICAgICdWYWxpZFVudGlsTm90Rm91bmQnLFxuICAgICdUaGUgU2VjdXJlZEFQSUtleSBkb2VzIG5vdCBoYXZlIGEgdmFsaWRVbnRpbCBwYXJhbWV0ZXIuJ1xuICApLFxuICBKU09OUFNjcmlwdEVycm9yOiBjcmVhdGVDdXN0b21FcnJvcihcbiAgICAnSlNPTlBTY3JpcHRFcnJvcicsXG4gICAgJzxzY3JpcHQ+IHVuYWJsZSB0byBsb2FkIGR1ZSB0byBhbiBgZXJyb3JgIGV2ZW50IG9uIGl0J1xuICApLFxuICBPYmplY3ROb3RGb3VuZDogY3JlYXRlQ3VzdG9tRXJyb3IoJ09iamVjdE5vdEZvdW5kJywgJ09iamVjdCBub3QgZm91bmQnKSxcbiAgVW5rbm93bjogY3JlYXRlQ3VzdG9tRXJyb3IoJ1Vua25vd24nLCAnVW5rbm93biBlcnJvciBvY2N1cmVkJyksXG59O1xuIiwiLy8gUGFyc2UgY2xvdWQgZG9lcyBub3Qgc3VwcG9ydHMgc2V0VGltZW91dFxuLy8gV2UgZG8gbm90IHN0b3JlIGEgc2V0VGltZW91dCByZWZlcmVuY2UgaW4gdGhlIGNsaWVudCBldmVyeXRpbWVcbi8vIFdlIG9ubHkgZmFsbGJhY2sgdG8gYSBmYWtlIHNldFRpbWVvdXQgd2hlbiBub3QgYXZhaWxhYmxlXG4vLyBzZXRUaW1lb3V0IGNhbm5vdCBiZSBvdmVycmlkZSBnbG9iYWxseSBzYWRseVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleGl0UHJvbWlzZShmbiwgX3NldFRpbWVvdXQpIHtcbiAgX3NldFRpbWVvdXQoZm4sIDApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBlcnJvcixcbiAgd2FybixcbiAgaW5mbyxcbiAgZGVidWdcbn1cblxuZnVuY3Rpb24gZXJyb3IobWVzc2FnZSkge1xuICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpXG59XG5cbmZ1bmN0aW9uIHdhcm4obWVzc2FnZSkge1xuICBjb25zb2xlLndhcm4obWVzc2FnZSlcbn1cblxuZnVuY3Rpb24gaW5mbyhtZXNzYWdlKSB7XG4gIGNvbnNvbGUuaW5mbyhtZXNzYWdlKVxufVxuXG5mdW5jdGlvbiBkZWJ1ZyhtZXNzYWdlKSB7XG4gIGNvbnNvbGUuZGVidWcobWVzc2FnZSlcbn0iLCJ2YXIgZm9yZWFjaCA9IHJlcXVpcmUoJ2ZvcmVhY2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtYXAoYXJyLCBmbikge1xuICB2YXIgbmV3QXJyID0gW107XG4gIGZvcmVhY2goYXJyLCBmdW5jdGlvbihpdGVtLCBpdGVtSW5kZXgpIHtcbiAgICBuZXdBcnIucHVzaChmbihpdGVtLCBpdGVtSW5kZXgsIGFycikpO1xuICB9KTtcbiAgcmV0dXJuIG5ld0Fycjtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVBsYWNlc0NsaWVudDtcblxudmFyIHFzMyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nLWVzMycpO1xudmFyIGJ1aWxkU2VhcmNoTWV0aG9kID0gcmVxdWlyZSgnLi9idWlsZFNlYXJjaE1ldGhvZC5qcycpO1xuXG4vLyBUT0RPXG5mdW5jdGlvbiBjcmVhdGVQbGFjZXNDbGllbnQoY2xpbmlhc2VhcmNoKSB7fVxuIiwidmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnY2xpbmlhc2VhcmNoOnNyYy9ob3N0SW5kZXhTdGF0ZS5qcycpO1xudmFyIGxvY2FsU3RvcmFnZU5hbWVzcGFjZSA9ICdjbGluaWFzZWFyY2gtY2xpZW50LWpzJztcblxudmFyIHN0b3JlO1xudmFyIG1vZHVsZVN0b3JlID0ge1xuICBzdGF0ZToge30sXG4gIHNldDogZnVuY3Rpb24oa2V5LCBkYXRhKSB7XG4gICAgdGhpcy5zdGF0ZVtrZXldID0gZGF0YTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZVtrZXldO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlW2tleV0gfHwgbnVsbDtcbiAgfSxcbn07XG5cbnZhciBsb2NhbFN0b3JhZ2VTdG9yZSA9IHtcbiAgc2V0OiBmdW5jdGlvbihrZXksIGRhdGEpIHtcbiAgICBtb2R1bGVTdG9yZS5zZXQoa2V5LCBkYXRhKTsgLy8gYWx3YXlzIHJlcGxpY2F0ZSBsb2NhbFN0b3JhZ2VTdG9yZSB0byBtb2R1bGVTdG9yZSBpbiBjYXNlIG9mIGZhaWx1cmVcblxuICAgIHRyeSB7XG4gICAgICB2YXIgbmFtZXNwYWNlID0gSlNPTi5wYXJzZShnbG9iYWwubG9jYWxTdG9yYWdlW2xvY2FsU3RvcmFnZU5hbWVzcGFjZV0pO1xuICAgICAgbmFtZXNwYWNlW2tleV0gPSBkYXRhO1xuICAgICAgZ2xvYmFsLmxvY2FsU3RvcmFnZVtsb2NhbFN0b3JhZ2VOYW1lc3BhY2VdID0gSlNPTi5zdHJpbmdpZnkobmFtZXNwYWNlKTtcbiAgICAgIHJldHVybiBuYW1lc3BhY2Vba2V5XTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbG9jYWxTdG9yYWdlRmFpbHVyZShrZXksIGUpO1xuICAgIH1cbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgSlNPTi5wYXJzZShnbG9iYWwubG9jYWxTdG9yYWdlW2xvY2FsU3RvcmFnZU5hbWVzcGFjZV0pW2tleV0gfHwgbnVsbFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbG9jYWxTdG9yYWdlRmFpbHVyZShrZXksIGUpO1xuICAgIH1cbiAgfSxcbn07XG5cbmZ1bmN0aW9uIGxvY2FsU3RvcmFnZUZhaWx1cmUoa2V5LCBlKSB7XG4gIGRlYnVnKCdsb2NhbFN0b3JhZ2UgZmFpbGVkIHdpdGgnLCBlKTtcbiAgY2xlYW51cCgpO1xuICBzdG9yZSA9IG1vZHVsZVN0b3JlO1xuICByZXR1cm4gc3RvcmUuZ2V0KGtleSk7XG59XG5cbnN0b3JlID0gc3VwcG9ydHNMb2NhbFN0b3JhZ2UoKSA/IGxvY2FsU3RvcmFnZVN0b3JlIDogbW9kdWxlU3RvcmU7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQ6IGdldE9yU2V0LFxuICBzZXQ6IGdldE9yU2V0LFxuICBzdXBwb3J0c0xvY2FsU3RvcmFnZTogc3VwcG9ydHNMb2NhbFN0b3JhZ2UsXG59O1xuXG5mdW5jdGlvbiBnZXRPclNldChrZXksIGRhdGEpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gc3RvcmUuZ2V0KGtleSk7XG4gIH1cblxuICByZXR1cm4gc3RvcmUuc2V0KGtleSwgZGF0YSk7XG59XG5cbmZ1bmN0aW9uIHN1cHBvcnRzTG9jYWxTdG9yYWdlKCkge1xuICB0cnkge1xuICAgIGlmICgnbG9jYWxTdG9yYWdlJyBpbiBnbG9iYWwgJiYgZ2xvYmFsLmxvY2FsU3RvcmFnZSAhPT0gbnVsbCkge1xuICAgICAgaWYgKCFnbG9iYWwubG9jYWxTdG9yYWdlW2xvY2FsU3RvcmFnZU5hbWVzcGFjZV0pIHtcbiAgICAgICAgLy8gYWN0dWFsIGNyZWF0aW9uIG9mIHRoZSBuYW1lc3BhY2VcbiAgICAgICAgZ2xvYmFsLmxvY2FsU3RvcmFnZS5zZXRJdGVtKGxvY2FsU3RvcmFnZU5hbWVzcGFjZSwgSlNPTi5zdHJpbmdpZnkoe30pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSBjYXRjaCAoXykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vLyBJbiBjYXNlIG9mIGFueSBlcnJvciBvbiBsb2NhbFN0b3JhZ2UsIHdlIGNsZWFuIG91ciBvd24gbmFtZXNwYWNlLCB0aGlzIHNob3VsZCBoYW5kbGVcbi8vIHF1b3RhIGVycm9ycyB3aGVuIGEgbG90IG9mIGtleXMgKyBkYXRhIGFyZSB1c2VkXG5mdW5jdGlvbiBjbGVhbnVwKCkge1xuICB0cnkge1xuICAgIGdsb2JhbC5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShsb2NhbFN0b3JhZ2VOYW1lc3BhY2UpO1xuICB9IGNhdGNoIChfKSB7XG4gICAgLy8gbm90aGluZyB0byBkb1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gJzEuMC4wLWJldGEuMSc7XG4iXX0=
