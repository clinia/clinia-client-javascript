'use strict';

var test = require('tape');

test('window.__clinia', function(t) {
  t.plan(4);

  var cliniasearch = require('../../../');

  t.ok(window.__clinia, 'we exported it');
  t.equal(
    window.__clinia.cliniasearch.version,
    cliniasearch.version,
    'version matches'
  );
  t.equal(window.__clinia.cliniasearch.ua, cliniasearch.ua, 'ua matches');
  t.ok(window.__clinia.debug, 'debug is present');
});
