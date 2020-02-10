import { RecordWithId } from '.';

// @todo add docs here.
export type SearchResponse<TRecord = {}> = {
  readonly index?: string;
  readonly records: ReadonlyArray<TRecord & RecordWithId>;
  readonly facets?: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly meta: {
    readonly query: string;
    readonly params: string;
    readonly processingTimeMS: number;

    // Pagination
    readonly page: number;
    readonly total: number;
    readonly numPages: number;
    readonly perPage: number;

    // Geo Search
    readonly aroundLatLng?: string;
    readonly automaticRadius?: string;

    readonly queryID?: string;
  };

  // Error
  readonly message?: string;
};
