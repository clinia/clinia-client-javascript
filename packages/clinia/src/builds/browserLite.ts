import { createBrowserLocalStorageCache } from '@clinia/cache-browser-local-storage';
import { createFallbackableCache } from '@clinia/cache-common';
import { createInMemoryCache } from '@clinia/cache-in-memory';
import { AuthMode, version } from '@clinia/client-common';
import {
  createSearchClient,
  initIndex,
  multipleQueries,
  MultipleQueriesOptions,
  MultipleQueriesQuery,
  MultipleQueriesResponse,
  search,
  SearchClient as BaseSearchClient,
  SearchIndex as BaseSearchIndex,
  SearchOptions,
  SearchResponse,
} from '@clinia/client-search';
import { LogLevelEnum } from '@clinia/logger-common';
import { createConsoleLogger } from '@clinia/logger-console';
import { createBrowserXhrRequester } from '@clinia/requester-browser-xhr';
import { createUserAgent, RequestOptions } from '@clinia/transporter';

import { CliniaSearchOptions } from '../types';

export default function clinia(
  appId: string,
  apiKey: string,
  options?: CliniaSearchOptions
): SearchClient {
  const commonOptions = {
    appId,
    apiKey,
    timeouts: {
      connect: 1,
      read: 2,
      write: 30,
    },
    requester: createBrowserXhrRequester(),
    logger: createConsoleLogger(LogLevelEnum.Error),
    responsesCache: createInMemoryCache(),
    requestsCache: createInMemoryCache({ serializable: false }),
    hostsCache: createFallbackableCache({
      caches: [
        createBrowserLocalStorageCache({ key: `${version}-${appId}` }),
        createInMemoryCache(),
      ],
    }),
    userAgent: createUserAgent(version).add({
      segment: 'Browser',
      version: 'lite',
    }),
    authMode: AuthMode.WithinQueryParameters,
  };

  return createSearchClient({
    ...commonOptions,
    ...options,
    methods: {
      search: multipleQueries,
      multipleQueries,
      initIndex: base => (indexName: string): SearchIndex => {
        return initIndex(base)(indexName, {
          methods: { search },
        });
      },
    },
  });
}

// eslint-disable-next-line functional/immutable-data
clinia.version = version;

export type SearchIndex = BaseSearchIndex & {
  readonly search: <TRecord>(
    query: string,
    requestOptions?: RequestOptions & SearchOptions
  ) => Readonly<Promise<SearchResponse<TRecord>>>;
};

export type SearchClient = BaseSearchClient & {
  readonly initIndex: (indexName: string) => SearchIndex;
  readonly search: <TRecord>(
    queries: readonly MultipleQueriesQuery[],
    requestOptions?: RequestOptions & MultipleQueriesOptions
  ) => Readonly<Promise<MultipleQueriesResponse<TRecord>>>;
};

export { WithoutCredentials, CliniaSearchOptions } from '../types';
