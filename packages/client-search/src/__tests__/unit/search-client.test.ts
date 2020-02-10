import { TestSuite } from '../../../../client-common/src/__tests__/TestSuite';

const clinia = new TestSuite().clinia;

describe('search client', () => {
  it('gives access to appId', () => {
    expect(clinia('appId', 'apiKey').appId).toEqual('appId');
  });
});

test('clearCache', async () => {
  const client = clinia('appId', 'apiKey');

  client.transporter.requestsCache.set('bla', 'blo');
  client.transporter.responsesCache.set('bla', 'blo');

  if (testing.isBrowser()) {
    await expect(
      client.transporter.requestsCache.get('bla', () => Promise.resolve('wrong'))
    ).resolves.toBe('blo');
    await expect(
      client.transporter.responsesCache.get('bla', () => Promise.resolve('wrong'))
    ).resolves.toBe('blo');
  } else {
    // node uses a null cache, so these assertions don't make sense there
    await expect(
      client.transporter.requestsCache.get('bla', () => Promise.resolve('wrong'))
    ).resolves.toBe('wrong');
    await expect(
      client.transporter.responsesCache.get('bla', () => Promise.resolve('wrong'))
    ).resolves.toBe('wrong');
  }

  await client.clearCache();

  await expect(
    client.transporter.requestsCache.get('bla', () => Promise.resolve('wrong'))
  ).resolves.toBe('wrong');
  await expect(
    client.transporter.responsesCache.get('bla', () => Promise.resolve('wrong'))
  ).resolves.toBe('wrong');
});

test('clearCache without promise', async () => {
  const client = clinia('appId', 'apiKey');

  client.transporter.requestsCache.set('bla', 'blo');
  client.transporter.responsesCache.set('bla', 'blo');

  if (testing.isBrowser()) {
    await expect(
      client.transporter.requestsCache.get('bla', () => Promise.resolve('wrong'))
    ).resolves.toBe('blo');
    await expect(
      client.transporter.responsesCache.get('bla', () => Promise.resolve('wrong'))
    ).resolves.toBe('blo');
  } else {
    // node uses a null cache, so these assertions don't make sense there
    await expect(
      client.transporter.requestsCache.get('bla', () => Promise.resolve('wrong'))
    ).resolves.toBe('wrong');
    await expect(
      client.transporter.responsesCache.get('bla', () => Promise.resolve('wrong'))
    ).resolves.toBe('wrong');
  }

  // no await, since default memory caches _actually_ are instant
  client.clearCache();

  await expect(
    client.transporter.requestsCache.get('bla', () => Promise.resolve('wrong'))
  ).resolves.toBe('wrong');
  await expect(
    client.transporter.responsesCache.get('bla', () => Promise.resolve('wrong'))
  ).resolves.toBe('wrong');
});
