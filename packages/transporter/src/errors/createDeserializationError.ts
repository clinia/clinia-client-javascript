import { Response } from '@clinia/requester-common';

import { DeserializationError } from '..';

export function createDeserializationError(
  message: string,
  response: Response
): DeserializationError {
  return {
    name: 'DeserializationError',
    message,
    response,
  };
}
