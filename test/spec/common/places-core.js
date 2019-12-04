'use-strict';

var test = require('tape');
var PlacesCore = require('../../../src/PlacesCore');

test('PlacesCore.prototype._buildUrl()', function(t) {
  t.equal(
    PlacesCore.prototype._buildUrl(),
    '/location/v1/autocomplete?'
  );
  t.end();
});

test('PlacesCore.prototype._buildUrl(undefined, `en`)', function(t) {
  t.equal(
    PlacesCore.prototype._buildUrl(undefined, 'en'),
    '/location/v1/autocomplete?locale=en'
  );
  t.end();
});

test('PlacesCore.prototype._buildUrl(undefined, `{locale: `en`}`)', function(t) {
  t.equal(
    PlacesCore.prototype._buildUrl(undefined, {locale: 'en'}),
    '/location/v1/autocomplete?locale=%5Bobject%20Object%5D'
  );
  t.end();
});

test('PlacesCore.prototype._buildUrl(`/location?`, `{locale: `en`}`)', function(t) {
  t.equal(
    PlacesCore.prototype._buildUrl('/location?', 'en'),
    '/location?locale=en'
  );
  t.end();
});

test('PlacesCore.prototype._buildUrl(`/location`, `{locale: `en`}`)', function(t) {
  t.equal(
    PlacesCore.prototype._buildUrl('/location', 'en'),
    '/location?locale=en'
  );
  t.end();
});

