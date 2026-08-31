const store = require('./store');
const seedDays = require('./seed');
const seedSpots = require('./seed-spots');

store.seedIfEmpty(seedDays);
store.seedSpotsIfEmpty(seedSpots);

module.exports = store;
