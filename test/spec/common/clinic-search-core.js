// var bind = require('lodash-compat/function/bind');
const test = require('tape');
const safeJSONStringify = require('../../../src/safeJSONStringify.js');

const CliniaSearchCore = require('../../../src/CliniaSearchCore');

// SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({}, 'query=query'),
      'query=query',
      'Empty search params return existing params'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams(undefined)', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams(undefined, 'query=query'),
      'query=query',
      'Undefined search params return existing params'
    );
    t.end();
  });
});

// SEARCH PARAMS PAGE
test('cliniaSearchCore._getSearchParams({page:[]})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ page: [] }, ''),
      '',
      'Invalid `page` search params return empty params'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams({page:1})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ page: 1 }, ''),
      'page=1',
      'Valid `page` search param populates params'
    );
    t.end();
  });
});

// SEARCH PARAMS PERPAGE
test('cliniaSearchCore._getSearchParams({perPage:[]})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ perPage: [] }, ''),
      '',
      'Invalid `perPage` search params return empty params'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams({perPage:1})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ perPage: 1 }, ''),
      'perPage=1',
      'Valid `perPage` search param populates params'
    );
    t.end();
  });
});

// QUERYTYPES SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({queryType:{}})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ queryType: {} }, ''),
      '',
      'Invalid `queryType` search param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams({queryType:`prefix_last`})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ queryType: 'prefix_last' }, ''),
      'queryType=prefix_last',
      'Valid `queryType` search param return empty params.'
    );
    t.end();
  });
});

// SEARCHFIELDS SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({searchFields:{}})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ searchFields: {} }, ''),
      '',
      'Invalid `searchFields` search param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams({searchFields:[`name`]})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ searchFields: ['name'] }, ''),
      `searchFields=${encodeURIComponent(safeJSONStringify(['name']))}`,
      'Valid `searchFields` search param return empty params.'
    );
    t.end();
  });
});

// LOCATION SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({location:{}})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ location: {} }, ''),
      '',
      'Invalid `location` search param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams({location:`montreal`})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ location: 'montreal' }, ''),
      'location=montreal',
      'Valid `searchFields` search param return empty params.'
    );
    t.end();
  });
});

// AROUNDLATLNG SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({aroundLatLng:{}})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ aroundLatLng: {} }, ''),
      '',
      'Invalid `aroundLatLng` search param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams({aroundLatLng:`montreal`})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ aroundLatLng: 'montreal' }, ''),
      'aroundLatLng=montreal',
      'Valid `searchFields` search param return empty params.'
    );
    t.end();
  });
});

// INSIDEBOUNDINGBOX SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({insideBoundingBox:{}})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ insideBoundingBox: {} }, ''),
      '',
      'Invalid `insideBoundingBox` search param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams({insideBoundingBox:`montreal`})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSearchParams({ insideBoundingBox: 'montreal' }, ''),
      'insideBoundingBox=montreal',
      'Valid `searchFields` search param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSearchParams(validParams, {})', function() {
  return new Promise(t => {
    const params = {
      documentTypes: ['health_facility'],
      queryType: 'prefix_last',
      location: '3578 rue Dorion, Montreal',
      aroundLatLng: '45.98123123,-73.1231432',
      insideBoundingBox: '45.98123123,-73.1231432,12.38353485,-23.23232323',
      page: 0,
      perPage: 50,
      customField: 'custom',
    };
    t.equal(
      CliniaSearchCore.prototype._getSearchParams(params, ''),
      'documentTypes=%5B%22health_facility%22%5D&queryType=prefix_last&location=3578%20rue%20Dorion%2C%20Montreal&aroundLatLng=45.98123123%2C-73.1231432&insideBoundingBox=45.98123123%2C-73.1231432%2C12.38353485%2C-23.23232323&page=0&perPage=50&customField=custom',
      'Valid search params type populates search params'
    );
    t.end();
  });
});

