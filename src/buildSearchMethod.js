module.exports = buildSearchMethod;

var errors = require('./errors.js');

/**
 * Creates a search method to be used in clients
 * @param {string} queryParam the name of the attribute used for the query
 * @param {string} url the url
 * @return {function} the search method
 */
function buildSearchMethod(queryParam, url) {
  /**
   * The search method. Prepares the data and send the query to Clinia.
   * @param {object} args search parameters to send with the search
   * @param {function} [callback] the callback to be called with the client gets the answer
   * @return {undefined|Promise} If the callback is not provided then this methods returns a Promise
   */
  return function search(args, callback) {
    // Normalizing the function signature
    if (arguments.length === 0 || typeof args === 'function') {
      // Usage : .search(), .search(cb)
      callback = args;
      args = { query: '' }
    }

    var params = '';

    params += queryParam + '=' + encodeURIComponent(args.query) || '';
    delete args.query

    var additionalUA;
    if (args.additionalUA) {
      additionalUA = args.additionalUA;
      delete args.additionalUA;
    }
    if (args.params) {
      // `_getSearchParams` will augment params
      params = this.as._getSearchParams(args.params, params);
    }

    return this._search(params, url, callback, additionalUA);
  };
}
