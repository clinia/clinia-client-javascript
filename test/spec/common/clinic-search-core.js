'use strict';

var bind = require('lodash-compat/function/bind');
var test = require('tape');

var CliniaSearchCore = require('../../../src/CliniaSearchCore');

test('cliniaSearchCore._getSearchParams', function(t) {
  t.throws(bind(CliniaSearchCore.prototype._getSearchParams, null, {}, {}),
  new RegExp("Missing mandatory field from search params$"), 
  'No documentTypes param throws');
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam', function(t) {
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

test('cliniaSearchCore._validateFilterSearchParam({types:undefined})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({types:undefined})).length,
    0,
    'Empty types filter param return empty filters object.'
  )
  t.end();
});

test('cliniaSearchCore._validateFilterSearchParam({types:null})', function(t) {
  t.equal(
    Object.keys(CliniaSearchCore.prototype._validateFilterSearchParam({types:null})).length,
    0,
    'Empty `types` filter param return empty filters object.'
  )
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
    'Empty `types` filter param return empty filters object.'
  )
  t.end();
});
