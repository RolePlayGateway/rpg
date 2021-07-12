'use strict';

const {
  MAGIC_NUMBER
} = require('../constants');

const BN = require('bn.js');

const crypto = require('crypto');
const Entity = require('@fabric/core/types/entity');

class Tile extends Entity {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      magic: MAGIC_NUMBER,
      seed: 1
    }, settings);

    // 4 byte vector
    this.data = Buffer.from([
      0x00, // z
      0x00, // y
      0x00, // x
      0x01 // version number
    ]);

    this.address = this.data.toString('hex');
    this.status = 'ready';

    return this;
  }

  get id () {
    let data = this.toJSON();
    let hash = crypto.createHash('sha256').update(data).digest('hex');

    console.log('[RPG:TILE]', 'hash:', hash, 'data:', data);

    return hash;
  }

  generate () {
    let self = this;

    let parts = [
      self.machine.sip(), // 32 bits
      self.machine.sip(), // 32 bits
      self.machine.sip(), // 32 bits
      self.machine.sip(), // 32 bits
      self.machine.sip(), // 32 bits
      self.machine.sip(), // 32 bits
      self.machine.sip(), // 32 bits
      self.machine.sip()  // 32 bits
    ];

    let x = new BN(parts.join(''));
    let y = new BN(parts.join(''));
    let z = new BN(parts.join(''));

    let position = {
      x: x.toString(),
      y: y.toString(),
      z: z.toString()
    };

    return position;
  }

  toJSON () {
    return JSON.stringify(this._downsample(this.data));
  }

  toObject () {
    return {
      id: this.id,
      address: this.address,
      stack: [...this.data],
      status: 'ready'
    };
  }

  _setData (data) {
    
  }

  _renderWith (sprite) {
    return `<foo>sprite to render with: ${sprite}</foo>`;
  }
}

module.exports = Tile;
