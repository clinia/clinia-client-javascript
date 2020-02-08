module.exports = createFixture;

function createFixture(opts) {
  const cliniasearch = require('../../');
  const getCredentials = require('./get-credentials');

  opts = opts || {};

  const credentials = opts.credentials || getCredentials();

  const client = cliniasearch(
    credentials.applicationID,
    credentials.searchOnlyAPIKey,
    opts.clientOptions
  );
  const index = client.initIndex(opts.indexName || credentials.indexName);

  return {
    client,
    index,
    credentials,
    cliniasearch,
  };
}
