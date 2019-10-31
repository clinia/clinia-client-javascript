var buildSearchMethod = require('./buildSearchMethod.js');

module.exports = IndexCore;

/*
 * Index class constructor.
 * You should not use this method directly but use initIndex() function
 */
function IndexCore(cliniasearch, indexName) {
  this.indexName = indexName;
  this.as = cliniasearch;
  this.typeAheadArgs = null;
  this.typeAheadValueOption = null;

  // make sure every index instance has it's own cache
  this.cache = {};
}

/*
 * Clear all queries in cache
 */
IndexCore.prototype.clearCache = function() {
  this.cache = {};
};

/**
 * Search inside the index using XMLHttpRequest request (Using a POST query to
 * minimize number of OPTIONS queries: Cross-Origin Resource Sharing).
 *
 * @param {object} [args] contains an object with query parameters
 * - TODO
 * @param {function} [callback] the result callback called with two arguments:
 *  error: null or Error('message'). If false, the content contains the error.
 *  content: the server answer that contains the list of results.
 */
IndexCore.prototype.search = buildSearchMethod(false)

IndexCore.prototype._search = function(params, url, callback, additionalUA) {
  // TODO : This is a workaround to simulate the different index endpoint.
  params.documentTypes = [this.indexName]
  var tempUrl = '/search/v1/search'
  // var realUrl = '/search/v1/'+this.indexName
  return this.as._jsonRequest({
    cache: this.cache,
    method: 'POST',
    url: url || tempUrl,
    body: params,
    hostType: 'read',
    fallback: {
      method: 'GET',
      url: url || tempUrl,
      body: params,
    },
    callback: callback,
    additionalUA: additionalUA,
  });
};

IndexCore.prototype.as = null;
IndexCore.prototype.indexName = null;
IndexCore.prototype.typeAheadArgs = null;
IndexCore.prototype.typeAheadValueOption = null;
