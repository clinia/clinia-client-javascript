module.exports = CliniaSearchCore;

const errors = require('./errors');
const exitPromise = require('./exitPromise.js');
const IndexCore = require('./IndexCore.js');
const store = require('./store.js');
const PlacesCore = require('./PlacesCore.js');

// We will always put the API KEY in the JSON body in case of too long API KEY,
// to avoid query string being too long and failing in various conditions (our server limit, browser limit,
// proxies limit)
const MAX_API_KEY_LENGTH = 500;
const RESET_APP_DATA_TIMER =
  (process.env.RESET_APP_DATA_TIMER && parseInt(process.env.RESET_APP_DATA_TIMER, 10)) ||
  60 * 2 * 1000; // after 2 minutes reset to first host

/*
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
  const debug = require('debug')('cliniasearch');

  const clone = require('./clone.js');
  const isArray = require('isarray');
  const map = require('./map.js');

  const usage = 'Usage: cliniasearch(applicationID, apiKey, opts)';

  if (opts._allowEmptyCredentials !== true && !applicationID) {
    throw new errors.CliniaSearchError(`Please provide an application ID. ${usage}`);
  }

  if (opts._allowEmptyCredentials !== true && !apiKey) {
    throw new errors.CliniaSearchError(`Please provide an API key. ${usage}`);
  }

  this.applicationID = applicationID;
  this.apiKey = apiKey;

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
    this._timeouts.connect = this._timeouts.read = this._timeouts.write = opts.timeout;
  }

  let protocol = opts.protocol || 'https:';
  // while we advocate for colon-at-the-end values: 'http:' for `opts.protocol`
  // we also accept `http` and `https`. It's a common error.
  if (!/:$/.test(protocol)) {
    protocol = `${protocol}:`;
  }

  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new errors.CliniaSearchError(
      `protocol must be \`http:\` or \`https:\` (was \`${opts.protocol}\`)`
    );
  }

  this._checkAppIdData();

  if (!opts.hosts) {
    var defaultHosts = map(this._shuffleResult, function(_hostNumber) { // eslint-disable-line
      return 'api.partner.clinia.ca';
    });

    // no hosts given, compute defaults
    const mainSuffix = 'api.partner.clinia.ca';
    this.hosts.read = [mainSuffix].concat(defaultHosts);
    this.hosts.write = ['api.partner.clinia.ca'].concat(defaultHosts);
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
  this._useCache = opts._useCache === undefined || opts._cache ? true : opts._useCache;
  this._useRequestCache = this._useCache && opts._useRequestCache;
  this._useFallback = opts.useFallback === undefined ? true : opts.useFallback;

  this._setTimeout = opts._setTimeout;

  debug('init done, %j', this);
}

/**
 * Get the index object initialized
 *
 * @param indexName the name of index
 * @param callback the result callback with one argument (the Index instance)
 */
CliniaSearchCore.prototype.initIndex = function(indexName) {
  return new IndexCore(this, indexName);
};

/**
 * Get the places object initialized
 *
 * @param callback the result callback with one argument (the Places instance)
 */
CliniaSearchCore.prototype.initPlaces = function() {
  return new PlacesCore(this);
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
  const cliniaAgentWithDelimiter = `; ${cliniaAgent}`;

  if (this._ua.indexOf(cliniaAgentWithDelimiter) === -1) {
    this._ua += cliniaAgentWithDelimiter;
  }
};

/*
 * Wrapper that try all hosts to maximize the quality of service
 */
