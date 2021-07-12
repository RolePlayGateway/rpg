'use strict';

// const Fabric = require('@fabric/core');
const SPA = require('@fabric/http/types/app');
const Key = require('@fabric/core/types/key');
const Remote = require('@fabric/core/types/remote');
const State = require('@fabric/core/types/state');

// Internal types
const RPG = require('../types/rpg');
const Map = require('../types/map');

const Audio = require('./audio');
const Authority = require('./authority');
const Canvas = require('./canvas');
// const History = require('./history');
// const Swarm = require('./swarm');

/**
 * Primary Application Definition
 * @property {Object} rpg Instance of the RPG engine.
 */
class Application extends SPA {
  /**
   * Create an instance of the RPG client.
   * @param  {Object} [configuration={}] Key/value map of configuration options.
   * @return {Application}               Instance of our {@link Application}.
   */
  constructor (configuration = {}) {
    super(configuration);

    // An authority is required when running in a browser.
    this.authority = null;
    this.identity = null;
    this.identities = {};
    this.networkPlayers = {};

    this['@data'] = Object.assign({
      authority: 'alpha.roleplaygateway.com:9999',
      canvas: {
        height: 768,
        width: 1024
      }
    }, configuration);

    this.rpg = new RPG(configuration);
    this.swarm = new Swarm();
    this.remote = new Remote({
      host: this['@data'].authority,
      secure: (this['@data'].secure !== false)
    });

    this.trust(this.rpg);

    return this;
  }

  /**
   * Deliver a message to an address.
   * @param  {String}  destination Address in the Fabric network.
   * @param  {Mixed}  message     Message to deliver.
   * @return {Promise}             Resolves once the message has been broadcast.
   */
  async _deliver (destination, message) {
    console.log('[APPLICATION]', 'delivering:', destination, message);
    if (!this.swarm.connections[destination]) console.error('Not connected to peer:', destination);
    let delivery = await this.swarm.connections[destination].send({
      '@type': 'UntypedDocument',
      '@destination': destination,
      '@data': message
    });
    this.log('message delivered:', delivery);
    return delivery;
  }

  async _handleAuthorityReady () {
    console.log('authority ready!  announcing player:', this.identity);
    await this._announcePlayer(this.identity);

    try {
      let peers = await this.remote._GET('/peers');

      for (let i = 0; i < peers.length; i++) {
        this.swarm.connect(peers[i].address);
      }
    } catch (E) {
      console.error('[RPG:APPLICATION]', 'Could not connect to peers:', peers);
    }

    return this;
  }

  async _announcePlayer (identity) {
    let player = Object.assign({
      address: identity.address,
      name: identity.name
    });

    let peer = await this.stash._POST(`/peers`, { address: player.address });
    let link = await this.stash._POST(`/players`, player);
    let result = await this.stash._GET(link);

    // TODO: unify remote into flow (automate on all events)
    let remote = await this.remote._POST('/peers', { address: player.address });
    let instance = await this.remote._POST(`/players`, player);

    // broadcast to network
    if (this.swarm) {
      let broadcast = await this.swarm._broadcast({
        '@type': 'Player',
        '@data': player
      });
    }

    console.log('peer:', peer);
    console.log('link:', link);
    console.log('player:', player);
    console.log('result:', result);

    // TODO: filter this to exclude historical peers
    this.emit('player', {
      '@type': 'Player',
      '@data': result
    });

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
      item = await this.stash._POST(`/identities`, struct);
      result = await this.stash._GET(item);
    } catch (E) {
      console.error('broken:', E);
    }

    this.identities[struct.address] = struct;
    this.identity = struct;

