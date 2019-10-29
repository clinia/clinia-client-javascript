## Features

- Thin & **minimal low-level HTTP client** to interact with Clinia's API
- Works both on the **browser** and **node.js**
- **UMD compatible**, you can use it with any module loader
- Contains type definitions: **[@types/cliniasearch](https://www.npmjs.com/package/@types/cliniasearch)**

## Getting Started

First, install Clinia JavaScript API Client via the [npm](https://www.npmjs.com/get-npm) package manager:

```bash
npm install --save cliniasearch
```

Let's search using the `search` method:

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

For full documentation, visit the **[online documentation](TODO)**.

## 📄 License

CLinia JavaScript API Client is an open-sourced software licensed under the [MIT license](LICENSE).
