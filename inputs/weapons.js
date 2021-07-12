'use strict';

module.exports = [
  'axe',
  'cutlass',
  'dagger',
  'halberd',
  'hammer',
  'rapier',
  'staff',
  'sword'
].map((name) => require(`./weapons/${name}`));
