'use-strict';

const test = require('tape');
const PlacesCore = require('../../../src/PlacesCore');

test('PlacesCore.prototype._buildUrl()', function() {
  return new Promise(t => {
    t.equal(PlacesCore.prototype._buildUrl(), '/location/v1/autocomplete?');
    t.end();
  });
});

test('PlacesCore.prototype._buildUrl(undefined, `en`)', function() {
  return new Promise(t => {
    t.equal(PlacesCore.prototype._buildUrl(undefined, 'en'), '/location/v1/autocomplete?locale=en');
    t.end();
  });
});

test('PlacesCore.prototype._buildUrl(undefined, `{locale: `en`}`)', function() {
  return new Promise(t => {
    t.equal(
      PlacesCore.prototype._buildUrl(undefined, { locale: 'en' }),
      '/location/v1/autocomplete?locale=%5Bobject%20Object%5D'
    );
    t.end();
  });
});

test('PlacesCore.prototype._buildUrl(`/location?`, `{locale: `en`}`)', function() {
  return new Promise(t => {
    t.equal(PlacesCore.prototype._buildUrl('/location?', 'en'), '/location?locale=en');
    t.end();
  });
});

test('PlacesCore.prototype._buildUrl(`/location`, `{locale: `en`}`)', function() {
  return new Promise(t => {
    t.equal(PlacesCore.prototype._buildUrl('/location', 'en'), '/location?locale=en');
    t.end();
  });
});
