'use strict';

// var bind = require('lodash-compat/function/bind');
var test = require('tape');
var safeJSONStringify = require('../../../src/safeJSONStringify.js');

var CliniaSearchCore = require('../../../src/CliniaSearchCore');

// SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({}, 'query=query'),
    'query=query',
    'Empty search params return existing params'
  );
  t.end();
});

test('cliniaSearchCore._getSearchParams(undefined)', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams(undefined, 'query=query'),
    'query=query',
    'Undefined search params return existing params'
  );
  t.end();
});

// SEARCH PARAMS PAGE
test('cliniaSearchCore._getSearchParams({page:[]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({page: []}, ''),
    '',
    'Invalid `page` search params return empty params');
  t.end();
});

test('cliniaSearchCore._getSearchParams({page:1})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({page: 1}, ''),
    'page=1',
    'Valid `page` search param populates params');
  t.end();
});

// SEARCH PARAMS PERPAGE
test('cliniaSearchCore._getSearchParams({perPage:[]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({perPage: []}, ''),
    '',
    'Invalid `perPage` search params return empty params');
  t.end();
});

test('cliniaSearchCore._getSearchParams({perPage:1})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({perPage: 1}, ''),
    'perPage=1',
    'Valid `perPage` search param populates params');
  t.end();
});

// QUERYTYPES SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({queryTypes:{}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({queryTypes: {}}, ''),
    '',
    'Invalid `queryTypes` search param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSearchParams({queryTypes:[`prefix`]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({queryTypes: ['prefix']}, ''),
    `queryTypes=${encodeURIComponent(safeJSONStringify(['prefix']))}`,
    'Valid `queryTypes` search param return empty params.'
  );
  t.end();
});

// SEARCHFIELDS SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({searchFields:{}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({searchFields: {}}, ''),
    '',
    'Invalid `searchFields` search param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSearchParams({searchFields:[`name`]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({queryTypes: ['name']}, ''),
    `queryTypes=${encodeURIComponent(safeJSONStringify(['name']))}`,
    'Valid `searchFields` search param return empty params.'
  );
  t.end();
});

// LOCATION SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({location:{}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({location: {}}, ''),
    '',
    'Invalid `location` search param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSearchParams({location:`montreal`})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({location: 'montreal'}, ''),
    'location=montreal',
    'Valid `searchFields` search param return empty params.'
  );
  t.end();
});

// AROUNDLATLNG SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({aroundLatLng:{}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({aroundLatLng: {}}, ''),
    '',
    'Invalid `aroundLatLng` search param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSearchParams({aroundLatLng:`montreal`})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({aroundLatLng: 'montreal'}, ''),
    'aroundLatLng=montreal',
    'Valid `searchFields` search param return empty params.'
  );
  t.end();
});

// INSIDEBOUNDINGBOX SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({insideBoundingBox:{}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({insideBoundingBox: {}}, ''),
    '',
    'Invalid `insideBoundingBox` search param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSearchParams({insideBoundingBox:`montreal`})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({insideBoundingBox: 'montreal'}, ''),
    'insideBoundingBox=montreal',
    'Valid `searchFields` search param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSearchParams(validParams, {})', function(t) {
  var params = {
    documentTypes: ['health_facility'],
    queryTypes: ['prefix'],
    location: '3578 rue Dorion, Montreal',
    aroundLatLng: '45.98123123,-73.1231432',
    insideBoundingBox: '45.98123123,-73.1231432,12.38353485,-23.23232323',
    page: 0,
    perPage: 50,
    customField: 'custom'
  };
  t.equal(
    CliniaSearchCore.prototype._getSearchParams(params, ''),
    'documentTypes=%5B%22health_facility%22%5D&queryTypes=%5B%22prefix%22%5D&filters=%7B%22types%22%3A%5B%22CLINIC%22%2C%22HOSPITAL%22%5D%2C%22hours%22%3A%7B%22offset%22%3A180%2C%22values%22%3A%5B1%2C3%5D%7D%2C%22location%22%3A%223578%20rue%20Dorion%2C%20Montreal%22%7D&page=0&perPage=50&customField=custom',
    'Valid search params type populates search params');
  t.end();
});

