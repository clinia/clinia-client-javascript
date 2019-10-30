var isArray = require('isarray');

module.exports = {
  validateNumberType: validateNumberType,
  validatePositiveNumberType: validatePositiveNumberType,
  validateArrayType: validateArrayType,
  validateArrayTypePossibleValues: validateArrayTypePossibleValues,
  validateStringType: validateStringType
}

var validateNumberType = function(key, arg) {
  if (isNaN(arg))
    throw new errors.CliniaSearchError('Field should be a `number`.', {fields: key})
  return arg
};

var validatePositiveNumberType = function(key, arg) {
  if (isNaN(arg) || arg < 0)
    throw new errors.CliniaSearchError('Field should be a positive `number`', {fields: key})
  return arg
};

var validateArrayType = function(key, arg) {
  if (!isArray(arg))
    throw new errors.CliniaSearchError('Field should be an `array`.', {fields: key})
  return arg
};

/*
 * Transform search param object in query string
 * @param {string} key arguments to add to the current query string
 * @param {object} arg current query string
 * @param {any[]} possibleValues possible values of the array
 */
var validateArrayTypePossibleValues = function(key, arg, possibleValues) {
  debugger
  validateArrayType(key, arg)
  if (arg.filter(function(n) {
    return possibleValues.indexOf(n) !== -1;
  })) {
    throw new errors.CliniaSearchError('Field contains invalid values.', {fields: key})
  }
  return arg
};

var validateStringType = function(key, arg) {
  if (typeof arg !== 'string')
    throw new errors.CliniaSearchError('Field should be a `string`.', {fields: key})
  return arg
}