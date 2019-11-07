'use strict';

module.exports = getFakeRecordsResponse;

var random = require('lodash-compat/number/random');

var getFakeObjects = require('./get-fake-objects');

function getFakeRecordsResponse() {
  var nbHits = random(1, 10);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: {
      records: getFakeObjects(nbHits),
      meta: {
        numHits: nbHits,
        page: 0,
        perPage: 20,
        processingTimeMS: 1
      }
    }
  };
}
