'use strict';

module.exports = createFixture;

function createFixture(opts) {
  var cliniasearch = require('../../');
  var getCredentials = require('./get-credentials');

  opts = opts || {};

  var credentials = opts.credentials || getCredentials();

  var client = cliniasearch(
    credentials.applicationID,
    credentials.searchOnlyAPIKey,
    opts.clientOptions
  );
  var index = client.initIndex(opts.indexName || credentials.indexName);

  return {
    client: client,
    index: index,
    credentials: credentials,
    cliniasearch: cliniasearch
  };
}
