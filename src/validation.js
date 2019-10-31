var isArray = require('isarray');
var errors = require('./errors.js')

var isNullOrUndefined = function(arg) {
  return arg === undefined || arg === null
};

var isNotNullOrUndefined = function(arg) {
  return !isNullOrUndefined(arg)
};

var isEmpty = function(arg) {
  for(var key in arg) {
    if (key !== null && arg[key] !== undefined && arg.hasOwnProperty(key)) {
      return false
    }
  }
  return true
};

var validateNumberType = function(key, arg) {
  if (isNaN(arg))
    throw new errors.CliniaSearchError('Field should be a `number`.', {fields: key})
  return arg
};

var validatePositiveNumberType = function(key, arg) {
  if (isNaN(arg) || arg < 0)
    throw new errors.CliniaSearchError('Field should be a positive `number`.', {fields: key})
  return arg
};

var validateArrayType = function(key, arg) {
  if (!isArray(arg))
    throw new errors.CliniaSearchError('Field should be an `array`.', {fields: key})
  return arg
};

var validateStringType = function(key, arg) {
  if (typeof arg !== 'string')
    throw new errors.CliniaSearchError('Field should be a `string`.', {fields: key})
  return arg
}

module.exports = {
  validateNumberType: validateNumberType,
  validatePositiveNumberType: validatePositiveNumberType,
  validateArrayType: validateArrayType,
  validateStringType: validateStringType,
  isNullOrUndefined: isNullOrUndefined,
  isNotNullOrUndefined: isNotNullOrUndefined,
  isEmpty: isEmpty
};