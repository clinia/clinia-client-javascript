import { RecordWithId } from '.';

export type SearchResponse<TRecord = {}> = {
  /**
   * The hits returned by the search.
   *
   * Hits are ordered according to the ranking or sorting of the index being queried.
   */
  hits: Array<TRecord & RecordWithId>;

  /**
   * Index name used for the query.
   */
  index?: string;

  /**
   * A mapping of each facet name to the corresponding facet counts.
   */
  facets?: Record<string, Record<string, number>>;

  meta: {
    /**
     * The query used to search. Accepts every character, and every character entered will be used in the search.
     *
     * An empty query can be used to fetch all records.
     */
    query: string;

    /**
     * A url-encoded string of all search parameters.
     */
    params: string;

    /**
     * Index of the current page (zero-based).
     */
    page: number;

    /**
     * Number of hits matched by the query.
     */
    total: number;

    /**
     * Whether to (total) is exhaustive (true) or approximate (false).
     */
    exhaustiveTotal: boolean;

    /**
     * Number of pages returned.
     *
     * Calculation is based on the total number of hits (total) divided by the
     * number of hits per page (perPage), rounded up to the nearest integer.
     */
    numPages: number;

    /**
     * Maximum number of hits returned per page.
     */
    perPage: number;

    /**
     * Time the server took to process the request, in milliseconds. This does not include network time.
     */
    took: number;

    /**
     * The computed geo location.
     *
     * Format: "lat,lng", where the latitude and longitude are expressed as decimal floating point number.
     */
    aroundLatLng?: string;

    /**
     * The automatically computed radius.
     */
    automaticRadius?: string;

    /**
     * Unique identifier of the search query, to be sent in Insights methods. This identifier links events back to the search query it represents.
     *
     * Returned only if clickAnalytics is true.
     */
    queryID?: string;
  };

  /**
   * Used to return warnings about the query.
   */
  message?: string;
};
