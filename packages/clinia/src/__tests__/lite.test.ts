import { createInMemoryCache } from '@clinia/cache-in-memory';
import { shuffle, version } from '@clinia/client-common';
import { SearchOptions } from '@clinia/client-search';
import {
  createStatelessHost,
  createUserAgent,
  HostOptions,
  RequestOptions,
} from '@clinia/transporter';

import clinia, { CliniaSearchOptions } from '../builds/browserLite';

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

  it('allows to use places', async () => {
    const places = (appId: string = '', apiKey: string = '', options?: CliniaSearchOptions) => {
      const placesClient = clinia(appId, apiKey, {
        hosts: ([{ url: 'places-dsn.clinia.net' }] as readonly HostOptions[]).concat(
          shuffle([
            { url: 'places-1.clinia.net' },
            { url: 'places-2.clinia.net' },
            { url: 'places-3.clinia.net' },
          ])
        ),
        ...options,
      });

      return (query: string, requestOptions?: RequestOptions & SearchOptions) => {
        return placesClient.transporter.read(
          {
            method: 'POST',
            path: '1/places/query',
            data: {
              query,
            },
            cacheable: true,
          },
          requestOptions
        );
      };
    };

    const search = places('', '');

    const results = await search('Portugal');

    // @ts-ignore
    expect(results.query).toBe('Portugal');

    // @ts-ignore
    expect(results.hits[0].country_code).toBe('pt');
  });
});
