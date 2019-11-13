type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare namespace cliniasearch {
  /**
   * Interface for the clinia client object
   */
  interface Client {
    /**
     * Initialization fo the index
     * @param indexName 
     */
    initIndex(indexName: string): Index

    /**
     * Query on multiple index
     * @param queries 
     * @param cb 
     */
    search<T=any>(
      queries: {
        indexName: string;
        query: string;
        params: QueryParameters;
      }[],
      cb: (err: Error, res: MultiResponse<T>) => void
    ):void;

    /**
     * Query on multiple index
     */
    search<T=any>(
      queries: {
        indexName: string;
        query: string;
        params: QueryParameters;
      }[]
    ): Promise<MultiResponse<T>>;

    /**
     * clear browser cache
     */
    clearCache(): void;

    /**
     * kill alive connections
     */
    destroy(): void

    /**
     * Add a header to be sent with all upcoming requests
     */
    setExtraHeader(name: string, value: string): void;

    /**
     * Get the value of an extra header
     */
    getExtraHeader(name: string): string;

    /**
     * Remove an extra header for all upcoming requests
     */
    unsetExtraHeader(name: string): void;

    /**
     * add a header, used for flagging Vision implementations
     */
    addCliniaAgent(agent: string): void;
  }

  /**
   * Interface for the index clinia object
   */
  interface Index {
    indexName: string;
    
    /**
     * Search in an index
     */
    search<T=any>(params: QueryParameters): Promise<Response<T>>;

    /**
     * Search in an index
     */
    search<T=any>(
      params: QueryParameters,
      cb: (err: Error, res: Response<T>) => void
    ): void;
  }

  /**
   * Interface describing available options when initializing a client
   */
  interface ClientOptions {
    /**
     * Timeout for requests to our servers, in milliseconds
     * default: 15s (node), 2s (browser)
     */
    timeout?: number;
    /**
     * Protocol to use when communicating with algolia
     * default: current protocol(browser), https(node)
     */
    protocol?: string;
    /**
     * (node only) httpAgent instance to use when communicating with  servers.
     */
    httpAgent?: any;
    /**
     * read: array of read hosts to use to call  servers, computed automatically
     * write: array of read hosts to use to call  servers, computed automatically
     */
    hosts?: { read?: string[]; write?: string[] };
    /**
     * enable the experimental feature: caching requests instead of responses
     */
    _useRequestCache?: boolean
  }

  interface QueryParameters {
    /**
     * Query string used to perform the search
     * default: ''
     */
    query?: string;
    
    /**
     * List of attributes you want to use for textual search
     * default: all
     */
    searchFields?: string[];
    
     /**
      * Pagination parameter used to select the number of records per page
      * default: 20
      */
     perPage?: number;
     
     /**
      * Pagination parameter used to select the page to retrieve.
      * default: 0
      */
     page?: number;
     
     /**
      * Search for entries around a given location
      * default: ""
      */
     aroundLatLng?: string;

     /**
      * Control the radius associated with a geo search. Defined in meters.
      * default: null
      * You can specify aroundRadius=all if you want to compute the geo distance without filtering in a geo area
      */
     aroundRadius?: number | 'all';
     
     /**
      * Search entries inside a given area defined by the two extreme points of a rectangle
      * default: null
      */
     insideBoundingBox?: number[][];
     /**
      * Selects how the query words are interpreted
      * default: 'prefix_none'
      * 'prefix_last' Only the last word is interpreted as a prefix.
      * 'prefix_none' No query word is interpreted as a prefix. (default behavior)
      */
     queryType?: "prefix_last"|"prefix_none";
  }

  interface Response<T=any> {
    /**
    * Contains all the records matching the query
    */
    records: T[]

    meta: {
      /**
      * Current page
      */
      page: number;

      /**
      * NUmber of total records mathcing the query
      */
      total: number;

      /**
      * Number of pages
      */
      numPages: number;

      /**
      * Number of records per page
      */
      perPage: number;

      /**
      * Query used to perform the search
      */
      query: string;

      /**
      * The computed geo location.
      * Only returned when location or aroundLatLng is set.
      */
      aroundLatLng?: string;

      /**
      * The automatically computed radius. 
      * Only returned for geo queries without an explicitly specified radius (see aroundRadius).
      */
      automaticRadius?: string;

      /**
      * The index name is only set when searching multiple indices.
      */
      index?: string;       
    }
  }

  interface MultiResponse<T=any> {
    results: Response<T>[];
  }

  namespace Places {

    interface PlaceInterface {

    }

  }
}

interface CliniasearchInstance {
  (
    apiKey: string,
    options?: cliniasearch.ClientOptions,
  ): cliniasearch.Client;
}

interface CliniaStatic extends CliniasearchInstance {
  initPlaces(apiKey: string, applicationId: string): cliniasearch.Places.PlaceInterface;
}

declare const algoliasearch: CliniaStatic;

export = algoliasearch;
export as namespace algoliasearch;