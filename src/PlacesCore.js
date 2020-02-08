module.exports = PlacesCore;

const argCheck = require('./argCheck');

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
  const normalizeParams = require('./normalizeMethodParameters');

  // Normalizing the function signature
  const normalizedParameters = normalizeParams(query, args, callback);
  query = normalizedParameters[0];
  args = normalizedParameters[1];
  callback = normalizedParameters[2];

  // Set default place types of none are sent to the client.
  if (args === undefined) {
    args = {
      types: ['postcode', 'place', 'neighborhood'],
    };
  } else if (args.types === undefined || args.types === null) {
    args.types = ['postcode', 'place', 'neighborhood'];
  }

  let params = '';

  if (argCheck.isNotNullOrUndefined(query)) {
    params = `query=${query}`;
    delete args.query;
  }

  let additionalUA;
  if (argCheck.isNotNullOrUndefined(args.additionalUA)) {
    additionalUA = args.additionalUA;
    delete args.additionalUA;
  }

  let locale;
  if (argCheck.isNotNullOrUndefined(args.locale)) {
    locale = args.locale;
    delete args.locale;
  }

  // `_getPlacesParams` will augment params
  params = this.as._getPlacesParams(args, params);

  return this._suggest(params, undefined, callback, additionalUA, locale);
};

PlacesCore.prototype._buildUrl = function(url, locale) {
  // Add the locale as a query param
  let finalUrl = url || '/location/v1/autocomplete?';
  if (locale !== undefined && locale !== null) {
    if (!finalUrl.endsWith('?')) {
      finalUrl += '?';
    }
    finalUrl += `locale=${encodeURIComponent(locale)}`;
  }

  return finalUrl;
};

PlacesCore.prototype._suggest = function(params, url, callback, additionalUA, locale) {
  const finalUrl = this._buildUrl(url, locale);

  return this.as._jsonRequest({
    cache: this.cache,
    method: 'POST',
    url: finalUrl,
    body: { params },
    hostType: 'read',
    fallback: {
      method: 'GET',
      url: finalUrl,
      body: { params },
    },
    callback,
    additionalUA,
  });
};

PlacesCore.prototype.as = null;
