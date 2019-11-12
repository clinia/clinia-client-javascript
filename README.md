# Features

- Thin & **minimal low-level HTTP client** to interact with Clinia's API
- Works both on the **browser** and **node.js**
- **UMD compatible**, you can use it with any module loader
- Contains type definitions: **[@types/cliniasearch](https://www.npmjs.com/package/@types/cliniasearch)**

# Getting Started

First, install Clinia JavaScript API Client via the [npm](https://www.npmjs.com/get-npm) package manager:

```bash
npm install --save cliniasearch
```
OR
```bash
yarn add cliniasearch
```

## Quickstart

Let's search using the `search` method, targeting a single index:

```js
const cliniasearch = require('cliniasearch');

const client = cliniasearch('YourApplicationID', 'YourAPIKey');
const index = client.initIndex('your_index_name');

index
  .search('Fo')
  .then(({ hits }) => {
    console.log(hits);
  })
  .catch(err => {
    console.log(err);
  });
```

# More in details...

The client allows to use the following Clinia APIs:
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
```js
const client = cliniasearch('YourApplicationID', 'YourAPIKey');
```
---
### `client.initIndex(indexName)`
Get the `Index` object initialized .

#### **Arguments**
- **indexName (_string_)** -- Name of the targeted index. 

#### **Returns**
Returns an instance of `Index`.

---
### `client.initPlaces()`
Get the Places object initialized.

#### **Returns**
Returns an instance of `Places`.

---
### `client.setExtraHeader(name, value)`
Add an extra field to the HTTP request.

#### **Arguments**
- **name (_string_)** -- The header field name. 
- **value (_string_)** -- The header field value. 

---
### `client.getExtraHeader(name)`
Get the value of an extra HTTP header.

#### **Arguments**
- **name (_string_)** -- The header field name. 

#### **Returns**
A `string` of the field value.

---
### `client.unsetExtraHeader(name)`
Remove an extra field from the HTTP request.

#### **Arguments**
- **name (_string_)** -- The header field name. 

---
### `client.suggest(query, args, callback)`
Get query suggestions based on a query.

#### **Arguments**
- **query (_string_)** -- The query to get suggestions for.
- **args (_Object_)** -- The query parameters.
  - **highlightPreTag (_string_)** -- The pre tag used to highlight matched query parts.
  - **highlightPostTag (_string_)** -- The post tag used to highlight matched query parts.
  - **size (_number_)** -- Max number of suggestions to receive.
- **callback (_Function_)** -- Callback to be called.

#### **Returns**
Returns a `Promise` if no callback given.

#### Example
```js
client.suggest('sons', { highlightPreTag: "<strong>", highlightPostTag: "</strong>" }, function(err, suggestions) {
  if (err) {
    throw err;
  }
  
  console.log(suggestions)
})
```

---
### `client.search(queries, args, callback)`
Search through multiple indices at the same time.

#### **Arguments**
- **queries (_Object[]_)** -- An array of queries you want to run.
  - **indexName (_string_)** -- The name of the index you want to target.
  - **query (_string_)** -- The query to issue on this index. Can also be passed into `params`.
  - **params (_Object_)** -- Search params.
    - **page (_string_)** -- Page offset.
    - **perPage (_string_)** -- Page size.
    - **queryTypes (_string[]_)** -- Types of the query.
    - **filters (_Object_)** -- The query filters.
      - **location (_string_)** -- A postal code, the name of a city or a region.
- **args (_Object_)** -- The query parameters.
- **callback (_Function_)** -- Callback to be called.

#### **Returns**
Returns a `Promise` if no callback given.

#### Example
```js
var queries = [
  {
    indexName: 'health_facility',
    query: 'sons',
    params: {
      queryType: 'prefixLast',
      searchFields: ['name'],
    },
  },
  {
    indexName: 'professional',
    query: 'sons',
    params: {
      queryType: 'prefixLast',
      searchFields: ['name'],
    },
  },
];

client.search(queries, function(err, response) {
  if (err) {
    throw err;
  }

  console.log(response.results);
});
```

# 📄 License

Clinia JavaScript API Client is an open-sourced software licensed under the [MIT license](LICENSE).
