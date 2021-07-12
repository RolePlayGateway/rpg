// # `@rpg/core`
// Peer-to-peer game engine, powered by Fabric.
'use strict';

// Constants
const {
  TICK_INTERVAL,
  GENESIS_HASH
} = require('../constants');

// Dependencies
const BN = require('bn.js');
// TODO: remove these for constants elsewhere
const One = new BN('1');
const Zero = new BN('0');

// ### Internal Types
// Here we've created a few internal classes to keep IdleRPG well-organized.
const Avatar = require('@fabric/http/types/avatar');
const Entity = require('@fabric/core/types/entity');
const Hash256 = require('@fabric/core/types/hash256');
const Machine = require('@fabric/core/types/machine');
const Observer = require('@fabric/core/types/observer');
const Remote = require('@fabric/core/types/remote');
const Store = require('@fabric/core/types/store');
const Service = require('@fabric/core/types/service');
const Identity = require('@fabric/http/types/identity');

const Encounter = require('./encounter');
const Tile = require('./tile');
const World = require('./world');
const Player = require('./player');

/**
 * Primary RPG builder.
 * @property {State} state Holds state for the game.
 */
class RPG extends Service {
  /**
   * Build an RPG with the {@link Fabric} tools.
   * @param  {Object} configuration Settings to configure the RPG with.
   * @return {RPG} Instance of the RPG.
   */
  constructor (configuration) {
    super(configuration);

    // Begin @internal typing
    this['@type'] = 'RPG';
    this['@configuration'] = Object.assign({
      name: 'RPG',
      path: './stores/rpg',
      authority: 'api.roleplaygateway.com',
      persistent: true,
      globals: { tick: 0 },
      canvas: {
        height: 256,
        width: 256,
        depth: 32
      },
      interval: TICK_INTERVAL
    }, configuration);

    // ### Our Game State
    // The Game State holds all information necessary to reconstruct your game.
    // We use human-friendly names and keep things as small as possible, so do
    // your part in keeping this well-maintained!
    this.state = {
      channels: {}, // stores a list of channels.
      players: {}, // players are users... !
      services: {}, // services are networks
      tiles: {},
      users: {}, // users are network clients
      messages: {} // messages always present!!!
      // exchange stuff
      /* chains: {},
      blocks: {},
      depositors: {},
      orders: {},
      transactions: {} */
    };

    // temporary handles for debugging
    this['@avatar'] = new Avatar({ seed: this['@configuration']['entropy'] });
    this['@world'] = new World({ seed: this['@configuration']['entropy'] });
    this['@player'] = new Player();

    // set the genesis
    this['@genesis'] = this['@configuration'].genesis || GENESIS_HASH;
    // this['@modulator'] = new Modulator();

    // careful with this!
    this['@entity'] = {
      '@type': 'State',
      '@data': Object.assign({
        clock: 0,
        entropy: this['@configuration']['entropy']
      }, this.state)
    };

    // old vestiges of times long since past
    this['@data'] = Object.assign({
      globals: { tick: 0 }
    }, this['@configuration']);

    // internal utilities
    // #### Secret Values
    // Data stored within a contract may be encrypted, such that only its owners
    // may decipher its contents.  Homomorphic operations may still be computed
    // over these values, but the DLP holding will preserve this property.
    this.timer = null;
    this.avatar = this['@avatar'];
    this.machine = new Machine();

    // Set up remote Authority (RPG)
    this.remote = new Remote({
      secure: this['@configuration'].secure,
      authority: this['@configuration'].authority,
      host: this['@configuration'].authority,
      port: this['@configuration'].port
    });

    // Store secrets separately
    this.secrets = new Store({
      path: 'stores/secrets'
    });

    // remove mutable variables
    Object.defineProperty(this, 'timer', { enumerable: false });
    Object.defineProperty(this, 'avatar', { enumerable: false });
    Object.defineProperty(this, 'machine', { enumerable: false });
    Object.defineProperty(this, 'remote', { enumerable: false });
    Object.defineProperty(this, 'secrets', { enumerable: false });

    // remove various cruft
    Object.defineProperty(this, '@configuration', { enumerable: false });
    Object.defineProperty(this, '@avatar', { enumerable: false });
    Object.defineProperty(this, '@player', { enumerable: false });
    Object.defineProperty(this, '@world', { enumerable: false });

    return this;
  }

