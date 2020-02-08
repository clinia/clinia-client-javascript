module.exports = getFakeRecordsResponse;

const random = require('lodash-compat/number/random');

const getFakeObjects = require('./get-fake-objects');

function getFakeRecordsResponse() {
  const nbHits = random(1, 10);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: {
      records: getFakeObjects(nbHits),
      meta: {
        numHits: nbHits,
        page: 0,
        perPage: 20,
        processingTimeMS: 1,
      },
    },
  };
}
