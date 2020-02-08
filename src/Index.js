const inherits = require('inherits');
const IndexCore = require('./IndexCore.js');

module.exports = Index;

function Index() {
  IndexCore.apply(this, arguments);
}

// We do not provide write API at the moment

inherits(Index, IndexCore);
