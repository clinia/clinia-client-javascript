<div align="center">
  <img src="./clinia-logo.svg" width="250">
  <h1>Clinia JavaScript API Client</h1>
  <h4>Thin & minimal low-level HTTP client to interact with Clinia's API</h4>
  <p>
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#more-details">More Details</a> •
    <a href="#api">API</a> •
    <a href="#-license">License</a>
  </p>
</div>

<div align="center">

[![Version][version-svg]][package-url] [![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url]

</div>

# Features

- Allows authenticated communication with Clinia's API suites.
- Works both on the **browser** and **node.js**
- **UMD compatible**, you can use it with any module loader
- Built with TypeScript

# Getting Started

First, install Clinia JavaScript API Client via the [npm](https://www.npmjs.com/get-npm) package manager:

```bash
npm install --save clinia
OR
yarn add clinia
```

## Quickstart

Let's search using the `search` method, targeting a single index:

```js
const clinia = require('clinia');

const client = clinia('YourEngineID', 'YourAPIKey');
const index = client.initIndex('your_index_name');

index
  .search('Foo')
  .then(({ results }) => {
    console.log(results);
  })
  .catch(err => {
    console.log(err);
  });
```

# More Details

The client allows the use the following Clinia APIs:
- Single index search
- Multiple indexes search
- Query suggestions (Autocomplete)
- Location suggestions (Autocomplete)

## Single index search

For use cases where one wants to search through a single index, the client provides the `Index` interface. The current possible `index` values are :

- `professional` : Represents people working in the health industry like doctors, physiotherapists and other health professionals.
- `health_facility` : Represents health establishments like clinics, hospitals, pharmacies and other health facilities.

## Multiple indexes search

For use cases where one wants to search through all indexes, the client provides methods to search directly, without using the `Index` interface. 

## Query suggestions (Autocomplete)

For use cases where one wants to get query suggestions based on a user input, the client provides methods to autocomplete queries based on the content of one's database. Typical use cases usually follow query suggestions with an actual search using the provided suggestion as search query.

## Place suggestions (Autocomplete)

For use cases where one wants to get place suggestions based on a user input, the client provides methods to autocomplete queries based Clinia's Location API. Typical use cases usually follow place suggestions with an actual search using the provided place as parameter to a search query.

# API
## `Client`
### Initialization
```js
const client = clinia('YourEngineID', 'YourAPIKey');
```
---
### `client.initIndex(indexName)`
Initializes the `SearchIndex` object.

#### Arguments
- **indexName (_string_)** -- Name of the targeted index. 

#### Returns
Returns an instance of `SearchIndex`.

---
### `client.initPlaces()`
Initializes the `PlacesClient` object.

#### Returns
Returns an instance of `Places`.

---
### `client.setExtraHeader(name, value)`
Add an extra header to the HTTP request.

#### Arguments
- **name (_string_)** -- The header field name. 
- **value (_string_)** -- The header field value. 

---
### `client.getExtraHeader(name)`
Get the value of an extra HTTP header.

#### Arguments
- **name (_string_)** -- The header field name. 

#### Returns
A `string` of the header value.

---
### `client.unsetExtraHeader(name)`
Remove an extra header from the HTTP request.

#### Arguments
- **name (_string_)** -- The header field name. 

---
### `client.suggest(query, args, callback)`
Get query suggestions based on a query.

#### Arguments
- **query (_string_)** -- The query to get suggestions for.
- **args (_Object_)** -- The query parameters.
  - **highlightPreTag (_string_)** -- The pre tag used to highlight matched query parts.
  - **highlightPostTag (_string_)** -- The post tag used to highlight matched query parts.
  - **size (_number_)** -- Max number of suggestions to receive.
- **callback (_Function_)** -- Callback to be called.

#### Returns
Returns a `Promise`

#### Example
```js
client.suggest('Foo', { highlightPreTag: "<strong>", highlightPostTag: "</strong>" }).then((res) => {
  console.log(res)
});
```
---
### `client.search(queries, callback)`
Search through multiple indices at the same time.

#### Arguments
- **queries (_Object[]_)** -- An array of queries you want to run.
  - **indexName (_string_)** -- The name of the index you want to target.
  - **query (_string_)** -- The query to issue on this index. Can also be passed into `params`.
  - **params (_Object_)** -- Search params.
    - **page (_string_)** -- Page offset.
    - **perPage (_string_)** -- Page size.
    - **queryType (_string_)** -- Strategy for the query. <br/> Possible values are `prefix_last` or `prefix_none`.<br/>`prefix_last` will return partial word match.<br/>`prefix_none` will return exact word match.
    - **searchFields (_string[]_)** -- Fields in which to search.
    - **location (_string_)** -- A postal code, the name of a city or a region.
- **callback (_Function_)** -- Callback to be called.

#### Returns
Returns a `Promise` if no callback is given.

#### Example
```js
var queries = [
  {
    indexName: 'health_facility',
    params: {
      query: 'sons',
      queryType: 'prefix_last',
    },
  },
  {
    indexName: 'professional',
    params: {
      query: 'sons',
      queryType: 'prefix_last',
    },
  },
];

client.search(queries).then(res => {
  console.log(res);
});
```
<br/>

## `Index`
Initialization
```js
const index = client.initIndex(indexName);
```
The current possible `indexName` values are :

- `professional` : Represents people working in the health industry like doctors, physiotherapists and other health professionals.
- `health_facility` : Represents health establishments like clinics, hospitals, pharmacies and other health facilities.
---
### `index.search(query, args)`
Search through a single index.

#### Arguments
- **query (_Object_)** -- The query to issue on this index. Can also be passed into `args`.
- **args (_Object_)** -- The query parameters.
  - **page (_string_)** -- Page offset.
  - **perPage (_string_)** -- Page size.
  - **queryType (_string_)** -- Strategy for the query. <br/> Possible values are `prefix_last` or `prefix_none`.<br/>`prefix_last` will return partial word match.<br/>`prefix_none` will return exact word match.
  - **searchFields (_string[]_)** -- Fields in which to search.
  - **location (_string_)** -- A postal code, the name of a city or a region.
- **callback (_Function_)** -- Callback to be called.

#### Returns
Returns a `Promise` if no callback is given.

#### Example
```js
index.search('Foo', { queryType: 'prefix_last', filters: { location: 'Bar' }}).then(res => {
  console.log(res)
})
```
<br/>

# List of object properties

## Multiple indexes response [Object]
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `results`| _IndexResponse[]_ | Contains the results from all indexes  ||
<br/>

### IndexResponse
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `index` | _string_ | Name of the index | `professional`<br/>`health_facility`|
| `records` | _Record[]_ | Contains the records matching the search ||
| `meta` | _Metadata_ | Metadata of the search ||
<br/>

## Single index response [Object]
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `records` | _Record[]_ | Contains the records matching the search ||
| `meta` | _Metadata_ | Metadata of the search ||
<br/>

## Shared

### Record (`health_facility`)
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `documentType` | _string_ | Type of document. | `health_facility`|
| `id` | _string_ | Identifier of the resource. ||
| `type` | _string_ | Type of resource. ||
| `address` | _Address_ | Address. ||
| `geoPoint` | _GeoPoint_ | Coordinate of the resource, if applicable. ||
| `onlineBookingUrl` | _string_ | Online booking url. ||
| `distance` | _double_ | Distance (in meters) from the center of the location search parameter. ||
| `openingHours` | _Map<string, Interval[]>_ | Opening hours. | The keys are strings from `1` to `7`.<br/>`1: Monday`<br/>`2: Tuesday`<br/>`3: Wednesday`<br/>`4: Thursday`<br/>`5: Friday`<br/>`6: Saturday`<br/>`7: Sunday` |
| `name` | _string_ | Name of the resource. ||
| `phones` | _Phone[]_ | Name of the resource. ||
| `owner` | _string_ | Owner of the resource (mainly used internally) ||
<br/>

### Record (`professional`)
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `documentType` | _string_ | Type of document. | `professional` |
| `id` | _string_ | Identifier of the resource. ||
| `title` | _string_ | Title of the resource | `MR`<br/>`MS`<br/>`DR`<br/>`DRE`<br/>|
| `practiceNumber` | _string_ | Practice number of the resource. ||
| `name` | _string_ | Name. ||
| `phones` | _Phone[]_ | Phones. ||
| `owner` | _string_ | Owner of the resource (mainly used internally) ||
<br/>

### Phone
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `countryCode` | _string_ | Country code. ||
| `number` | _string_ | Phone number. ||
| `extension` | _string_ | Extension. ||
| `type` | _string_ | Type of phone. | `UNKNOWN`<br/>`MAIN`<br/>`ALTERNATE`<br/>`RECEPTION`<br/>`FAX`<br/>`TEXT_TELEPHONE_TTY`<br/>`INFO`<br/>`TOOL_FREE`<br/>`PAGER`<br/>`MOBILE`<br/>`HOME`<br/>`WORK`<br/>`PERSONAL`<br/>`OTHER`<br/> |
<br/>

### Address
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `streetAddress` | _string_ | Street number plus route name. ||
| `suiteNumber` | _string_ | Suite, door, appartment number. ||
| `postalCode` | _string_ | Postal code. ||
| `neighborhood` | _string_ | Neighborhood. ||
| `locality` | _string_ | Locality. ||
| `place` | _string_ | City. ||
| `region` | _string_ | Name of the region. ||
| `regionCode` | _string_ | ISO 3166-2 region code. ||
| `country` | _string_ | Name of the country. ||
| `countryCode` | _string_ | ISO 3166 country code ||
<br/>

### Interval
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `start` | _string_ | Start time of the time interval. | Format is `HH:mm` |
| `end` | _string_ | End time of the time interval. | Format is `HH:mm` |
<br/>

### Metadata 
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `query` | _string_ | Query. ||
| `page` | _number_ | Current page. ||
| `numPages` | _number_ | Total number of available pages. ||
| `perPage` | _number_ | Number of records per page. ||
| `total` | _number_ | Total number of records matching the query. ||
| `aroundLatLng` | _string_ | Coordinate around which the search is geographically centered. | e.g. '45.5016889,-73.567256' |
| `insideBoundingBox` | _string_ | Bounding box inside which the search was applied. | e.g. '45.739653,-73.472354,45.5016889,-73.567256' |
<br/>

### Geometry
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `bounds` | _Bounds_ | Bounds of the location. ||
| `location` | _GeoPoint_ | Best coordinate to locate the location. ||
<br/>

### Bounds
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `northEast` | _GeoPoint_ | North-east coordinate delimiting the bounds of the location. ||
| `southWest` | _GeoPoint_ | South-west coordinate delimiting the bounds of the location. ||
<br/>

### GeoPoint
| Field name | Type | Description | Possible Values |
|------------|------|-------------|-----------------|
| `lat` | _double_ | Latitude ||
| `lng` | _double_ | Longitude ||
<br/>

# 📄 License

Clinia JavaScript API Client is an open-sourced software licensed under the [MIT license](LICENSE).

<!-- Links -->

[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/cliniasearch.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=cliniasearch
[version-svg]: https://img.shields.io/npm/v/cliniasearch.svg?style=flat-square
[package-url]: https://yarnpkg.com/en/package/cliniasearch
