'use strict';

var bind = require('lodash-compat/function/bind');
var test = require('tape');

var CliniaSearchCore = require('../../../src/CliniaSearchCore');

test('cliniaSearchCore._getSearchParams', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._getSearchParams, null, {}, {}),
  new RegExp("Missing mandatory field from search params.$"), 
  'No documentTypes param throws');
  t.end();
});

// SEARCH PARAMS
test('cliniaSearchCore._validateSearchParams(8, {})', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateSearchParams, null, 8, {}),
  new RegExp("Search parameters should be of type `object`.$"), 
  'Invalid search params type throws');
  t.end();
});

test('cliniaSearchCore._validateSearchParams(validParams, {})', function(t) {
  var params = {
    documentTypes: ['health_facility'],
    filters: {
      types: ['CLINIC', 'HOSPITAL'],
      hours: {
        offset: 180,
        values: [1, 3]
      },
      geo: '3578 rue Dorion, Montreal'
    },
    page:0,
    perPage:50
  };
  t.equal(
    JSON.stringify(CliniaSearchCore.prototype._validateSearchParams(params, {})),
    JSON.stringify({
      documentTypes: ['health_facility'],
      filters: {
        types: ['CLINIC', 'HOSPITAL'],
        hours: {
          offset: 180,
          values: [1, 3]
        },
        geo: '3578 rue Dorion, Montreal'
      },
      page:0,
      perPage:50
    }), 
    'Valid search params type populates search params');
  t.end();
});

// SEARCH PARAMS DOCUMENTTYPES
test('cliniaSearchCore._validateSearchParams({documentTypes:undefined)', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateSearchParams, null, {documentTypes:undefined}, {}),
  new RegExp("Missing mandatory field from search params.$"), 
  'Missing `documentTypes` search param throws');
  t.end();
});

test('cliniaSearchCore._validateSearchParams({documentTypes:{}})', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateSearchParams, null, {documentTypes:{}}, {}),
  new RegExp("Field should be an `array` with possible values: `health_facility`, `professional`.$"), 
  'Invalid `documentTypes` search param throws');
  t.end();
});

test('cliniaSearchCore._validateSearchParams({documentTypes:[])', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateSearchParams, null, {documentTypes:[]}, {}),
  new RegExp("Field should be an `array` with possible values: `health_facility`, `professional`.$"), 
  'Empty array `documentTypes` search param throws');
  t.end();
});

test('cliniaSearchCore._validateSearchParams({documentTypes:[`yeah`])', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateSearchParams, null, {documentTypes:['yeah']}, {}),
  new RegExp("Field should be an `array` with possible values: `health_facility`, `professional`.$"), 
  'Invalid value `documentTypes` search param throws');
  t.end();
});

test('cliniaSearchCore._validateSearchParams({documentTypes:[`yeah`])', function(t) {
  t.equal(
    JSON.stringify(CliniaSearchCore.prototype._validateSearchParams({q:'', documentTypes:['health_facility', 'professional']}, {}).documentTypes),
    JSON.stringify(['health_facility', 'professional']), 
    'Valid `documentTypes` search param populates search params');
  t.end();
});

// SEARCH PARAMS PAGE
test('cliniaSearchCore._validateSearchParams({page:-1})', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateSearchParams, null, {page:-1, q:'', documentTypes:['professional']}, {}),
  new RegExp("Field should be a positive `number`.$"), 
  'Invalid `page` search params throws');
  t.end();
});

test('cliniaSearchCore._validateSearchParams({page:1})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._validateSearchParams({page:1, q:'', documentTypes:['professional']}, {}).page,
    1, 
    'Valid `page` search param populates params');
  t.end();
});

// SEARCH PARAMS PERPAGE
test('cliniaSearchCore._validateSearchParams({perPage:-1})', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateSearchParams, null, {perPage:-1, q:'', documentTypes:['professional']}, {}),
  new RegExp("Field should be a positive `number`.$"), 
  'Invalid `perPage` search params throws');
  t.end();
});

test('cliniaSearchCore._validateSearchParams({perPage:1})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._validateSearchParams({perPage:1, q:'', documentTypes:['professional']}, {}).perPage,
    1, 
    'Valid `perPage` search param populates params');
  t.end();
});

