const store = require('./store');
const seedDays = require('./seed');

store.seedIfEmpty(seedDays);

module.exports = store;
