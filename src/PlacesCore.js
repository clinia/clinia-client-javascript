module.exports = PlacesCore;

function PlacesCore(cliniasearch) {
  this.as = cliniasearch;

  // make sure every places client instance has it's own cache
  this.cache = {};
}

/*
 * Clear all queries in cache
 */
PlacesCore.prototype.clearCache = function() {
  this.cache = {};
};

/**
 * The search method. Prepares the data and send the query to Clinia.
 * @param {string} query the string used for query search
 * @param {object} args additional parameters to send with the search
 * @param {function} [callback] the callback to be called with the client gets the answer
 * @return {undefined|Promise} If the callback is not provided then this methods returns a Promise
 */
PlacesCore.prototype.suggest = function(query, args, callback) {
  var normalizeParams = require('./normalizeMethodParameters')
    
  // Normalizing the function signature
  var normalizedParameters = normalizeParams(query, args, callback)
  query = normalizedParameters[0]
  args = normalizedParameters[1]
  callback = normalizedParameters[2]

  var params = ''
  
  if (query !== undefined) {
    params = 'input=' + query;
    if (args !== undefined) {
      delete args.query;
    }
  }

  var additionalUA;
  if (args !== undefined) {
    if (args.additionalUA) {
      additionalUA = args.additionalUA;
      delete args.additionalUA;
    }
    // `_getPlacesParams` will augment params
    params = this.as._getPlacesParams(args, params)
  }

  return this._suggest(params, undefined, callback, additionalUA);
}

PlacesCore.prototype._suggest = function(params, url, callback, additionalUA) {
  return this.as._jsonRequest({
    cache: this.cache,
    method: 'GET',
    url: (url || '/location/v1/autocomplete?') + params,
    hostType: 'read',
    fallback: {
      method: 'GET',
      url: (url || '/location/v1/autocomplete?') + params,
    },
    callback: callback,
    additionalUA: additionalUA,
  });
};

PlacesCore.prototype.as = null;