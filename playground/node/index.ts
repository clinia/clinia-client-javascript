import cliniaType from 'clinia';

const clinia: typeof cliniaType = require('../../packages/clinia');

const client = clinia('..', '..');
console.log(client);
