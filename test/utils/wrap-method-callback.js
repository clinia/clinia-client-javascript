module.exports = wrapMethodCallback;

const findMethodCallback = require('./find-method-callback');

function wrapMethodCallback(callArguments, wrapperMethod) {
  const methodCallback = findMethodCallback(callArguments);
  const indexOf = require('lodash-compat/array/indexOf');

  callArguments[indexOf(callArguments, methodCallback)] = function wrappedCallback() {
    methodCallback.apply(null, arguments);
    wrapperMethod(methodCallback);
  };
}
