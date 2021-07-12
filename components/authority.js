'use strict';

const Fabric = require('@fabric/core');

class Authority extends Fabric.Oracle {
  constructor (configuration) {
    super(configuration);

    this.config = Object.assign({
      host: 'localhost',
      port: 9999
    }, configuration);

    this.attempt = 0;
    this.timer = null;
    this.queue = [];
    this.peers = {};

    return this;
  }

  async patch (key, value) {
    return this.socket.send(JSON.stringify({
      '@type': 'PATCH',
      '@data': {
        path: key,
        value: value
      }
    }));
  }

  async post (key, value) {
    return this.socket.send(JSON.stringify({
      '@type': 'POST',
      '@data': {
        path: key,
        value: value
      }
    }));
  }

  async put (key, value) {
    let result = await this._PUT(key, value);

    this.socket.send(JSON.stringify({
      '@type': 'PUT',
      '@data': {
        path: key,
        value: value
      }
    }));

    return result;
  }

  async get (key) {
    let result = await this._GET(key);

    this.socket.send(JSON.stringify({
      '@type': 'GET',
      '@data': {
        path: key
      }
    }));

    return result;
  }

  _connect () {
    this.socket = new WebSocket(`ws://${this.config.host}:${this.config.port}/peers`);
    this.socket.onopen = this._onConnection.bind(this);
    this.socket.onmessage = this._onMessage.bind(this);
    this.socket.onclose = this._onClose.bind(this);
    this.socket.onerror = this._onError.bind(this);
    return this.socket;
  }

  _onConnection (event) {
    this.status = 'connected';
    this.emit('connection:ready');
  }

  _onMessage (event) {
    this.queue.push(event);
    this.emit('message', event);
  }

  _onError (error) {
    this.emit('error', error);
  }

  _onClose (event) {
    this.status = 'disconnected';

    let authority = this;
    let distance = Math.pow(authority.attempt, 2) * 1000;

    console.log('[RPG:AUTHORITY]', `connection closed, retrying in ${distance} milliseconds.`);

    authority.timer = setTimeout(function reconnect () {
      clearTimeout(authority.timer);
      authority.attempt++;
      authority._connect();
    }, distance);
  }
}

module.exports = Authority;
