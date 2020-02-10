export type PlaceSearchOptions = {
  /**
   * Create a new query.
   */
  readonly query: string;

  /**
   * Restrict the search results to a specific list of countries. You can pass two letters country codes (ISO-3166-1)
   */
  readonly country?: readonly string[];

  /**
   * Restrict the search results to a specific type.
   */
  readonly types?: ReadonlyArray<
    | 'country'
    | 'region'
    | 'postcode'
    | 'disctrict'
    | 'place'
    | 'locality'
    | 'neighborhood'
    | 'address'
    | 'poi'
    | 'route'
  >;

  /**
   * Specifies how many results you want to retrieve per search
   */
  readonly size?: number;
};