// FILTERS SEARCH PARAMS
test('cliniaSearchCore._validateFilterSearchParam(8)', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateFilterSearchParam, null, 8),
  new RegExp("Field is not of the right type. Should be `object`.$"), 
  'Invalid filters type throws');
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({})).length,
    0,
    'Empty filters params return empty filters object.'
  )
  t.end();
});

// FILTERS SEARCH PARAMS TYPES
test('cliniaSearchCore._validateFilterSearchParam({types:undefined})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({types:undefined})).length,
    0,
    'Undefined `types` filter param return empty filters object.'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({types:null})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({types:null})).length,
    0,
    'Null `types` filter param return empty filters object.'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({types:8})', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateFilterSearchParam, null, {types:8}),
  new RegExp("Field should be an array with possible values: `CLINIC`, `PHARMACY`, `CLSC`, `HELP_RESOURCE`, `OTHER`, `HOSPITAL`.$"), 
  'Invalid `types` filter param throws.');
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({types:[`CLI`]})', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateFilterSearchParam, null, {types:['CLI']}),
  new RegExp("Field should be an array with possible values: `CLINIC`, `PHARMACY`, `CLSC`, `HELP_RESOURCE`, `OTHER`, `HOSPITAL`.$"), 
  'Invalid `types` filters param throws');
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({types:[`CLINIC`]})', function(t) {
  t.equal(
    JSON.stringify(CliniaSearchCore.prototype._validateFilterSearchParam({types:['CLINIC']}).types),
    JSON.stringify(['CLINIC']),
    'Valid `types` filter param return populates filters'
  )
  t.end();
});

// FILTER SEARCH PARAMS HOURS
test('cliniaSearchCore._validateFilterSearchParam({hours:undefined})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({hours:undefined})).length,
    0,
    'Empty `types` filter param return empty filters object.'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({hours:null})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({hours:null})).length,
    0,
    'Empty `types` filter param return empty filters object.'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({hours:8})', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._validateFilterSearchParam, null, {hours:8}),
  new RegExp("Field is not of the right type. Should be `object`.$"), 
  'Invalid `types` filters param throws');
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({hours:{}})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({hours:{}})).length,
    0,
    'Empty `hours` filter param return empty filters object.'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({hours:{offset:-1}})', function(t) {
  t.throws(
    bind(CliniaSearchCore.prototype._validateFilterSearchParam, null, {hours:{offset: -1}}),
    new RegExp('Field should be a positive `number`.$'),
    'Negative `hours.offset` filter param throws'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({hours:{offset:240}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._validateFilterSearchParam({hours:{offset:240}}).hours.offset,
    240,
    'Valid `hours.offset` filter param populates filters' 
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({hours:{values:-1}})', function(t) {
  t.throws(
    bind(CliniaSearchCore.prototype._validateFilterSearchParam, null, {hours:{values: -1}}),
    new RegExp('Field should be an array with possible values: 0, 1, 2, 3.$'),
    'Invalid `hours.values` filter param throws'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({hours:{values:[0,1,2,3,4]}})', function(t) {
  t.throws(
    bind(CliniaSearchCore.prototype._validateFilterSearchParam, null, {hours:{values: [0,1,2,3,4]}}),
    new RegExp('Field should be an array with possible values: 0, 1, 2, 3.$'),
    'Out of range `hours.values` filter param throws'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({hours:{values:[0,1,2,3,4]}})', function(t) {
  t.equal(
    JSON.stringify(CliniaSearchCore.prototype._validateFilterSearchParam({hours:{values: [0,3]}}).hours.values),
    JSON.stringify([0,3]),
    'Valid `hours.values` filter param populates filters'
  )
  t.end();
});

// FILTER SEARCH PARAMS GEO
test('cliniaSearchCore._validateFilterSearchParam({geo:undefined})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({geo:undefined})).length,
    0,
    'Undefined `geo` filter param return empty filters object.'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({geo:null})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({geo:null})).length,
    0,
    'Null `geo` filter param return empty filters object.'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({geo:{})', function(t) {
  t.throws(
    bind(CliniaSearchCore.prototype._validateFilterSearchParam, null, {geo: {}}),
    new RegExp('Field should be a `string`.$'),
    'Invalid `geo` filter param throws'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({geo:`J4M2M2`})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._validateFilterSearchParam({geo:'J4M2M2'}).geo,
    'J4M2M2',
    'Valid `geo` filter param populates filters'
  )
  t.end();
});