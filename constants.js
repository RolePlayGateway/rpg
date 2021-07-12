'use strict';

// prime constants
const GENESIS_HASH = 'f8c3bf62a9aa3e6fc1619c250e48abe7519373d3edf41be62eb5dc45199af2ef';
const HTTP_HOST = 'api.roleplaygateway.com';
const TICK_INTERVAL = 10 * 60 * 1000; // 10 minutes * 60 seconds * 1000 millis
const FRAMES_PER_BLOCK = 60 * 60 * 10 * 1000;

const HEADER_LENGTH = 64;
const MAGIC_NUMBER = 0xC0D3F33D;
const MAP_TILE_SIZE = 32;

// ephemeral constants
const BIG_LIST_LIMIT = 5; // change to exceed maximum id for final run...

// game constants
const MIN_LOOT_WORTH = 10;
const MAX_LOOT_WORTH = 30;

const MIN_ITEM_DURABILITY = 20;
const MAX_ITEM_DURABILITY = 50;

const SPRITE_SIZE_IN_BYTES = Math.pow(256, 3) / 8; // 3x 256-bit dimensions

module.exports = {
  GENESIS_HASH,
  BIG_LIST_LIMIT,
  FRAMES_PER_BLOCK,
  HEADER_LENGTH,
  MAGIC_NUMBER,
  MAP_TILE_SIZE,
  HTTP_HOST,
  TICK_INTERVAL,
  MIN_LOOT_WORTH,
  MAX_LOOT_WORTH,
  MIN_ITEM_DURABILITY,
  MAX_ITEM_DURABILITY,
  SPRITE_SIZE_IN_BYTES
};
