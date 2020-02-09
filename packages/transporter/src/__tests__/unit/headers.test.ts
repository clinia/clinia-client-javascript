import { Requester } from '@clinia/requester-common';
import { anything, deepEqual, spy, verify, when } from 'ts-mockito';

import { Transporter } from '../..';
import { createFakeRequester, createFixtures } from '../fixtures';

let requesterMock: Requester;
let transporter: Transporter;

beforeEach(() => {
  const requester = createFakeRequester();
  requesterMock = spy(requester);
  transporter = createFixtures().transporter(requester);

  when(requesterMock.send(anything())).thenResolve({
    content: '{}',
    status: 200,
    isTimedOut: false,
  });
});

const transporterRequest = createFixtures().transporterRequest();

describe('selection of headers', () => {
  it('allows add extra headers', async () => {
    Object.assign(transporter.headers, {
      'X-Clinia-Signature': 'signature',
    });

    await transporter.write(transporterRequest);

    verify(
      requesterMock.send(
        deepEqual(
          createFixtures().writeRequest({
            headers: {
              'x-clinia-api-key': 'apiKey',
              'x-clinia-application-id': 'appId',
              'content-type': 'application/x-www-form-urlencoded',
              'x-default-header': 'Default value',
              'x-clinia-signature': 'signature',
            },
          })
        )
      )
    ).once();
  });

  it('allows to add headers per read/write', async () => {
    await transporter.read(transporterRequest, {
      headers: {
        'X-Clinia-Application-Id': 'foo',
      },
    });

    verify(
      requesterMock.send(
        deepEqual(
          createFixtures().readRequest({
            headers: {
              'x-clinia-application-id': 'foo',
              'x-default-header': 'Default value',
              'x-clinia-api-key': 'apiKey',
              'content-type': 'application/x-www-form-urlencoded',
            },
          })
        )
      )
    ).once();
  });

  it('allows to add headers per read/write and override the default ones', async () => {
    await transporter.read(transporterRequest, {
      headers: {
        'X-Clinia-Application-Id': 'foo',
        'X-Default-Header': 'My custom header',
      },
    });

    verify(
      requesterMock.send(
        deepEqual(
          createFixtures().readRequest({
            headers: {
              'x-clinia-api-key': 'apiKey',
              'x-clinia-application-id': 'foo',
              'content-type': 'application/x-www-form-urlencoded',
              'x-default-header': 'My custom header',
            },
          })
        )
      )
    ).once();
  });
});