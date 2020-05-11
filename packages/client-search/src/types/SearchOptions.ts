export type SearchOptions = {
  /**
   * Create a new query with an empty search query.
   */
  readonly query?: string;

  /**
   * Gives control over which properties to retrieve and which not to retrieve.
   */
  readonly properties?: readonly string[];

  /**
   * Restricts a given query to look in only a subset of your searchable properties.
   */
  readonly searchProperties?: readonly string[];

  /**
   *  Filter hits by facet value.
   */
  readonly facetFilters?: string | readonly string[] | ReadonlyArray<readonly string[]>;

  /**
   * Filter on numeric attributes.
   */
  readonly numericFilters?: string | readonly string[] | ReadonlyArray<readonly string[]>;

  /**
   * Facets to retrieve.
   */
  readonly facets?: readonly string[];

  /**
   * List of properties to highlight.
   */
  readonly highlightProperties?: readonly string[];

  /**
   * The HTML string to insert before the highlighted parts in all highlight and snippet results.
   */
  readonly highlightPreTag?: string;

  /**
   * The HTML string to insert after the highlighted parts in all highlight and snippet results
   */
  readonly highlightPostTag?: string;

  /**
   * Specify the page to retrieve.
   */
  readonly page?: number;

  /**
   * Set the number of hits per page.
   */
  readonly perPage?: number;

  /**
   * Search for entries around a central geolocation, enabling a geo search within a circular area.
   */
  readonly aroundLatLng?: string;

  /**
   * Search for entries around a given location automatically computed from the requester’s IP address.
   */
  readonly aroundLatLngViaIP?: boolean;

  /**
   * Specify the radius to use
   */
  readonly aroundRadius?: number | 'all';

  /**
   * Minimum radius (in meters) used for a geo search when aroundRadius is not set.
   */
  readonly minimumAroundRadius?: number;

  /**
   * Search inside a rectangular area (in geo coordinates).
   */
  readonly insideBoundingBox?: ReadonlyArray<readonly number[]>;

  /**
   * Controls if and how query words are interpreted as prefixes.
   */
  readonly queryType?: 'prefix_last' | 'prefix_none' | 'prefix_all';

  /**
   * Whether the current query will be taken into account in the Analytics
   */
  readonly analytics?: boolean;

  /**
   * List of tags to apply to the query in the analytics.
   */
  readonly analyticsTags?: readonly string[];

  /**
   * Enable the Click Analytics feature.
   */
  readonly clickAnalytics?: boolean;

  /**
   * When true, each hit in the response contains an additional _ranking object.
   */
  readonly rankingInfo?: boolean;

  /**
   * Set the sorting strategy
   */
  readonly sort?: string;
};
