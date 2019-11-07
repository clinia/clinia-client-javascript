module.exports = CliniaSearch;

var CliniaSearchCore = require('./CliniaSearchCore.js');
var inherits = require('inherits');
// var errors = require('./errors');

function CliniaSearch() {
  CliniaSearchCore.apply(this, arguments);
}

inherits(CliniaSearch, CliniaSearchCore);

// We do not provide write API at the moment

// function notImplemented() {
//   var message =
//     'Not implemented in this environment.\n' +
//     'If you feel this is a mistake, write to support@clinia.ca';

//   throw new errors.CliniaSearchError(message);
// }
