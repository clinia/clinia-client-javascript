'use strict';

var bind = require('lodash-compat/function/bind');
var test = require('tape');

var CliniaSearchCore = require('../../../src/CliniaSearchCore');

// SEARCH PARAMS PAGE
test('cliniaSearchCore._getSearchParams({page:[]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({page:[]}, {}).page,
    undefined, 
    'Invalid `page` search params return empty params');
  t.end();
});

test('cliniaSearchCore._getSearchParams({page:1})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({page:1}, {}).page,
    1, 
    'Valid `page` search param populates params');
  t.end();
});

// SEARCH PARAMS PERPAGE
test('cliniaSearchCore._getSearchParams({perPage:[]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({perPage:[]}, {}).perPage,
    undefined, 
    'Invalid `perPage` search params return empty params');
  t.end();
});

test('cliniaSearchCore._getSearchParams({perPage:1})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({perPage:1}, {}).perPage,
    1, 
    'Valid `perPage` search param populates params');
  t.end();
});

// FILTERS SEARCH PARAMS
test('cliniaSearchCore._getSearchParams({filters:[]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:[]}, {}).filters,
    undefined,
    'Invalid `filters` search params return empty params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{geo:1}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{geo:1}}, {}).filters.geo,
    undefined,
    'Invalid `filters.geo` search params return empty params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{geo:`yes`}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{geo:'yes'}}, {}).filters.geo,
    'yes',
    'Valid `filters.geo` search param pupolates params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{types:{}}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{types:{}}}, {}).filters.types,
    undefined,
    'Invalid `filters.types` search params return empty params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{types:[`CLINIC`]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{types:['CLINIC']}}, {}).filters.types[0],
    'CLINIC',
    'Valid `filters.types` search param populates params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{hours:[]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{hours:[]}}, {}).filters.hours,
    undefined,
    'Invalid `filters.hours` search param return empty params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{hours:{offset:[]}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{hours:{offset:[]}}}, {}).filters.hours.offset,
    undefined,
    'Invalid `filters.hours.offset` search param return empty params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{hours:{offset:240}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{hours:{offset:240}}}, {}).filters.hours.offset,
    240,
    'Valid `filters.hours.offset` search param populates params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{hours:{values:{}}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{hours:{values:{}}}}, {}).filters.hours.values,
    undefined,
    'Invalid `filters.hours.values` search param return empty params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({filters:{hours:{values:[0]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({filters:{hours:{values:[0]}}}, {}).filters.hours.values[0],
    0,
    'Valid `filters.hours.values` search param populates params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({queryTypes:{}})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({queryTypes:{}}, {}).queryTypes,
    undefined,
    'Invalid `queryTypes` search param return empty params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams({queryTypes:[`prefix`]})', function(t) {
  t.equal(
    CliniaSearchCore.prototype._getSearchParams({queryTypes:['prefix']}, {}).queryTypes[0],
    'prefix',
    'Valud `queryTypes` search param return empty params.'
  )
  t.end();
});

test('cliniaSearchCore._getSearchParams(validParams, {})', function(t) {
  var params = {
    documentTypes: ['health_facility'],
    queryTypes: ['prefix'],
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
    JSON.stringify(CliniaSearchCore.prototype._getSearchParams(params, {})),
    JSON.stringify({
      documentTypes: ['health_facility'],
      queryTypes: ['prefix'],
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