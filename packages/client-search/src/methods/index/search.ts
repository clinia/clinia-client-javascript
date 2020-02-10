import { encode } from '@clinia/client-common';
import { MethodEnum } from '@clinia/requester-common';
import { RequestOptions } from '@clinia/transporter';

import { SearchIndex, SearchOptions, SearchResponse } from '../..';

export const search = (base: SearchIndex) => {
  return <TRecord>(
    query: string,
    requestOptions?: RequestOptions & SearchOptions
  ): Readonly<Promise<SearchResponse<TRecord>>> => {
    return base.transporter.read(
      {
        method: MethodEnum.Post,
        path: encode('search/v1/indexes/%s/query', base.indexName),
        data: {
          query,
        },
        cacheable: true,
      },
      requestOptions
    );
  };
};
