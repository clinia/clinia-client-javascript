import { SearchResponse } from '../..';

export const getRecordPosition = <TRecord>() => {
  return (searchResponse: SearchResponse<TRecord>, id: string): number => {
    // eslint-disable-next-line functional/no-loop-statement
    for (const [position, hit] of Object.entries(searchResponse.hits)) {
      if (hit.id === id) {
        return parseInt(position, 10);
      }
    }

    return -1;
  };
};
