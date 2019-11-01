module.exports = buildSearchMethod

var isArray = require('isArray');
var foreach = require('foreach')

/**
 * Creates a search method to be used in clients
 * @param {boolean} enableMutliIndexes if the search method should be bundled to handle multi indexes queries
 * @return {function} the search method
 */
function buildSearchMethod(enableMutliIndexes) {
  // Method reused in both implementations
  var buildParams = function(args, getSearchParams) {
    var params = {}
  
    if (args.query !== undefined) {
      params.q = args.query;
      delete args.query
    }
  
    var additionalUA;
    if (args !== undefined) {
      if (args.additionalUA) {
        additionalUA = args.additionalUA;
        delete args.additionalUA;
      }
      // `_getSearchParams` will augment params
      params = getSearchParams(args, params)
    }
  
    return [params, additionalUA]
  }
  if (enableMutliIndexes) {
    /**
     * The search method. Prepares the data and send the merged queries to Clinia.
     * @param {object[]} queries search queries/parameters to send
     * @param {function} [callback] the callback to be called with the client gets the answer
     * @return {undefined|Promise} If the callback is not provided then this methods returns a Promise
     */
    return function search(queries, callback) {
      if (!isArray(queries)) {
        queries = [queries]
      }
      
      // Get the method from `this` before entering the foreach
      var getSearchParams = this.as._getSearchParams
      
      processedQueries = []
      foreach(queries, function(query) {
        var values = buildParams(query, getSearchParams)
        processedQueries.push(values[0])
        // TODO : What do we do with the additionalUA when we have mutiple queries?
      }) 

      return this._search(processedQueries, undefined, callback);
    };
  } else {
    /**
     * The search method. Prepares the data and send the query to Clinia.
     * @param {object} query search query/parameters to send
     * @param {function} [callback] the callback to be called with the client gets the answer
     * @return {undefined|Promise} If the callback is not provided then this methods returns a Promise
     */
    return function search(query, callback) {
      var values = buildParams(query, this.as._getSearchParams)
      return this._search(values[0], undefined, callback, values[1]);
    };
  }
}
