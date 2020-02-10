import { createNullCache } from '@clinia/cache-common';
import { createInMemoryCache } from '@clinia/cache-in-memory';
import { destroy, version } from '@clinia/client-common';
import {
  createPlacesClient,
  PlacesClient as BasePlacesClient,
  PlaceSearchOptions,
  PlaceSearchResponse,
  search as placeSearch,
} from '@clinia/client-places';
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
import { createNullLogger } from '@clinia/logger-common';
import { Destroyable } from '@clinia/requester-common';
import { createNodeHttpRequester } from '@clinia/requester-node-http';
import { createUserAgent, RequestOptions } from '@clinia/transporter';

import { CliniaSearchOptions, InitPlacesOptions } from '../types';

export default function clinia(
  appId: string,
  apiKey: string,
  options?: CliniaSearchOptions
): SearchClient {
  const commonOptions = {
    appId,
    apiKey,
    timeouts: {
      connect: 2,
      read: 5,
      write: 30,
    },
    requester: createNodeHttpRequester(),
    logger: createNullLogger(),
    responsesCache: createNullCache(),
    requestsCache: createNullCache(),
    hostsCache: createInMemoryCache(),
    userAgent: createUserAgent(version).add({
      segment: 'Node.js',
      version: process.versions.node,
    }),
  };

  return createSearchClient({
    ...commonOptions,
    ...options,
    methods: {
      search: multipleQueries,
      multipleQueries,
      destroy,
      initIndex: base => (indexName: string): SearchIndex => {
        return initIndex(base)(indexName, {
          methods: {
            search,
          },
        });
      },
      initPlaces: () => (clientOptions?: InitPlacesOptions): PlacesClient => {
        return createPlacesClient({
          ...commonOptions,
          ...clientOptions,
          methods: {
            search: placeSearch,
          },
        });
      },
    },
  });
}

// eslint-disable-next-line functional/immutable-data
clinia.version = version;

export type PlacesClient = BasePlacesClient & {
  readonly search: (
    query: string,
    requestOptions?: RequestOptions & PlaceSearchOptions
  ) => Readonly<Promise<PlaceSearchResponse>>;
};

export type SearchIndex = BaseSearchIndex & {
  readonly search: <TObject>(
    query: string,
    requestOptions?: RequestOptions & SearchOptions
  ) => Readonly<Promise<SearchResponse<TObject>>>;
};

export type SearchClient = BaseSearchClient & {
  readonly initIndex: (indexName: string) => SearchIndex;
  readonly search: <TRecord>(
    queries: readonly MultipleQueriesQuery[],
    requestOptions?: RequestOptions & MultipleQueriesOptions
  ) => Readonly<Promise<MultipleQueriesResponse<TRecord>>>;
  readonly initPlaces: (options?: InitPlacesOptions) => PlacesClient;
} & Destroyable;

export * from '../types';