CliniaSearchCore.prototype._jsonRequest = function(initialOpts) {
  this._checkAppIdData();

  const requestDebug = require('debug')(`cliniasearch:${initialOpts.url}`);
  const safeJSONStringify = require('./safeJSONStringify.js');

  let body;
  let cacheID;
  const additionalUA = initialOpts.additionalUA || '';
  const cache = initialOpts.cache;
  const client = this;
  let tries = 0;
  let usingFallback = false;
  const hasFallback = client._useFallback && client._request.fallback && initialOpts.fallback;
  let headers;

  if (
    this.apiKey.length > MAX_API_KEY_LENGTH &&
    initialOpts.body !== undefined &&
    (initialOpts.body.params !== undefined || // index.search()
      initialOpts.body.requests !== undefined) // client.search()
  ) {
    initialOpts.body.apiKey = this.apiKey;
    headers = this._computeRequestHeaders({
      additionalUA,
      withApiKey: false,
      headers: initialOpts.headers,
    });
  } else {
    headers = this._computeRequestHeaders({
      additionalUA,
      headers: initialOpts.headers,
    });
  }

  if (initialOpts.body !== undefined) {
    body = safeJSONStringify(initialOpts.body);
  }

  requestDebug('request start');
  const debugData = [];

  function doRequest(requester, reqOpts) {
    client._checkAppIdData();

    const startTime = new Date();

    if (client._useCache && !client._useRequestCache) {
      cacheID = initialOpts.url;
    }

    // as we sometime use POST requests to pass parameters (like query='aa'),
    // the cacheID must also include the body to be different between calls
    if (client._useCache && !client._useRequestCache && body) {
      cacheID += `_body_${reqOpts.body}`;
    }

    // handle cache existence
    if (isCacheValidWithCurrentID(!client._useRequestCache, cache, cacheID)) {
      requestDebug('serving response from cache');

      const responseText = cache[cacheID];

      // Cache response must match the type of the original one
      return client._promise.resolve({
        body: JSON.parse(responseText),
        responseText,
      });
    }

    // if we reached max tries
    if (tries >= client.hosts[initialOpts.hostType].length) {
      if (!hasFallback || usingFallback) {
        requestDebug('could not get any response');
        // then stop
        return client._promise.reject(
          new errors.CliniaSearchError(
            `${'Cannot connect to the CliniaSearch API.' + ' Application id was: '}${
              client.applicationID
            }`,
            { debugData }
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
        additionalUA,
        headers: initialOpts.headers,
      });

      reqOpts.timeouts = client._getTimeoutsForRequest(initialOpts.hostType);
      client._setHostIndexByType(0, initialOpts.hostType);
      usingFallback = true; // the current request is now using fallback

      return doRequest(client._request.fallback, reqOpts);
    }

    const currentHost = client._getHostByType(initialOpts.hostType);

    const url = currentHost + reqOpts.url;
    const options = {
      body: reqOpts.body,
      jsonBody: reqOpts.jsonBody,
      method: reqOpts.method,
      headers,
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
      const status =
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

      const httpResponseOk = Math.floor(status / 100) === 2;

      const endTime = new Date();
      debugData.push({
        currentHost,
        headers: removeCredentials(headers),
        content: body || null,
        contentLength: body !== undefined ? body.length : null,
        method: reqOpts.method,
        timeouts: reqOpts.timeouts,
        url: reqOpts.url,
        startTime,
        endTime,
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

      const shouldRetry = Math.floor(status / 100) !== 4;

      if (shouldRetry) {
        tries += 1;

        return retryRequest();
      }

      requestDebug('unrecoverable error');

      // no success and no retry => fail
      const unrecoverableError = new errors.CliniaSearchError(
        httpResponse.body && httpResponse.body.message,
        { debugData, statusCode: status }
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

      const endTime = new Date();
      debugData.push({
        currentHost,
        headers: removeCredentials(headers),
        content: body || null,
        contentLength: body !== undefined ? body.length : null,
        method: reqOpts.method,
        timeouts: reqOpts.timeouts,
        url: reqOpts.url,
        startTime,
        endTime,
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
        (tries >= client.hosts[initialOpts.hostType].length && (usingFallback || !hasFallback))
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

  function isCacheValidWithCurrentID(useRequestCache, currentCache, currentCacheID) {
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
    cacheID += `_body_${body}`;
  }

  if (isCacheValidWithCurrentID(client._useRequestCache, cache, cacheID)) {
    requestDebug('serving request from cache');

    const maybePromiseForCache = cache[cacheID];

    // In case the cache is warmup with value that is not a promise
    const promiseForCache =
      typeof maybePromiseForCache.then !== 'function'
        ? client._promise.resolve({ responseText: maybePromiseForCache })
        : maybePromiseForCache;

    return interopCallbackReturn(promiseForCache, function(content) {
      // In case of the cache request, return the original value
      return JSON.parse(content.responseText);
    });
  }

  const request = doRequest(client._request, {
    url: initialOpts.url,
    method: initialOpts.method,
    body,
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

/** Transform places param object in query string
 * @param {object} args arguments to add to the current query string
 * @param {object} params current query string
 * @return {object} the final query string
 */
CliniaSearchCore.prototype._getPlacesParams = function(args, params) {
  const argCheck = require('./argCheck.js');
  const isArray = require('isarray');
  const logger = require('./logger.js');

  if (args === undefined || args === null) {
    return params;
  }

  if (argCheck.isNotNullOrUndefined(args.size) && typeof args.size !== 'number') {
    logger.warn('Ignoring places query parameter `limit`. Must be a number.');
    delete args.size;
  }

  if (argCheck.isNotNullOrUndefined(args.country) && !isArray(args.country)) {
    logger.warn('Ignoring places query parameter `country`. Must be a string.');
    delete args.country;
  }

  if (argCheck.isNotNullOrUndefined(args.types) && !isArray(args.types)) {
    logger.warn('Ignoring places query parameter `types`. Must be an array.');
    delete args.types;
  }

  return buildQueryParams(args, params);
};

/**
 * Transform suggest param object in query string
 * @param {object} args arguments to add to the current query params
 * @param {object} params current query params
 * @return {object} the final query params
 */
CliniaSearchCore.prototype._getSuggestParams = function(args, params) {
  const argCheck = require('./argCheck.js');
  const logger = require('./logger.js');

  if (args === undefined || args === null) {
    return params;
  }

  if (argCheck.isNotNullOrUndefined(args.size) && typeof args.size !== 'number') {
    logger.warn('Ignoring suggest query parameter `size`. Must be a number.');
    delete args.size;
  }

  if (
    argCheck.isNotNullOrUndefined(args.highlightPreTag) &&
    typeof args.highlightPreTag !== 'string'
  ) {
    logger.warn('Ignoring suggest query parameter `highlightPreTag`. Must be a string.');
    delete args.highlightPreTag;
  }

  if (
    argCheck.isNotNullOrUndefined(args.highlightPostTag) &&
    typeof args.highlightPostTag !== 'string'
  ) {
    logger.warn('Ignoring suggest query parameter `highlightPostTag`. Must be a string.');
    delete args.highlightPostTag;
  }

  return buildQueryParams(args, params);
};

/**
 * Transform search param object in query string
 * @param {object} args arguments to add to the current query string
 * @param {string} params current query string
 * @return {string} the final query string
 */
CliniaSearchCore.prototype._getSearchParams = function(args, params) {
  const argCheck = require('./argCheck.js');
  const isArray = require('isarray');
  const logger = require('./logger.js');

  if (args === undefined || args === null) {
    return params;
  }

  if (argCheck.isNotNullOrUndefined(args.page) && typeof args.page !== 'number') {
    logger.warn('Ignoring search query parameter `page`. Must be a number.');
    delete args.page;
  }

  if (argCheck.isNotNullOrUndefined(args.perPage) && typeof args.perPage !== 'number') {
    logger.warn('Ignoring search query parameter `perPage`. Must be a number.');
    delete args.perPage;
  }

  if (argCheck.isNotNullOrUndefined(args.searchFields) && !isArray(args.searchFields)) {
    logger.warn('Ignoring search query parameter `searchFields`. Must be an array.');
    delete args.searchFields;
  }

  if (argCheck.isNotNullOrUndefined(args.queryType) && typeof args.queryType !== 'string') {
    logger.warn('Ignoring search query parameter `queryType`. Must be an array.');
    delete args.queryType;
  }

  if (argCheck.isNotNullOrUndefined(args.location) && typeof args.location !== 'string') {
    logger.warn('Ignoring search query parameter `location`. Must be a string.');
    delete args.location;
  }

  if (argCheck.isNotNullOrUndefined(args.aroundLatLng) && typeof args.aroundLatLng !== 'string') {
    logger.warn('Ignoring search query parameter `aroundLatLng`. Must be a string.');
    delete args.aroundLatLng;
  }

  if (
    argCheck.isNotNullOrUndefined(args.insideBoundingBox) &&
    typeof args.insideBoundingBox !== 'string'
  ) {
    logger.warn('Ignoring search query parameter `insideBoundingBox`. Must be a string.');
    delete args.insideBoundingBox;
  }

  return buildQueryParams(args, params);
};

/**
 * Compute the headers for a request
 *
 * @param [string] options.additionalUA semi-colon separated string with other user agents to add
 * @param [boolean=true] options.withApiKey Send the api key as a header
 * @param [Object] options.headers Extra headers to send
 */
CliniaSearchCore.prototype._computeRequestHeaders = function(options) {
  const forEach = require('foreach');

  const ua = options.additionalUA ? `${this._ua}; ${options.additionalUA}` : this._ua;

  const requestHeaders = {
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
 * Get suggestions based on a query
 * @param  {Object} args  The query parmeters.
 * @param {string} query The query to get suggestions for
 * @param {string} args.size Max number of suggestions to receive
 * @param {string} args.highlightPreTag The pre tag used to highlight matched query parts
 * @param {string} args.highlightPostTag The post tag used to highlight matched query parts
 * @param  {Function} callback Callback to be called
 * @return {Promise|undefined} Returns a promise if no callback given
 */
CliniaSearchCore.prototype.suggest = function(query, args, callback) {
  const normalizeParams = require('./normalizeMethodParameters');

  // Normalizing the function signature
  const normalizedParameters = normalizeParams(query, args, callback);
  query = normalizedParameters[0];
  args = normalizedParameters[1];
  callback = normalizedParameters[2];

  let params = '';

  params += `query=${encodeURIComponent(query)}` || '';

  let additionalUA;
  if (args !== undefined) {
    if (args.additionalUA) {
      additionalUA = args.additionalUA;
      delete args.additionalUA;
    }
  }

  // `_getSuggestParams` will augment params
  params = this._getSuggestParams(args, params);

  return this._suggest(params, callback, additionalUA);
};

CliniaSearchCore.prototype._suggest = function(params, callback, additionalUA) {
  return this._jsonRequest({
    cache: this.cache,
    method: 'POST',
    url: '/search/v1/indexes/suggestions/query',
    body: { params },
    hostType: 'read',
    fallback: {
      method: 'GET',
      url: '/search/v1/indexes/suggestions/query',
      body: { params },
    },
    additionalUA,
    callback,
  });
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
CliniaSearchCore.prototype.search = function(queries, opts, callback) {
  const isArray = require('isarray');
  const map = require('./map.js');

  const usage = 'Usage: client.search(arrayOfQueries[, callback])';

  if (!isArray(queries)) {
    throw new Error(usage);
  }

  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else if (opts === undefined) {
    opts = {};
  }

  const client = this;

  const postObj = {
    requests: map(queries, function prepareRequest(query) {
      let params = '';

      // allow query.query
      // so we are mimicing the index.search(query, params) method
      // {indexName:, query:, params:}
      if (query.query !== undefined) {
        params += `query=${encodeURIComponent(query.query)}`;
      }

      return {
        indexName: query.indexName,
        params: client._getSearchParams(query.params, params),
      };
    }),
  };

  const JSONPParams = map(postObj.requests, function prepareJSONPParams(request, requestId) {
    return `${requestId}=${encodeURIComponent(`/1/indexes/${encodeURIComponent(request.indexName)}?${request.params}`)}`;
  }).join('&');

  const url = '/search/v1/indexes/*/queries';

  // Not used at the moment
  if (opts.strategy !== undefined) {
    postObj.strategy = opts.strategy;
  }

  return this._jsonRequest({
    cache: this.cache,
    method: 'POST',
    url,
    body: postObj,
    hostType: 'read',
    fallback: {
      method: 'GET',
      url: 'search/v1/indexes/*',
      body: {
        params: JSONPParams,
      },
    },
    callback,
  });
};

/**
 * Set the extra security tagFilters header
 * @param {string|array} tags The list of tags defining the current security filters
 */
CliniaSearchCore.prototype.setSecurityTags = function(tags) {
  if (Object.prototype.toString.call(tags) === '[object Array]') {
    const strTags = [];
    for (let i = 0; i < tags.length; ++i) {
      if (Object.prototype.toString.call(tags[i]) === '[object Array]') {
        const oredTags = [];
        for (let j = 0; j < tags[i].length; ++j) {
          oredTags.push(tags[i][j]);
        }
        strTags.push(`(${oredTags.join(',')})`);
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
  const data = store.get(this.applicationID);
  if (data !== null) this._cacheAppIdData(data);

  return data;
};

CliniaSearchCore.prototype._setAppIdData = function(data) {
  data.lastChange = new Date().getTime();
  this._cacheAppIdData(data);

  return store.set(this.applicationID, data);
};

CliniaSearchCore.prototype._checkAppIdData = function() {
  const data = this._getAppIdData();
  const now = new Date().getTime();
  if (data === null || now - data.lastChange > RESET_APP_DATA_TIMER) {
    return this._resetInitialAppIdData(data);
  }

  return data;
};

CliniaSearchCore.prototype._resetInitialAppIdData = function(data) {
  const newData = data || {};
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
  const foreach = require('foreach');
  const currentData = this._getAppIdData();
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
  const clone = require('./clone');
  const newHostIndexes = clone(this._hostIndexes);
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
  const timeoutMultiplier = Math.max(this._timeoutMultiplier + 1, 4);

  return this._partialAppIdDataUpdate({ timeoutMultiplier });
};

CliniaSearchCore.prototype._getTimeoutsForRequest = function(hostType) {
  return {
    connect: this._timeouts.connect * this._timeoutMultiplier,
    complete: this._timeouts[hostType] * this._timeoutMultiplier,
  };
};

function buildQueryParams(args, params) {
  const safeJSONStringify = require('./safeJSONStringify.js');
  for (const key in args) {
    if (key !== null && args[key] !== undefined && args.hasOwnProperty(key)) {
      params += params === '' ? '' : '&';
      const type = Object.prototype.toString.call(args[key]);
      params += `${key}=${encodeURIComponent(
        type === '[object Array]' || type === '[object Object]'
          ? safeJSONStringify(args[key])
          : args[key]
      )}`;
    }
  }

  return params;
}

function prepareHost(protocol) {
  return function prepare(host) {
    return `${protocol}//${host.toLowerCase()}`;
  };
}

function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

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
  const newHeaders = {};

  for (const headerName in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, headerName)) {
      var value;

      if (headerName === 'x-clinia-api-key' || headerName === 'x-clinia-application-id') {
        value = '**hidden for security purposes**';
      } else {
        value = headers[headerName];
      }

      newHeaders[headerName] = value;
    }
  }

  return newHeaders;
}
