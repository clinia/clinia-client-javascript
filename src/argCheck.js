module.exports = {
  isNullOrUndefined: isNullOrUndefined,
  isNotNullOrUndefined: isNotNullOrUndefined,
  isEmpty: isEmpty
};

function isNullOrUndefined(arg) {
  return arg === undefined || arg === null;
}

function isNotNullOrUndefined(arg) {
  return !isNullOrUndefined(arg);
}

function isEmpty(arg) {
  for (var key in arg) {
    if (key !== null && arg[key] !== undefined && arg.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}