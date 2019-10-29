'use strict';

var bind = require('lodash-compat/function/bind');
var test = require('tape');

var cliniasearch = require('../../../');

test('cliniasearch()', function(t) {
  t.throws(cliniasearch, Error, 'No parameters throws');

  t.end();
});

test('cliniasearch(applicationID)', function(t) {
  t.throws(
    bind(cliniasearch, null, 'dsa'),
    Error,
    'Only `applicationID` throws'
  );

  t.end();
});

test('cliniasearch(applicationID, apiKey)', function(t) {
  t.doesNotThrow(
    bind(cliniasearch, null, 'dsa', 'hey'),
    'Providing required parameters does not throw'
  );

  t.end();
});

test('cliniasearch.version returns the package version', function(t) {
  t.equal(
    cliniasearch.version,
    require('../../../package.json').version,
    'We get the package version in cliniasearch.version'
  );
  t.end();
});
