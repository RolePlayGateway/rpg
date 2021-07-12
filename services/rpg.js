'use strict';

const {
  BIG_LIST_LIMIT
} = require('../constants');

const Fabric = require('@fabric/core');

class RPG extends Fabric.Service {
  constructor (settings = {}) {
    super(settings);
    this.settings = Object.assign({}, settings);
    this.remote = new Fabric.Remote({ host: 'api.roleplaygateway.com' });
    return this;
  }

  async _broadcast (msg) {
    this._lastMessage = msg;
    let result = await this.remote._POST('/messages', msg);
    console.log(`[SERVICE:RPG]`, `_broadcast(message)`, 'result:', result);
    return result;
  }

  async _listPlaces (count = 100) {
    return this.remote._GET('/places', { limit: count });
  }

  async _listUsers (count = 100) {
    return this.remote._GET('/authors', { limit: count });
  }

  async _sync () {
    let users = await this._listUsers(BIG_LIST_LIMIT);
    if (users) {
      for (let i = 0; i < users.length; i++) {
        await this._registerActor(users[i]);
      }
    }
  }
}

module.exports = RPG;
