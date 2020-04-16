import { MethodEnum } from '@clinia/requester-common';
import { RequestOptions, serializeQueryParameters } from '@clinia/transporter';

import {
  MultipleQueriesOptions,
  MultipleQueriesQuery,
  MultipleQueriesResponse,
  SearchClient,
} from '../..';

export const multipleQueries = (base: SearchClient) => {
  return <TRecord>(
    queries: readonly MultipleQueriesQuery[],
    requestOptions?: RequestOptions & MultipleQueriesOptions
  ): Readonly<Promise<MultipleQueriesResponse<TRecord>>> => {
    const requests = queries.map((query) => {
      return {
        ...query,
        params: serializeQueryParameters(query.params || {}),
      };
    });

    return base.transporter.read(
      {
        method: MethodEnum.Post,
        path: 'search/v1/indexes/*/queries',
        data: {
          requests,
        },
        cacheable: true,
      },
      requestOptions
    );
  };
};
