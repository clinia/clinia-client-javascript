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

# 📄 License

Clinia JavaScript API Client is an open-sourced software licensed under the [MIT license](LICENSE).

<!-- Links -->

[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/clinia.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=clinia
[version-svg]: https://img.shields.io/npm/v/clinia.svg?style=flat-square
[package-url]: https://yarnpkg.com/en/package/clinia
