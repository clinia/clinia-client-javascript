const test = require('tape');

const errors = require('../../../src/errors');

test('We get custom errors with stacks', function() {
  return new Promise(t => {
    t.plan(3);

    const fauxJax = require('faux-jax');

    const createFixture = require('../../utils/create-fixture');
    const fixture = createFixture();
    const index = fixture.index;

    fauxJax.install({ gzip: true });

    fauxJax.once('request', function(req) {
      req.respond(400, {}, '{"message": "GOAWAY!", "status": 400}');
      fauxJax.restore();
    });

    index.search('something', function(err) {
      t.ok(err instanceof Error, 'Its an instance of Error');
      t.ok(err instanceof errors.CliniaSearchError, 'Its an instance of CliniaSearchError');
      t.ok(err.stack, 'We have a stacktrace');
    });
  });
});
