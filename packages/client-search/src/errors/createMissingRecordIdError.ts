export function createMissingRecordIdError(): Error {
  return {
    name: 'MissingRecordIdError',
    message:
      'All records must have an unique id ' +
      '(like a primary key) to be valid. ' +
      'Clinia is also able to generate ids ' +
      "automatically but *it's not recommended*. " +
      "To do it, use the `{'autoGenerateRecordIDIfNotExist': true}` option.",
  };
}
