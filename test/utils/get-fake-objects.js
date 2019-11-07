'use strict';

module.exports = getFakeObjects;

var Chance = require('chance');
var random = require('lodash-compat/number/random');
var times = require('lodash-compat/utility/times');

var chance = new Chance();

function getFakeObjects(numRecords) {
  if (numRecords === undefined) {
    numRecords = 10;
  }

  return times(numRecords, getOneRecord);
}

function getOneRecord() {
  return {
    id: chance.word({length: 10}),
    name: chance.paragraph({sentences: random(1, 3)})
  };
}
