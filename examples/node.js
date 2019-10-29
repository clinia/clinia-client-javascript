'use strict';

// node examples/node.js
var cliniasearch = require('../');
var client = cliniasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
var index = client.initIndex('health_facility');

index.search('Pharmacy', function(err, results) {
  if (err) {
    throw err;
  }

  console.log('We got `' + results.nbHits + '` results');
  console.log('Here is the first one: ', results.hits[0]);

  // call client.destroy() this when you need to stop the node.js client
  // it will release any keepalived connection
  client.destroy();
});
