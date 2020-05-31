'use strict';

module.exports = [
  'axe',
  'cutlass',
  'dagger',
  'halberd',
  'hammer',
  'rapier',
  'staff',
  'sword',
  'whip'
].map((name) => require(`./weapons/${name}`));
