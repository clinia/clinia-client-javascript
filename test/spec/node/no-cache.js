const test = require('tape');

test('no cache between two requests', function() {
  return new Promise(t => {
    t.plan(6);

    const fauxJax = require('faux-jax');

    fauxJax.install({ gzip: true });

    const createFixture = require('../../utils/create-fixture');
    const fixture = createFixture();
    const index = fixture.index;

    function firstSearch(cb) {
      index.search('HAI', function(err, content) {
        t.error(err, 'No error for first search');
        t.deepEqual(
          content,
          {
            hai: 1,
          },
          'Content matches for first response'
        );
        cb();
      });

      fauxJax.once('request', function(req) {
        t.pass('First request');
        req.respond(200, {}, '{"hai": 1}');
      });
    }

    firstSearch(secondSearch);

    function secondSearch() {
      index.search('HAI', function(err, content) {
        t.error(err, 'No error for first search');
        t.deepEqual(content, {
          hai: 2,
        });

        fauxJax.restore();
      });

      fauxJax.once('request', function(req) {
        t.pass('First request');
        req.respond(200, {}, '{"hai": 2}');
      });
    }
  });
});
