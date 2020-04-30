'use strict';

// node examples/node.js
var cliniasearch = require('../');
var client = cliniasearch('demo-pharmacies', 'KcLxBhVFP8ooPgQODlAxWqfNg657fTz9', {
  queryParameters: {locale: 'fr'}
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

var places = client.initPlaces();
places.suggest('mon', function(err, results) {
  if (err) {
    throw err;
  }

  console.log('We got `' + results.length + '` results');
  console.log('Here is the first one: ', results[0]);
});
