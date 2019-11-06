module.exports = normalizeParameters

/**
 * Normalize Search and Suggest method parameters
 * @param {string} query the string used for the query
 * @param {object} args additional parameters to send with the query
 * @param {function} [callback] the callback to be called with the client gets the answer
 * @returns {array} an array of normalized parameters
 */
function normalizeParameters(query, args, callback) {
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

  return [query, args, callback]
}