    // TODO: remove public key from character, use only address (or direct hash)
    return {
      address: struct.address,
      public: struct.public
    };
  }

  async _requestName () {
    let name = prompt('What is your name?');
    let player = {
      name: name
    };

    await this.authority.post(`/players`, player);

    player.id = key.address;

    this.player = player;

    console.log('id', this.player.id);

    return this;
  }

  // Disabled in favor of HTTP.App
  /* async _restoreIdentity () {
    let identities = null;

    try {
      identities = await this.stash._GET(`/identities`);
    } catch (E) {
      console.error('Could not load history:', E);
    }
    
    if (!identities || !identities.length) {
      return this._createIdentity();
    } else {
      return identities[0];
    }
  } */

  async _handleMessage (msg) {
    if (!msg.data) return console.error(`Malformed message:`, msg);

    let parsed = null;

    try {
      parsed = JSON.parse(msg.data);
    } catch (E) {
      return console.error(`Couldn't parse data:`, E);
    }

    if (!parsed['@type']) return console.error(`No type provided:`, parsed);
    if (!parsed['@data']) return console.error(`No data provided:`, parsed);

    if (typeof parsed['@data'] === 'string') {
      console.warn('Found string:', parsed);
      parsed['@data'] = JSON.parse(parsed['@data']);
    }

    console.log('hello:', parsed['@type'], parsed);

    switch (parsed['@type']) {
      default:
        console.error('[APP:_handleMessage]', `Unhandled type:`, parsed['type'], parsed);
        break;
      case 'PeerMessage':
        let content = parsed['@data'].object;

        console.log('parsed data:', parsed['@data']);

        switch (content['@type']) {
          default:
            console.log('[PEER:MESSAGE]', 'unhandled type', parsed['@data'].object['@type']);
            break;
          case 'GET':
            // TODO: deduct funds from channel
            console.log('this:', this);
            console.log('path:', parsed['@data'].object['@data'].path);
            let answer = await this.stash._GET(parsed['@data'].object['@data'].path);
            let parts = parsed['@data'].actor.split('/');
            let result = await this._deliver(parts[2], answer);
            console.log('answer:', answer);
            console.log('result:', result);
            break;
          case 'PATCH':
            console.log('peer gave us PATCH:', content);

            try {
              // let result = await this.authority.patch(content['@data'].path, content['@data'].value);
              let answer = await this.stash._PATCH(content['@data'].path, content['@data'].value);
              console.log('answer:', answer);
            } catch (E) {
              console.log('could not patch:', E);
            }

            break;
        }
        break;
      case 'PATCH':
        this._processInstruction(parsed['@data']);
        break;
      case 'POST':
        this._processInstruction(parsed['@data']);
        break;
    }
  }

  async _onMessage (message) {
    console.log('hello, message:', message);

    switch (message['@type']) {
      default:
        console.log('application onMessage received unknown type:', message['@type']);
        break;
      case 'PeerMessage':
        console.log('hi peermessage:', message);

        await this.stash._POST(`/messages/${message.id}`, message);

        let fake = {
          data: JSON.stringify(message)
        };

        await this._handleMessage(fake);

        break;
    }
  }

  async _onPeer (peer) {
    console.log('swarm notified of peer:', peer);
  }

  async _onSwarmReady () {
    console.log('swarm ready!  adding self to stash...');
    // Add self to stash.
    let link = await this.stash._POST(`/peers`, {
      address: this.identity.address
    });
  }

  async _onConnection (id) {
    console.log('hello, connection:', id);
    let connection = { address: id };
    let posted = await this.stash._POST(`/connections`, connection);
    console.log('posted:', posted);
    console.log('connections:', this.swarm.connections);
  }

  async _updatePosition (x, y, z) {
    if (!this.player) return;
    return console.log('short circuited position patch');
    await this.authority.patch(`/players/${this.player.id}`, {
      id: this.player.id,
      position: {
        x: x,
        y: y,
        z: z
      }
    });
  }

  _toggleFullscreen () {
    if (this.element.webkitRequestFullScreen) {
      this.element.webkitRequestFullScreen();
    }
  }

  _processInstruction (instruction) {
    console.log('process instruction:', instruction);
  }

  /**
   * Get the output of our program.
   * @return {String}           Output of the program.
   */
  render () {
    let canvas = this.canvas = new Canvas({
      height: this.config.height,
      width: this.config.width
    });

    // let drawn = canvas.draw();
    let content = canvas.render();
    let state = new State(content);
    let rendered = `<rpg-application integrity="sha256:${state.id}">${canvas.render()}</rpg-application><rpg-debugger data-bind="${state.id}" />`;
    let sample = new State(rendered);

    if (this.element) {
      this.element.setAttribute('integrity', `sha256:${sample.id}`);
      this.element.innerHTML = rendered;
    }

    canvas.envelop('rpg-application canvas');

    return rendered;
  }

  async start () {
    this.log('[APP]', 'Starting...');

    await super.start();

    try {
      await this.rpg.start();
    } catch (E) {
      this.error('Could not start RPG:', E);
      return null;
    }

    this.identity = await this._restoreIdentity();

    console.log('[APP:DEBUG]', 'identity (in start):', this.identity);
    console.log('[SWARM]', 'binding events...');

    this.swarm.on('peer', this._onPeer.bind(this));
    this.swarm.on('ready', this._onSwarmReady.bind(this));
    this.swarm.on('message', this._onMessage.bind(this));
    this.swarm.on('connection', this._onConnection.bind(this));
    // this.swarm.connect('test');

    await this.swarm.identify(this.identity.address);
    await this.swarm.start();

    // lastly, connect to an authority
    try {
      this.authority = new Authority(this.settings);
      this.authority.on('connection:ready', this._handleAuthorityReady.bind(this));
      // TODO: enable message handler for production
      // this.authority.on('message', this._handleMessage.bind(this));
      // this.authority.on('changes', this._handleChanges.bind(this));
      this.authority._connect();
    } catch (E) {
      console.error('Could not establish connection to authority:', E);
    }

    this.log('[APP]', 'Started!');
    this.log('[APP]', 'State:', this.authority);

    return this;
  }
}

module.exports = Application;