  static get Entity () {
    return Entity;
  }

  static get Encounter () {
    return Encounter;
  }

  static get Tile () {
    return Tile;
  }

  get identities () {
    // TODO: ensure all private data remains private (prove!)
    return this.state.identities;
  }

  /**
   * Increment the {@link Machine} by one clock cycle.
   * @param  {Boolean} [notify=true] When `true` will emit {@link Meessage} events.
   * @return {Promise}               Resolves with {@link State} `@id` (for recordkeeping).
   */
  async tick (notify = true) {
    console.log('[RPG]', 'Beginning tick...', Date.now());
    console.log('[RPG]', 'STATE (@entity)', this['@entity']);

    let origin = new Entity(this['@entity']);
    let observer = new Observer(origin.data);

    // Our first and primary order of business is to update the clock.  Once
    // we've computed the game state for the next round, we can share it with
    // the world.
    //
    // Let's finish our work up front.
    this['@entity'].clock = One.add(new BN(this['@entity'].clock)).toString();
    this['@entity'].entropy = this.machine.sip();

    console.log('[ENTROPY:CHECK]', 'clock:', this['@entity'].clock, 'entropy:', this['@entity'].entropy);

    // let commit = this.commit();
    // console.log('tick:', commit);
    // let ticks = this.get(`/ticks`) || [];

    // if (!ticks.length) ticks.push(origin.id);

    // Snapshot of our state...
    let data = Object.assign({}, this.state, this['@entity']);
    let state = new Entity(data);
    // let json = state.render();

    // Update global for sanity checks...
    this.parent = origin.id;
    this.state = data;

    this.log('[RPG:TICK]', `#${state.id}`, data);

    // Save the game state to disk.
    try {
      await this.save();
    } catch (E) {
      console.error('Could not save:', E);
    }

    // Looks like we're all done, so let's be courteous and notify subscribers.
    if (notify) {
      this.emit('tick', state.id);
    }

    return this;
  }

  async _POST (path, data) {
    console.log('posting:', path, data);

    let result = null;

    try {
      let id = await super._POST(path, data);
      result = id;
    } catch (E) {
      console.log('RPG COULD NOT CREATE:', E);
    }

    console.log('[RPG:CORE]', 'super posted id:', result);

    try {
      result = await super._GET(result);
    } catch (E) {
      console.error('RPG COULD NOT POST:', path, data, E);
    }

    await this.commit();

    return result;
  }

  async _createIdentity () {
    let item = null;
    let result = null;

    // TODO: async generation
    let key = new Key();
    let struct = {
      name: prompt('What shall be your name?'),
      address: key.address,
      private: key.private.toString('hex'),
      public: key.public
    };

    try {
      item = await this.secrets._POST(`/identities`, struct);
    } catch (E) {
      console.error('broken:', E);
    }

    if (item) {
      this.identities[struct.address] = struct;
      this.identity = new Identity(struct);
      this.menu._attachIdentity(struct);
      result = {
        address: struct.address,
        public: struct.public
      };
    }

    // TODO: remove public key from character, use only address (or direct hash)
    return result;
  }

  async _registerPlayer (data) {
    let result = null;
    let state = new Entity(data);
    let transform = [state.id, state.toJSON()];
    let prior = null;

    try {
      prior = this.get(`/players/${state.id}`);
    } catch (E) {
      console.warn('[RPG]', 'No previous player (registering new):', E);
    }

    let profile = Object.assign({
      type: 'Player',
      sharing: transform
    }, data, prior || {});

    try {
      await this.set(`/players/${state.id}`, profile);
      result = this.get(`/players/${state.id}`);
    } catch (E) {
      return console.error('Cannot register player:', E);
    }

    return result;
  }

