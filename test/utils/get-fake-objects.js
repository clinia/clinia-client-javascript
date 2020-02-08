module.exports = getFakeObjects;

const Chance = require('chance');
const random = require('lodash-compat/number/random');
const times = require('lodash-compat/utility/times');

const chance = new Chance();

function getFakeObjects(numRecords) {
  if (numRecords === undefined) {
    numRecords = 10;
  }

  return times(numRecords, getOneRecord);
}

function getOneRecord() {
  return {
    id: chance.word({ length: 10 }),
    name: chance.paragraph({ sentences: random(1, 3) }),
  };
}
