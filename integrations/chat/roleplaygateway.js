'use strict';

import * as matrix from 'matrix-js-sdk';

// const Service = require('@fabric/core/types/service');
const EventEmitter = require('events').EventEmitter;

class RPGChat extends EventEmitter {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      name: 'RPGChat'
    }, this.settings, settings);

    // TODO: use @fabric/core/services/matrix
    this.matrix = matrix.createClient('https://chat.roleplaygateway.com');

    return this;
  }

  async start () {
    this.client.publicRooms(function(err, data) {
      console.log('Public Rooms: %s', JSON.stringify(data));
    });

    // await super.start();
  }

  async login (username, password) {
    const result = await this.matrix.login('m.login.password', { user: username, password: password });
    console.log('result of login:', result);
    return result;
  }
}

export { RPGChat };