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
              'x-clinia-engine-id': 'engineId',
              'content-type': 'application/json',
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
        'X-Clinia-Engine-Id': 'foo',
      },
    });

    verify(
      requesterMock.send(
        deepEqual(
          createFixtures().readRequest({
            headers: {
              'x-clinia-engine-id': 'foo',
              'x-default-header': 'Default value',
              'x-clinia-api-key': 'apiKey',
              'content-type': 'application/json',
            },
          })
        )
      )
    ).once();
  });

  it('allows to add headers per read/write and override the default ones', async () => {
    await transporter.read(transporterRequest, {
      headers: {
        'X-Clinia-Engine-Id': 'foo',
        'X-Default-Header': 'My custom header',
      },
    });

    verify(
      requesterMock.send(
        deepEqual(
          createFixtures().readRequest({
            headers: {
              'x-clinia-api-key': 'apiKey',
              'x-clinia-engine-id': 'foo',
              'content-type': 'application/json',
              'x-default-header': 'My custom header',
            },
          })
        )
      )
    ).once();
  });
});
