'use strict';

if (
  !process.env.INTEGRATION_TEST_API_KEY ||
  !process.env.INTEGRATION_TEST_APPID
) {
  throw new Error(
    'missing: INTEGRATION_TEST_APPID=$APPID INTEGRATION_TEST_API_KEY=$APIKEY command'
  );
}

// simple integration tests, checking the whole communication
var _ = require('lodash-compat');
// var arrayFrom = require('array.from');
var Chance = require('chance');
var test = require('tape');

// var getFakeObjects = require('./utils/get-fake-objects');

var isABrowser = process.browser;
// var canPUT = !isABrowser || require('faux-jax').support.xhr.cors;
// var canDELETE = canPUT;

// ensure that on the browser we use the global cliniasearch,
// so that we are absolutely sure the builded version exposes cliniasearch
// in browser integration tests
var cliniasearch;
if (isABrowser) {
  cliniasearch = window.cliniasearch;
} else {
  // on nodejs, we require cliniasearch
  cliniasearch = require('../');
}

var chance = new Chance();
var apiKey = process.env.INTEGRATION_TEST_API_KEY;
var appId = process.env.INTEGRATION_TEST_APPID;
var indexName =
  'health_facility' +
  (process.env.TRAVIS_BUILD_NUMBER || 'DEV') +
  chance.word({length: 12});

var client = cliniasearch(appId, apiKey, {
  protocol: 'https:',
  _useCache: false
});
var index = client.initIndex(indexName);
// var objects = getFakeObjects(50);

// force all index.commands to be bound to the index object,
// avoid having to type index.waitTask.bind(index)
_.bindAll(index);

test('fallback strategy success', dnsFailThenSuccess);
test(
  'fallback strategy success, not a search method',
  dnsFailThenSuccessNoSearch
);
test('fallback strategy all servers fail', dnsFailed);

if (!process.browser) {
  test('using a http proxy to https', proxyHttpToHttps);
}

test(
  'places with credentials',
  initPlaces(process.env.PLACES_APPID, process.env.PLACES_APIKEY)
);
test('places without credentials', initPlaces());

if (!isABrowser) {
  test('client.destroy', destroy);
}

function initPlaces(placesAppId, placesApiKey) {
  return function(t) {
    t.plan(2);
    var places = cliniasearch.initPlaces(placesAppId, placesApiKey);

    places.search('paris').then(
      function(res) {
        t.ok(res.nbHits > 0, 'We got some results by querying `paris`');
      },
      function(e) {
        t.fail(e);
      }
    );

    places.reverse({aroundLatLng: '48.880397, 2.326991'}).then(
      function(res) {
        t.ok(
          res.nbHits > 0,
          'We got some results by querying with {aroundLatLng:`48.880397, 2.326991`}'
        );
      },
      function(e) {
        t.fail(e);
      }
    );
  };
}

test('Analytics AB Tests', testAnalytics);

function testAnalytics(t) {
  t.plan(1);
  var analytics = client.initAnalytics();
  analytics.getABTests().then(
    function(res) {
      t.ok(res.total >= res.count, 'We were able to call the analytics API');
    },
    function(e) {
      t.fail(e);
    }
  );
}

function proxyHttpToHttps(t) {
  t.plan(1);

  var http = require('http');
  var setup = require('proxy');

  var server = setup(http.createServer());

  server.listen(0, function() {
    var tunnel = require('tunnel-agent');

    var agentSettings = {
      proxy: {
        host: server.address().host,
        port: server.address().port
      }
    };

    var proxyClient = cliniasearch(appId, apiKey, {
      httpAgent: tunnel.httpsOverHttp(agentSettings)
    });
    var proxyIndex = proxyClient.initIndex(indexName);
    proxyIndex
      .browse()
      .then(end)
      .then(null, _.bind(t.error, t));

    function end(content) {
      server.close();
      proxyClient.destroy();
      t.ok(content.hits.length, 'We got some content');
    }
  });
}


function dnsFailThenSuccess(t) {
  t.plan(4);

  var firstSearchTiming;
  var firstSearchStart = new Date().getTime();
  var client_ = cliniasearch(appId, apiKey, {
    // .biz is a black hole DNS name (not resolving)
    hosts: [appId + '-dsn.clinia.biz', appId + '-dsn.clinia.net']
  });

  var index_ = client_.initIndex(indexName);
  var connectTimeout = isABrowser ? 1000 : 2000;
  index_.search('').then(
    function(content) {
      var now = new Date().getTime();
      firstSearchTiming = now - firstSearchStart;
      // skipped this test, because in some cases (iOS 11.0) the timeout happens faster than we specified
      t.skip(
        firstSearchTiming > connectTimeout,
        'first search takes more than 2s because of connect timeout = 2s. ' +
          firstSearchTiming
      );
      t.ok(content.hits.length > 0, 'hits should not be empty');
      secondSearch();
    },
    function() {
      t.fail(
        'No error should be generated as it should lastly route to a good domain.'
      );
    }
  );

  function secondSearch() {
    var secondSearchStart = new Date().getTime();
    var secondSearchTiming;
    index_.search('a').then(
      function(content) {
        if (!isABrowser) {
          client_.destroy();
        }
        var now = new Date().getTime();
        secondSearchTiming = now - secondSearchStart;
        // skipped this test, because in some cases (iOS 11.0) the timeout happens faster than we specified
        t.skip(
          secondSearchTiming < connectTimeout,
          'second search is fast because we know .biz is failing. ' +
            secondSearchTiming
        );
        t.ok(content.hits.length > 0, 'hits should not be empty');
      },
      function() {
        t.fail(
          'No error should be generated as it should lastly route to a good domain.'
        );
      }
    );
  }
}

function dnsFailThenSuccessNoSearch(t) {
  t.plan(1);

  var client_ = cliniasearch(appId, apiKey, {
    // .biz is a black hole DNS name (not resolving)
    hosts: [appId + '-dsn.clinia.biz', appId + '-dsn.clinia.net'],
    protocol: 'https:'
  });

  client_.listIndexes().then(
    function(content) {
      if (!isABrowser) {
        client_.destroy();
      }
      t.ok(content.items.length > 0, 'we found a list of indices');
    },
    function() {
      t.fail(
        'No error should be generated as it should lastly route to a good domain.'
      );
    }
  );
}

function dnsFailed(t) {
  t.plan(1);
  var client_ = cliniasearch(appId, apiKey, {
    hosts: [appId + '-dsn.clinia.biz']
  });

  var index_ = client_.initIndex(indexName);

  index_.search('').then(
    function() {
      t.fail('Should fail as no host are reachable');
      t.end();
    },
    function() {
      if (!isABrowser) {
        client_.destroy();
      }
      t.pass('An error was triggered');
      t.end();
    }
  );
}

function destroy(t) {
  client.destroy();
  t.end();
}