// SUGGEST PARAMS
test('cliniaSearchCore._getSuggestParams({})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSuggestParams({}, ''),
      '',
      'Empty suggest params return existing params'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSuggestParams(undefined)', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSuggestParams(undefined, ''),
      '',
      'Undefined suggest params return existing params'
    );
    t.end();
  });
});

// SUGGEST SIZE PARAMS
test('cliniaSearchCore._getSuggestParams({size:``})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSuggestParams({ size: '' }, ''),
      '',
      'Invalid `types` suggest param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSuggestParams({size:8})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSuggestParams({ size: 8 }, ''),
      'size=8',
      'Valid `types` suggest param pupolates params.'
    );
    t.end();
  });
});

// SUGGEST HIGHLIGHTPRETAG PARAMS
test('cliniaSearchCore._getSuggestParams({highlightPreTag:8})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSuggestParams({ highlightPreTag: 8 }, ''),
      '',
      'Invalid `highlightPreTag` suggest param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSuggestParams({highlightPreTag:<strong>})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSuggestParams({ highlightPreTag: '<strong>' }, ''),
      'highlightPreTag=%3Cstrong%3E',
      'Valid `highlightPreTag` suggest param pupolates params.'
    );
    t.end();
  });
});

// SUGGEST HIGHLIGHTPOSTTAG PARAMS
test('cliniaSearchCore._getSuggestParams({highlightPostTag:8})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSuggestParams({ highlightPostTag: 8 }, ''),
      '',
      'Invalid `highlightPostTag` suggest param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSuggestParams({highlightPostTag:</strong>})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getSuggestParams({ highlightPostTag: '</strong>' }, ''),
      'highlightPostTag=%3C%2Fstrong%3E',
      'Valid `highlightPostTag` suggest param pupolates params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getSuggestParams(validParams, {})', function() {
  return new Promise(t => {
    const params = {
      size: 5,
      highlightPreTag: '<strong>',
      highlightPostTag: '</strong>',
      customField: 'custom',
    };
    t.equal(
      CliniaSearchCore.prototype._getSearchParams(params, 'query=query'),
      'query=query&size=5&highlightPreTag=%3Cstrong%3E&highlightPostTag=%3C%2Fstrong%3E&customField=custom',
      'Valid search params type populates search params'
    );
    t.end();
  });
});

// PLACES PARAMS
test('cliniaSearchCore._getPlacesParams({})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getPlacesParams({}, 'query=query'),
      'query=query',
      'Empty places param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getPlacesParams(undefined)', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getPlacesParams(undefined, 'query=query'),
      'query=query',
      'Undefined places suggest param populates params.'
    );
    t.end();
  });
});

// PLACES COUNTRY PARAMS
test('cliniaSearchCore._getPlacesParams({country:8})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getPlacesParams({ country: 8 }, ''),
      '',
      'Invalid `country` places param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getPlacesParams({country:`CA`})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getPlacesParams({ country: ['CA'] }, ''),
      'country=%5B%22CA%22%5D',
      'Valid `country` places suggest param populates params.'
    );
    t.end();
  });
});

// PLACES SIZE PARAMS
test('cliniaSearchCore._getPlacesParams({size:``})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getPlacesParams({ size: 'CA' }, ''),
      '',
      'Invalid `size` places param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getPlacesParams({size:1})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getPlacesParams({ size: 1 }, ''),
      'size=1',
      'Valid `size` places suggest param populates params.'
    );
    t.end();
  });
});

// PLACES TYPES PARAMS
test('cliniaSearchCore._getPlacesParams({types:``})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getPlacesParams({ types: '' }, ''),
      '',
      'Invalid `types` places param return empty params.'
    );
    t.end();
  });
});

test('cliniaSearchCore._getPlacesParams({types:[a,b]})', function() {
  return new Promise(t => {
    t.equal(
      CliniaSearchCore.prototype._getPlacesParams({ types: ['a', 'b'] }, ''),
      'types=%5B%22a%22%2C%22b%22%5D',
      'Valid `types` places suggest param populates params.'
    );
    t.end();
  });
});
