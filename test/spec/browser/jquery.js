/* eslint new-cap: 0 */

const test = require('tape');

test('jQuery module success case', function() {
  return new Promise(t => {
    const fauxJax = require('faux-jax');
    const parse = require('url-parse');

    if (fauxJax.support.xhr.cors) {
      t.plan(10);
    } else {
      t.plan(9);
    }

    // load jQuery Clinia Search module
    require('../../../src/browser/builds/cliniasearch.jquery');

    t.ok(window.$.clinia, 'we exported an `clinia` property on jQuery');

    const client = window.$.clinia.Client('jquery-success-applicationID', 'jquery-success-apiKey');
    const index = client.initIndex('jquery-success-indexName');

    fauxJax.install();

    fauxJax.waitFor(2, function(err, requests) {
      t.error(err);
      t.equal(requests.length, 2, 'Two requests made');

      const firstRequest = requests[0];
      const secondRequest = requests[1];
      const requestURL = parse(firstRequest.requestURL, true);

      if (fauxJax.support.xhr.cors) {
        t.deepEqual(
          firstRequest.requestHeaders,
          {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          'requestHeaders matches'
        );
      }

      t.equal(
        requestURL.host,
        'jquery-success-applicationid-dsn.clinia.net',
        'requestURL host matches'
      );

      t.equal(
        requestURL.pathname,
        '/search/v1/indexes/jquery-success-indexName/query',
        'requestURL pathname matches'
      );

      t.deepEqual(
        requestURL.query,
        {
          'x-clinia-api-key': 'jquery-success-apiKey',
          'x-clinia-application-id': 'jquery-success-applicationID',
          'x-clinia-agent': window.$.clinia.ua,
        },
        'requestURL query matches'
      );

      firstRequest.respond(
        200,
        {},
        JSON.stringify({
          YAW: 'jquery-promise',
        })
      );

      secondRequest.respond(
        200,
        {},
        JSON.stringify({
          YAW: 'jquery-cb',
        })
      );

      fauxJax.restore();
    });

    index.search('jquery-success-promise').done(function searchDone(content) {
      t.deepEqual(content, {
        YAW: 'jquery-promise',
      });
    });

    index.search('jquery-success-callback', function searchDone(err, content) {
      t.error(err, 'No error while using the jQuery module');
      t.deepEqual(content, {
        YAW: 'jquery-cb',
      });
    });
  });
});
