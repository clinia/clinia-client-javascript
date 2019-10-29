'use strict';

// This is the standalone browser build entry point
// Browser implementation of the Clinia Search JavaScript client,
// using XMLHttpRequest for React Native
module.exports = cliniasearch;

var inherits = require('inherits');
var Promise = window.Promise || require('es6-promise').Promise;

var CliniaSearch = require('../../CliniaSearch');
var errors = require('../../errors');
var inlineHeaders = require('../../browser/inline-headers');
var places = require('../../places.js');

function cliniasearch(applicationID, apiKey, opts) {
  var cloneDeep = require('../../clone.js');

  opts = cloneDeep(opts || {});

  if (opts.protocol === undefined) {
    opts.protocol = 'https:';
  }

  opts._ua = opts._ua || cliniasearch.ua;

  opts.timeouts = opts.timeouts || {
    connect: 2 * 1000,
    read: 3 * 1000,
    write: 30 * 1000,
  };

  return new CliniaSearchReactNative(applicationID, apiKey, opts);
}

cliniasearch.version = require('../../version.js');

cliniasearch.ua =
  'Clinia for JavaScript (' + cliniasearch.version + '); React Native';

cliniasearch.initPlaces = places(cliniasearch);

// we expose into window no matter how we are used, this will allow
// us to easily debug any website running clinia
window.__clinia = {
  debug: require('debug'),
  cliniasearch: cliniasearch,
};

var support = {
  timeout: 'timeout' in new XMLHttpRequest(),
};

function CliniaSearchReactNative() {
  // call CliniaSearch constructor
  CliniaSearch.apply(this, arguments);
}

inherits(CliniaSearchReactNative, CliniaSearch);

CliniaSearchReactNative.prototype._request = function request(url, opts) {
  return new Promise(function wrapRequest(resolve, reject) {
    url = inlineHeaders(url, opts.headers);

    var body = opts.body;
    var req = new XMLHttpRequest();
    var ontimeout;
    var timedOut;

    // do not rely on default XHR async flag, as some analytics code like hotjar
    // breaks it and set it to false by default
    if (req instanceof XMLHttpRequest) {
      req.open(opts.method, url, true);
    } else {
      req.open(opts.method, url);
    }

    if (body) {
      req.setRequestHeader('content-type', 'application/json');
    }

    req.onload = load;
    req.onerror = error;

    if (support.timeout) {
      // .timeout not supported at the time of this implementation. Maybe in the
      // future...
      req.timeout = opts.timeouts.complete;

      req.ontimeout = timeout;
    } else {
      ontimeout = setTimeout(timeout, opts.timeouts.complete);
    }

    req.send(body);

    // event object not received in IE8, at least
    // but we do not use it, still important to note
    function load(/* event */) {
      // When browser does not supports req.timeout, we can
      // have both a load and timeout event, since handled by a dumb setTimeout
      if (timedOut) {
        return;
      }

      if (!support.timeout) {
        clearTimeout(ontimeout);
      }

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

    function error(event) {
      if (timedOut) {
        return;
      }

      if (!support.timeout) {
        clearTimeout(ontimeout);
      }

      // error event is trigerred both with XDR/XHR on:
      //   - DNS error
      //   - unallowed cross domain request
      reject(
        new errors.Network({
          more: event,
        })
      );
    }

    function timeout() {
      if (!support.timeout) {
        timedOut = true;
        req.abort();
      }

      reject(new errors.RequestTimeout());
    }
  });
};

CliniaSearchReactNative.prototype._promise = {
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
