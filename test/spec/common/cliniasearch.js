const bind = require('lodash-compat/function/bind');
const test = require('tape');

const cliniasearch = require('../../../');

test('cliniasearch()', function() {
  return new Promise(t => {
    t.throws(cliniasearch, Error, 'No parameters throws');

    t.end();
  });
});

test('cliniasearch(applicationID)', function() {
  return new Promise(t => {
    t.throws(bind(cliniasearch, null, 'dsa'), Error, 'Only `applicationID` throws');

    t.end();
  });
});

test('cliniasearch(applicationID, apiKey)', function() {
  return new Promise(t => {
    t.doesNotThrow(
      bind(cliniasearch, null, 'dsa', 'hey'),
      'Providing required parameters does not throw'
    );

    t.end();
  });
});

test('cliniasearch.version returns the package version', function() {
  return new Promise(t => {
    t.equal(
      cliniasearch.version,
      require('../../../package.json').version,
      'We get the package version in cliniasearch.version'
    );
    t.end();
  });
});
