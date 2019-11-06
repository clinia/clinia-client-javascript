module.exports = buildSearchMethod;

/**
 * Creates a search method to be used in clients
 * @param {string} queryParam the name of the attribute used for the query
 * @param {string} url the url
 * @return {function} the search method
 */
function buildSearchMethod(queryParam, url) {
  /**
   * The search method. Prepares the data and send the query to Clinia.
   * @param {string} query the string used for query search
   * @param {object} args additional parameters to send with the search
   * @param {function} [callback] the callback to be called with the client gets the answer
   * @return {undefined|Promise} If the callback is not provided then this methods returns a Promise
   */
  return function search(query, args, callback) {
    // Normalizing the function signature
    if (arguments.length === 0 || typeof query === 'function') {
      // Usage : .search(), .search(cb)
      callback = query;
      query = '';
    }
    else if (arguments.length === 1 || typeof args === 'function') {
      // Usage : .search(query/args), .search(query, cb)
      callback = args;
      args = undefined;
    }

    if (typeof query === 'object' && query !== null) {
      // .search(args)
      args = query;
      query = args.query || '';
      delete args.query;
    } else if (query === undefined || query === null) {
      // .search(undefined/null)
      query = '';
    }

    var params = '';

    params += queryParam + '=' + encodeURIComponent(query) || '';

    var additionalUA;
    if (args !== undefined) {
      if (args.additionalUA) {
        additionalUA = args.additionalUA;
        delete args.additionalUA;
      }
    }
    
    // `_getSearchParams` will augment params
    params = this.as._getSearchParams(args, params);

    return this._search(params, url, callback, additionalUA);
  };
}
