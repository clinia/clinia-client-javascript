import { RecordWithId, SearchResponse } from '.';

export type MultipleQueriesResponse<TRecord> = {
  /**
   * The list of results.
   */
  readonly results: ReadonlyArray<SearchResponse<TRecord & RecordWithId>>;
};
