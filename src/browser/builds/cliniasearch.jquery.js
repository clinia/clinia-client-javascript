// This is the jQuery Clinia Search module
// It's using $.ajax to do requests with a JSONP fallback
// jQuery promises are returned

const inherits = require('inherits');

const CliniaSearch = require('../../CliniaSearch');
const errors = require('../../errors');
const inlineHeaders = require('../inline-headers');
const jsonpRequest = require('../jsonp-request');

// expose original cliniasearch fn in window
window.cliniasearch = require('./cliniasearch');

if (process.env.NODE_ENV === 'debug') {
  require('debug').enable('cliniasearch*');
}

function cliniasearch(applicationID, apiKey, opts) {
  const cloneDeep = require('../../clone.js');

  opts = cloneDeep(opts || {});

  opts._ua = opts._ua || cliniasearch.ua;

  return new CliniaSearchJQuery(applicationID, apiKey, opts);
}

cliniasearch.version = require('../../version.js');

cliniasearch.ua =
  `Clinia for JavaScript (${cliniasearch.version}); ` + `jQuery (${window.jQuery().jquery})`;

// we expose into window no matter how we are used, this will allow
// us to easily debug any website running clinia
window.__clinia = {
  debug: require('debug'),
  cliniasearch,
};

const $ = window.jQuery;

$.clinia = {
  Client: cliniasearch,
  ua: cliniasearch.ua,
  version: cliniasearch.version,
};

function CliniaSearchJQuery() {
  // call CliniaSearch constructor
  CliniaSearch.apply(this, arguments);
}

inherits(CliniaSearchJQuery, CliniaSearch);

CliniaSearchJQuery.prototype._request = function request(url, opts) {
  return new $.Deferred(function(deferred) {
    const body = opts.body;

    url = inlineHeaders(url, opts.headers);

    const requestHeaders = {
      accept: 'application/json',
    };

    if (body) {
      if (opts.method === 'POST') {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests
        requestHeaders['content-type'] = 'application/x-www-form-urlencoded';
      } else {
        requestHeaders['content-type'] = 'application/json';
      }
    }

    $.ajax(url, {
      type: opts.method,
      timeout: opts.timeouts.complete,
      dataType: 'json',
      data: body,
      headers: requestHeaders,
      complete: function onComplete(jqXHR, textStatus /* , error*/) {
        if (textStatus === 'timeout') {
          deferred.reject(new errors.RequestTimeout());

          return;
        }

        if (jqXHR.status === 0) {
          deferred.reject(
            new errors.Network({
              more: jqXHR,
            })
          );

          return;
        }

        deferred.resolve({
          statusCode: jqXHR.status,
          body: jqXHR.responseJSON,
          responseText: jqXHR.responseText,
          headers: jqXHR.getAllResponseHeaders(),
        });
      },
    });
  }).promise();
};

// using IE8 or IE9 we will always end up here
// jQuery does not not fallback to XDomainRequest
CliniaSearchJQuery.prototype._request.fallback = function requestFallback(url, opts) {
  url = inlineHeaders(url, opts.headers);

  return new $.Deferred(function wrapJsonpRequest(deferred) {
    jsonpRequest(url, opts, function jsonpRequestDone(err, content) {
      if (err) {
        deferred.reject(err);

        return;
      }

      deferred.resolve(content);
    });
  }).promise();
};

CliniaSearchJQuery.prototype._promise = {
  reject: function reject(val) {
    return new $.Deferred(function rejectDeferred(deferred) {
      deferred.reject(val);
    }).promise();
  },
  resolve: function resolve(val) {
    return new $.Deferred(function resolveDeferred(deferred) {
      deferred.resolve(val);
    }).promise();
  },
  delay: function delay(ms) {
    return new $.Deferred(function delayResolve(deferred) {
      setTimeout(function resolveDeferred() {
        deferred.resolve();
      }, ms);
    }).promise();
  },
  all: function all(promises) {
    return $.when.apply(null, promises);
  },
};
