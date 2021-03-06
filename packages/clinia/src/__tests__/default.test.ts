import { createInMemoryCache } from '@clinia/cache-in-memory';
import { version } from '@clinia/client-common';
import { createStatelessHost, createUserAgent } from '@clinia/transporter';

import { TestSuite } from '../../../client-common/src/__tests__/TestSuite';

const clinia = new TestSuite('search').clinia;
const client = clinia('engineId', 'apiKey');

describe('default preset', () => {
  it('has a version property', () => {
    expect(clinia.version).toBe(version);
    expect(clinia.version.startsWith('2.')).toBe(true);
  });

  it('sets default headers', () => {
    expect(client.transporter.headers).toEqual({
      'content-type': 'application/json',
      'x-clinia-engine-id': 'engineId',
      'x-clinia-api-key': 'apiKey',
    });
  });

  it('sets default query pameters', () => {
    expect(client.transporter.queryParameters).toEqual({});
  });

  it('sets default user agent', () => {
    if (testing.isBrowser()) {
      expect(client.transporter.userAgent.value).toEqual(
        `Clinia for JavaScript (${version}); Browser`
      );
    } else {
      const nodeVersion = process.versions.node;

      expect(client.transporter.userAgent.value).toEqual(
        `Clinia for JavaScript (${version}); Node.js (${nodeVersion})`
      );
    }
  });

  it('allows to customize options', () => {
    const cache = createInMemoryCache();
    const userAgent = createUserAgent('0.2.0');

    const customClient = clinia('engineId', 'apiKey', {
      hostsCache: cache,
      requestsCache: cache,
      userAgent,
      timeouts: {
        connect: 45,
        read: 46,
        write: 47,
      },
      queryParameters: {
        queryParameter: 'bar',
      },
      headers: {
        header: 'foo',
      },
      hosts: [{ url: 'foo.com' }],
    });

    // Then, on custom options, only the search client is impacted
    expect(client.transporter.hostsCache).not.toBe(cache);
    expect(customClient.transporter.hostsCache).toBe(cache);

    expect(client.transporter.requestsCache).not.toBe(cache);
    expect(customClient.transporter.requestsCache).toBe(cache);
    expect(customClient.transporter.timeouts).toEqual({
      connect: 45,
      read: 46,
      write: 47,
    });

    expect(customClient.transporter.queryParameters).toEqual({
      queryParameter: 'bar',
    });
    expect(customClient.transporter.headers).toEqual({
      'content-type': 'application/json',
      'x-clinia-engine-id': 'engineId',
      'x-clinia-api-key': 'apiKey',
      header: 'foo',
    });
    expect(customClient.transporter.hosts).toEqual([createStatelessHost({ url: 'foo.com' })]);
  });

  it('can be destroyed', () => {
    if (!testing.isBrowser()) {
      expect(client).toHaveProperty('destroy');
    }
  });
});