  async _announcePlayer (identity) {
    let result = null;
    let player = Object.assign({
      address: identity.address,
      name: identity.name
    });

    try {
      let peer = await this._POST(`/peers`, { address: player.address });
    } catch (E) {
      console.log('Could not register peer:', E);
    }

    try {
      let link = await this._POST(`/players`, player);
      console.log('posted player:', link);
      result = await this._GET(link);
    } catch (E) {
      console.log('Could not register player:', E);
    }

    // TODO: unify remote into flow (automate on all events)
    let remote = await this.remote._POST('/peers', { address: player.address });
    let instance = await this.remote._POST(`/players`, player);

    // broadcast to network
    this.emit('player', player);

    // console.log('peer:', peer);
    // console.log('link:', link);
    console.log('player:', player);
    console.log('result:', result);
    // console.log('broadcast:', broadcast);

    return result;
  }

  async _registerPlace (data) {
    let result = null;
    let state = new Entity(data);
    let transform = [state.id, state.render()];

    console.log('registering place:', data);

    let place = Object.assign({
      id: `local/${state.id}`,
      type: 'Place',
      sharing: transform
    }, data);

    try {
      await this.set(`/places/${state.id}`, place);
      result = this.get(`/places/${state.id}`);
    } catch (E) {
      return console.error('Cannot register place:', E);
    }

    return result;
  }

  async _syncFromGateway () {
    let places = await this.remote._GET('/places');

    console.log('got places:', places);
    // TODO: make async
    for (let i = 0; i <= places.length; i++) {
      await this._registerPlace(places[i]);
    }

    return this;
  }

  async build () {
    this['@world'].map._build();
    this['@world'].map._dump();
  }

  async dump () {
    let id = await this.save();
    let dump = JSON.stringify(this.state);
    console.log('memory dump:', dump);
    return dump;
  }

  /**
   * Compute the game state.
   * @param  {Mixed}  [input=null] Player input, if any.
   * @return {Promise}             Resolves with result.
   */
  async compute (input = null) {
    let object = new Entity(input);
    return object.id;
  }

  async save () {
    let result = null;
    let data = JSON.stringify(this['@entity']['@data']);
    let id = Hash256.digest(data);

    console.log('[RPG:CORE]', `saving memory ${id} with ${Object.keys(this['@entity']['@data'])} keys in local state:`, this['@entity']['@data']);

    try {
      await this.store.db.put(`states/${id}`, data);
      await this.store.db.put(`tip`, id);

      result = id;
    } catch (E) {
      this.error('cannot save:', E);
    }

    return result;
  }

  async restore () {
    let blob = null;
    let data = null;
    let id = null;

    try {
      id = await this.store.db.get(`tip`);
    } catch (E) {
      console.error('Could not GET old state', E);
    }

    try {
      blob = await this.store.db.get(`states/${id}`);
      console.log('[RPG]', 'attempting to restore:', id, blob);
      let result = JSON.parse(blob);
      if (result) {
        this['@entity'] = {
          '@type': 'State',
          '@data': result
        };
        this.state = result;
      }
    } catch (E) {
      console.error('Could not load restore:', E);
    }

    await this.commit();

    return data;
  }

  async start () {
    await super.start();

    // TODO: clean up the clock
    this.state.clock = Zero;

    await this.restore();
    // TODO: import latest from Gateway
    // await this._syncFromGateway();
    // await this['@world'].start();

    // TODO: document the process
    this.timer = setInterval(this.tick.bind(this), this['@configuration'].interval);

    return this;
  }

  async stop () {
    clearInterval(this.timer);
    await super.stop();
    return this;
  }
}

module.exports = RPG;
