export type SearchOptions = {
  /**
   * Create a new query with an empty search query.
   */
  readonly query?: string;

  /**
   * Specify the page to retrieve.
   */
  readonly page?: number;

  /**
   * Set the number of hits per page.
   */
  readonly perPage?: number;

  /**
   *  Filter hits by facet value.
   */
  readonly facetFilters?: string | readonly string[] | ReadonlyArray<readonly string[]>;

  /**
   * Facets to retrieve.
   */
  readonly facets?: readonly string[];

  /**
   * Maximum number of facet values to return for each facet during a regular search.
   */
  readonly maxValuesPerFacet?: number;

  /**
   * The HTML string to insert before the highlighted parts in all highlight and snippet results.
   */
  readonly highlightPreTag?: string;

  /**
   * The HTML string to insert after the highlighted parts in all highlight and snippet results
   */
  readonly highlightPostTag?: string;

  /**
   * Controls if and how query words are interpreted as prefixes.
   */
  readonly queryType?: 'prefix_last' | 'prefix_none';

  /**
   * Restricts a given query to look in only a subset of your searchable attributes.
   */
  readonly searchableProperties?: readonly string[];

  /**
   * Search for entries close to a given geo place, enabling a geo search computed from a requester's text.
   */
  readonly location?: string;

  /**
   * Search for entries around a central geolocation, enabling a geo search within a circular area.
   */
  readonly aroundLatLng?: string;

  /**
   * Search for entries around a given location automatically computed from the requester’s IP address.
   */
  readonly aroundRadius?: number | 'all';

  /**
   * Search inside a rectangular area (in geo coordinates).
   */
  readonly insideBoundingBox?: ReadonlyArray<readonly number[]>;
};
