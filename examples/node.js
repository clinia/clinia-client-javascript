'use strict';

// node examples/node.js
var cliniasearch = require('../');
var client = cliniasearch('TODO', 'ClM5vDTmS4GWEL0aS7osJaRkowV8McuP', {
  hosts: {
    write: ['api.partner.staging.clinia.ca'],
    read: ['api.partner.staging.clinia.ca']
  }
});
var index = client.initIndex('health_facility');

index.search('sons', function(err, results) {
  if (err) {
    throw err;
  }

  console.log('We got `' + results.meta.total + '` results');
  console.log('Here is the first one: ', results.records[0]);

  // call client.destroy() this when you need to stop the node.js client
  // it will release any keepalived connection
  client.destroy();
});
