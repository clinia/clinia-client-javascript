// This is the AngularJS Clinia Search module
// It's using $http to do requests with a JSONP fallback
// $q promises are returned

const inherits = require('inherits');

const forEach = require('foreach');

const CliniaSearch = require('../../CliniaSearch');
const errors = require('../../errors');
const inlineHeaders = require('../inline-headers');
const jsonpRequest = require('../jsonp-request');

// expose original cliniasearch fn in window
window.cliniasearch = require('./cliniasearch');

if (process.env.NODE_ENV === 'debug') {
  require('debug').enable('cliniasearch*');
}

window.angular.module('cliniasearch', []).service('clinia', [
  '$http',
  '$q',
  '$timeout',
  function cliniaSearchService($http, $q, $timeout) {
    function cliniasearch(applicationID, apiKey, opts) {
      const cloneDeep = require('../../clone.js');

      opts = cloneDeep(opts || {});

      opts._ua = opts._ua || cliniasearch.ua;

      return new CliniaSearchAngular(applicationID, apiKey, opts);
    }

    cliniasearch.version = require('../../version.js');

    cliniasearch.ua =
      `Clinia for JavaScript (${cliniasearch.version}); ` +
      `AngularJS (${window.angular.version.full})`;

    // we expose into window no matter how we are used, this will allow
    // us to easily debug any website running clinia
    window.__clinia = {
      debug: require('debug'),
      cliniasearch,
    };

    function CliniaSearchAngular() {
      // call CliniaSearch constructor
      CliniaSearch.apply(this, arguments);
    }

    inherits(CliniaSearchAngular, CliniaSearch);

    CliniaSearchAngular.prototype._request = function request(url, opts) {
      // Support most Angular.js versions by using $q.defer() instead
      // of the new $q() constructor everywhere we need a promise
      const deferred = $q.defer();
      const resolve = deferred.resolve;
      const reject = deferred.reject;

      let timedOut;
      const body = opts.body;

      url = inlineHeaders(url, opts.headers);

      const timeoutDeferred = $q.defer();
      const timeoutPromise = timeoutDeferred.promise;

      $timeout(function timedout() {
        timedOut = true;
        // will cancel the xhr
        timeoutDeferred.resolve('test');
        reject(new errors.RequestTimeout());
      }, opts.timeouts.complete);

      const requestHeaders = {};

      // "remove" (set to undefined) possible globally set headers
      // in $httpProvider.defaults.headers.common
      // otherwise we might fail sometimes
      forEach($http.defaults.headers.common, function removeIt(headerValue, headerName) {
        requestHeaders[headerName] = undefined;
      });

      requestHeaders.accept = 'application/json';

      if (body) {
        if (opts.method === 'POST') {
          // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests
          requestHeaders['content-type'] = 'application/x-www-form-urlencoded';
        } else {
          requestHeaders['content-type'] = 'application/json';
        }
      }

      $http({
        url,
        method: opts.method,
        data: body,
        cache: false,
        timeout: timeoutPromise,
        headers: requestHeaders,
        transformResponse,
        // if client uses $httpProvider.defaults.withCredentials = true,
        // we revert it to false to avoid CORS failure
        withCredentials: false,
      }).then(success, error);

      function success(response) {
        resolve({
          statusCode: response.status,
          headers: response.headers,
          body: JSON.parse(response.data),
          responseText: response.data,
        });
      }

      // we force getting the raw data because we need it so
      // for cache keys
      function transformResponse(data) {
        return data;
      }

      function error(response) {
        if (timedOut) {
          return;
        }

        // network error
        if (response.status === 0) {
          reject(
            new errors.Network({
              more: response,
            })
          );

          return;
        }

        resolve({
          body: JSON.parse(response.data),
          statusCode: response.status,
        });
      }

      return deferred.promise;
    };

    // using IE8 or IE9 we will always end up here
    // AngularJS does not fallback to XDomainRequest
    CliniaSearchAngular.prototype._request.fallback = function requestFallback(url, opts) {
      url = inlineHeaders(url, opts.headers);

      const deferred = $q.defer();
      const resolve = deferred.resolve;
      const reject = deferred.reject;

      jsonpRequest(url, opts, function jsonpRequestDone(err, content) {
        if (err) {
          reject(err);

          return;
        }

        resolve(content);
      });

      return deferred.promise;
    };

    CliniaSearchAngular.prototype._promise = {
      reject(val) {
        return $q.reject(val);
      },
      resolve(val) {
        // http://www.bennadel.com/blog/2735-q-when-is-the-missing-q-resolve-method-in-angularjs.htm
        return $q.when(val);
      },
      delay(ms) {
        const deferred = $q.defer();
        const resolve = deferred.resolve;

        $timeout(resolve, ms);

        return deferred.promise;
      },
      all(promises) {
        return $q.all(promises);
      },
    };

    return {
      Client(applicationID, apiKey, options) {
        return cliniasearch(applicationID, apiKey, options);
      },
      ua: cliniasearch.ua,
      version: cliniasearch.version,
    };
  },
]);
