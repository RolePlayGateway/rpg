'use strict';

const {
  HEADER_LENGTH,
  MAP_TILE_SIZE
} = require('../constants.js');

const Key = require('@fabric/core/types/key');
const Tile = require('./tile');

class Map extends Tile {
  /**
   * Create an instance of {@link Map} to track players within a space.  By
   * default, maps are 256^3, where 3 equals the number of dimensions in our
   * grid.  Use these parameters wisely.
   * @param  {Object} [data={}] Input data to configure the {@link Map}.
   * @return {Map}           Low-level representation of the {@link Map}.
   */
  constructor (data = {}) {
    super(data);

    // Maps are matrices of a particular dimension.
    this.settings = Object.assign({
      height: 256,
      width: 256,
      depth: 32
    }, data);

    // Map memory: 64 byte header, 32 bytes per cell
    // ~16MB per map...
    this.size = HEADER_LENGTH + (MAP_TILE_SIZE * (
      this.settings.height *
      this.settings.width *
      this.settings.depth
    ));

    // TODO: replace with random from Fabric.Machine
    this.key = new Key();
    console.log(`[MAP]`, 'fabric seed:', this.key.id);
    this.seed = this.key.id.toString('hex');
    console.log(`[MAP]`, 'local seed:', typeof this.seed, this.seed.length, this.seed);
    console.log(`[MAP]`, 'magic length:', 0xC0D3F33D.toString().length);
    console.log(`[MAP]`, 'memory size (bytes):', this.size);

    this.data = Buffer.alloc(this.size);

    this.header = Buffer.alloc(HEADER_LENGTH);
    this.header.writeInt32BE(0x01, 0);
    this.header.write(0xC0D3F33D.toString(), 4);
    this.header.writeInt32BE(this.seed, 32);

    return this;
  }

  _build () {
    this.status = 'building';
    console.log(`[MAP]`, 'Building map (this can take a while)...');
    let number = (this.settings.height * this.settings.width * this.settings.depth);

    for (let i = 0; i < number; i++) {
      let tile = new Tile();
      let offset = 64 + (2 * i);
      this.data.writeInt32BE(tile.data, offset);
    }

    this.emit('build', [this.header, this.data]);
    this.status = 'ready';
  }

  _dump () {
    console.log('memory:', this.data);
    return this.data;
  }
}

module.exports = Map;
