module.exports = function omit(obj, test) {
  const keys = require('object-keys');
  const foreach = require('foreach');

  const filtered = {};

  foreach(keys(obj), function doFilter(keyName) {
    if (test(keyName) !== true) {
      filtered[keyName] = obj[keyName];
    }
  });

  return filtered;
};
