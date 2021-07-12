'use strict';

const config = require('../settings/default');
const State = require('@fabric/core/types/state');

const Map = require('./map');
const Point = require('./point');
const Player = require('./player');

/**
 * The {@link World} is our primary tool for interacting with game worlds.
 * @property {Map} map Instance of the World's {@link Map}.
 */
class World {
  /**
   * Create a {@link World} instance.
   * @param  {Object} [settings={}] Configuration object.
   * @return {World}               Instance of the World.
   */
  constructor (settings = {}) {
    this.settings = Object.assign({
      seed: 1,
      entropy: config.entropy
    }, settings);

    this.map = new Map(this.settings);
    this.agent = new Player();
    this.origin = new Point();

    this.status = null;
    this.timer = null;

    return this;
  }

  /**
   * Permanently commit to what you know about the {@link World}.
   * @return {Mixed} Unknown output.  Are you sure?
   */
  commit () {
    let state = new State({
      entropy: 'none',
      map: this.map
    });
    return state.id;
  }

  async _resync () {
    console.log('[WORLD]', 'resync:', Date.now());
    clearTimeout(this.timer);
  }

  async spawn () {
    this.status = 'spawning';
    this.commit();
    this.status = 'genesis';
  }

  async start () {
    this.status = 'starting';
    this.timer = setTimeout(this._resync.bind(this), 1000);

    this.map.on('build', function (data) {
      console.log('map is done building:', data);
      let header = data[0];
      let body = data[1];

      console.log('header:', header);
      console.log('version:', header.slice(0, 4));
      console.log('magic:', header.slice(4, 12));
      console.log('magic:', header.slice(4, 12).toString('hex'));
      console.log('world:', body);
    });

    this.status = 'started';
  }
}

module.exports = World;