// SUGGEST PARAMS
test('cliniaSearchCore._getSuggestParams({})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSuggestParams({}, ''),
    '',
    'Empty suggest params return existing params'
  );
  t.end();
});

test('cliniaSearchCore._getSuggestParams(undefined)', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSuggestParams(undefined, ''),
    '',
    'Undefined suggest params return existing params'
  );
  t.end();
});

// SUGGEST SIZE PARAMS
test('cliniaSearchCore._getSuggestParams({size:``})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSuggestParams({size: ''}, ''),
    '',
    'Invalid `types` suggest param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSuggestParams({size:8})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSuggestParams({size: 8}, ''),
    'size=8',
    'Valid `types` suggest param pupolates params.'
  );
  t.end();
});

// SUGGEST HIGHLIGHTPRETAG PARAMS
test('cliniaSearchCore._getSuggestParams({highlightPreTag:8})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSuggestParams({highlightPreTag: 8}, ''),
    '',
    'Invalid `highlightPreTag` suggest param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSuggestParams({highlightPreTag:<strong>})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSuggestParams({highlightPreTag: '<strong>'}, ''),
    'highlightPreTag=%3Cstrong%3E',
    'Valid `highlightPreTag` suggest param pupolates params.'
  );
  t.end();
});

// SUGGEST HIGHLIGHTPOSTTAG PARAMS
test('cliniaSearchCore._getSuggestParams({highlightPostTag:8})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSuggestParams({highlightPostTag: 8}, ''),
    '',
    'Invalid `highlightPostTag` suggest param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getSuggestParams({highlightPostTag:</strong>})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSuggestParams({highlightPostTag: '</strong>'}, ''),
    'highlightPostTag=%3C%2Fstrong%3E',
    'Valid `types` suggest param pupolates params.'
  );
  t.end();
});

test('cliniaSearchCore._getSuggestParams(validParams, {})', function(t) {
  var params = {
    size: 5,
    highlightPreTag: '<strong>',
    highlightPostTag: '</strong>',
    customField: 'custom'
  };
  t.equal(
    CliniaSearchCore.prototype._getSearchParams(params, 'query=query'),
    'query=query&size=5&highlightPreTag=%3Cstrong%3E&highlightPostTag=%3C%2Fstrong%3E&customField=custom',
    'Valid search params type populates search params');
  t.end();
});

// PLACES PARAMS
test('cliniaSearchCore._getPlacesParams({})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getPlacesParams({}, 'input=input'),
    'input=input&types=place&types=postcode&types=neighborhood',
    'Empty places param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getPlacesParams(undefined)', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getPlacesParams(undefined, 'input=input'),
    'input=input&types=place&types=postcode&types=neighborhood',
    'Undefined places suggest param populates params.'
  );
  t.end();
});

// PLACES COUNTRY PARAMS
test('cliniaSearchCore._getPlacesParams({country:8})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getPlacesParams({country: 8}, ''),
    '&types=place&types=postcode&types=neighborhood',
    'Invalid `country` places param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getPlacesParams({country:`CA`})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getPlacesParams({country: 'CA'}, ''),
    '&types=place&types=postcode&types=neighborhood&country=CA',
    'Valid `country` places suggest param populates params.'
  );
  t.end();
});

// PLACES LIMIT PARAMS
test('cliniaSearchCore._getPlacesParams({limit:``})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getPlacesParams({limit: 'CA'}, ''),
    '&types=place&types=postcode&types=neighborhood',
    'Invalid `limimt` places param return empty params.'
  );
  t.end();
});

test('cliniaSearchCore._getPlacesParams({limit:1})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getPlacesParams({limit: 1}, ''),
    '&types=place&types=postcode&types=neighborhood&limit=1',
    'Valid `limit` places suggest param populates params.'
  );
  t.end();
});

