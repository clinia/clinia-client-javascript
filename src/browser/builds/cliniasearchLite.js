'use strict';

var CliniaSearchCore = require('../../CliniaSearchCore.js');
var createCliniasearch = require('../createCliniasearch.js');

module.exports = createCliniasearch(CliniaSearchCore, 'Browser (lite)');
