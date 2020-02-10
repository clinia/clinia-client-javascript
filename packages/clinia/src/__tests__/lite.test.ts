import { createInMemoryCache } from '@clinia/cache-in-memory';
import { version } from '@clinia/client-common';
import { createStatelessHost, createUserAgent } from '@clinia/transporter';

import clinia from '../builds/browserLite';

const client = clinia('appId', 'apiKey');

describe('lite preset', () => {
  it('has a version property', () => {
    expect(clinia.version).toBe(version);
    expect(clinia.version.startsWith('2.')).toBe(true);
  });

  it('sets default headers', () => {
    expect(client.transporter.headers).toEqual({
      'content-type': 'application/x-www-form-urlencoded',
    });
  });

  it('sets default query pameters', () => {
    expect(client.transporter.queryParameters).toEqual({
      'x-clinia-application-id': 'appId',
      'x-clinia-api-key': 'apiKey',
    });
  });

  it('sets default user agent', () => {
    expect(client.transporter.userAgent.value).toEqual(
      `Clinia for JavaScript (${version}); Browser (lite)`
    );
  });

  it('allows to customize options', () => {
    const cache = createInMemoryCache();
    const userAgent = createUserAgent('0.2.0');

    const customClient = clinia('appId', 'apiKey', {
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

    expect(customClient.transporter.hostsCache).toBe(cache);
    expect(customClient.transporter.requestsCache).toBe(cache);
    expect(customClient.transporter.userAgent).toBe(userAgent);
    expect(customClient.transporter.timeouts.connect).toBe(45);
    expect(customClient.transporter.timeouts.read).toBe(46);
    expect(customClient.transporter.timeouts.write).toBe(47);
    expect(customClient.transporter.queryParameters).toEqual({
      'x-clinia-application-id': 'appId',
      'x-clinia-api-key': 'apiKey',
      queryParameter: 'bar',
    });
    expect(customClient.transporter.headers).toEqual({
      'content-type': 'application/x-www-form-urlencoded',
      header: 'foo',
    });
    expect(customClient.transporter.hosts).toEqual([createStatelessHost({ url: 'foo.com' })]);
  });
});
