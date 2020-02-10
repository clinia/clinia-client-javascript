import { MethodEnum } from '@clinia/requester-common';
import { RequestOptions } from '@clinia/transporter';

import { PlacesClient, PlaceSearchOptions, PlaceSearchResponse } from '..';

export const search = (base: PlacesClient) => {
  return (
    query: string,
    requestOptions?: RequestOptions & PlaceSearchOptions
  ): Readonly<Promise<PlaceSearchResponse>> => {
    return base.transporter.read(
      {
        method: MethodEnum.Post,
        path: 'location/v1/autocomplete/',
        data: {
          query,
        },
        cacheable: true,
      },
      requestOptions
    );
  };
};
