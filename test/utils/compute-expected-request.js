'use strict';

module.exports = computeExpectedRequest;

var merge = require('lodash-compat/object/merge');
var format = require('util').format;

var cliniasearch = require('../../');

function computeExpectedRequest(expectedRequest, credentials) {
  expectedRequest.URL = merge(
    getRequestURL(credentials),
    expectedRequest.URL || {}
  );

  if (expectedRequest.URL.pathname.indexOf('%s') !== -1) {
    expectedRequest.URL.pathname = format(
      expectedRequest.URL.pathname,
      encodeURIComponent(credentials.indexName)
    );
  }

  // default method
  expectedRequest.method = expectedRequest.method || 'GET';

  expectedRequest.headers = expectedRequest.headers || {};

  if (expectedRequest.body === undefined) {
    expectedRequest.body = null;
  }

  expectedRequest.headers.accept = 'application/json';

  if (expectedRequest.body !== null) {
    // CORS simple request
    if (process.browser && expectedRequest.method === 'POST') {
      expectedRequest.headers['content-type'] =
        'application/x-www-form-urlencoded';
    } else {
      expectedRequest.headers['content-type'] = 'application/json';
    }
  }

  if (!process.browser) {
    expectedRequest.headers['x-clinia-api-key'] = credentials.searchOnlyAPIKey;
    expectedRequest.headers['x-clinia-application-id'] =
      credentials.applicationID;
    expectedRequest.headers['x-clinia-agent'] = cliniasearch.ua;
    expectedRequest.headers['accept-encoding'] = 'gzip,deflate';
  }

  return expectedRequest;
}

function getRequestURL(credentials) {
  var expectedQueryString;

  if (process.browser) {
    expectedQueryString = {
      'x-clinia-api-key': credentials.searchOnlyAPIKey,
      'x-clinia-application-id': credentials.applicationID,
      'x-clinia-agent': cliniasearch.ua
    };
  } else {
    // serverside will send them in headers
    expectedQueryString = {};
  }

  return {
    protocol: 'https:',
    URL: {pathname: '/not-set'},
    query: expectedQueryString
  };
}
