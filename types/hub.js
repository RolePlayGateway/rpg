'use strict';

const {
  TICK_INTERVAL
} = require('../constants');

const http = require('http');
const express = require('express');
const session = require('express-session');
const parsers = require('body-parser');
const WebSocket = require('ws');
const PeerServer = require('peer').ExpressPeerServer;

const Fabric = require('@fabric/core');
const Server = require('@fabric/http');
const RPG = require('./rpg');

class Hub extends Fabric.Oracle {
  constructor (configuration = {}) {
    super(configuration);

    this.config = Object.assign({
      path: './stores/server',
      port: 9999
    }, configuration);

    this.players = {};
    this.connections = {};
    this.validator = new Fabric.Machine();

    this.wss = null;
    this.http = null;
    this.express = express();
    this.sessions = session({ secret: this.config.seed });
    this.peer = new PeerServer(this.express, {
      // path: '/services/peering'
    });

    this.rpg = new RPG(this.config);
    this.server = new Server();
    this.timer = setInterval(function () {
      console.log('[RPG:HUB]', 'checking for heartbeat:', this.validator);
    }, TICK_INTERVAL);

    return this;
  }

  _handleRequest (req, res) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(this.players));
  }

  _handleWebSocket (socket, request) {
    // console.log('incoming WebSocket:', socket);

    let buffer = Buffer.from(request.headers['sec-websocket-key'], 'base64');
    let server = this;
    let player = new Fabric.State({
      connection: buffer.toString('hex'),
      entropy: buffer.toString('hex')
    });

    socket.on('close', function () {
      delete server.connections[player['@data'].connection];
    });

    // TODO: message handler on base class
    socket.on('message', async function handler (msg) {
      console.log('websocket incoming message:', msg);

      socket.send(JSON.stringify({
        '@type': 'Receipt',
        '@actor': buffer.toString('hex'),
        '@data': msg,
        '@version': 1
      }));

      try {
        let message = JSON.parse(msg);
        let type = message['@type'];

        switch (type) {
          default:
            console.log('[SERVER]', 'unhandled type:', type);
            break;
          case 'GET':
            let answer = await server._GET(message['@data']['path']);
            console.log('answer:', answer);
            return answer;
          case 'POST':
            let link = await server._POST(message['@data']['path'], message['@data']['value']);
            console.log('[SERVER]', 'posted link:', link);
            break;
          case 'PATCH':
            let result = await server._PATCH(message['@data']['path'], message['@data']['value']);
            console.log('[SERVER]', 'patched:', result);
            break;
        }

        server._relayFrom(buffer.toString('hex'), msg);
      } catch (E) {
        console.error('could not parse message:', E);
        console.log('you should disconnect from this peer:', buffer.toString('hex'));
      }
    });

    socket.oracle = server.on('patches', function (patches) {
      console.log('magic oracle patches:', patches);
    });

    server.connections[player['@data'].connection] = socket;
    server.players[player['@data'].connection] = player;

    socket.send(JSON.stringify({
      '@type': 'State',
      '@data': server.rpg['@data'],
      '@version': 1
    }));
  }

  _relayFrom (actor, msg) {
    let peers = Object.keys(this.connections).filter(key => {
      return key !== actor;
    });

    console.log(`relaying message from ${actor} to peers:`, peers);

    for (let i = 0; i < peers.length; i++) {
      try {
        this.connections[peers[i]].send(msg);
      } catch (E) {
        console.error('Could not relay to peer:', E);
      }
    }
  }

  define (name, definition) {
    super.define(name, definition);
  }

  trust (source) {
    source.on('message', function (msg) {
      console.log('[RPG:SERVER]', 'trusted source:', source.constructor.name, 'sent message:', msg);
    });
  }

  start () {
    let server = this;

    // configure router
    server.express.use(express.static('assets'));
    server.express.use(server.sessions);
    server.express.use(parsers.urlencoded());
    server.express.use(parsers.json());

    // session manager
    server.express.get('/sessions', async function (req, res) {
      let sessions = await server._GET('/sessions');
      res.send(sessions);
    });

    // login with POST /sessions
    server.express.post('/sessions', async function (req, res) {
      let result = await server._POST('/sessions', req.body);
      req.session.link = result;
      res.redirect(303, result);
    });

    // destroy session manually (instead of timeout)
    server.express.delete('/sessions/:id', async function (req, res) {
      let sessions = await server._GET('/sessions');
      req.session.destroy();
      res.send({
        '@type': 'KnownSessions',
        '@data': sessions
      });
    });

    server.express.get('/entities/:hash', async function (req, res) {
      let result = await server._GET(req.path);
      return res.send(result);
    });

    // peer manager
    server.express.post('/peers', async function (req, res) {
      let proposal = req.body;
      let peers = await server._GET('/peers');

      if (!peers) peers = [];
      if (!proposal.address) return res.send({ '@type': 'Error', '@data': { 'message': 'An address is required.' } });

      // duplicate checking
      // TODO: use Fabric implementation
      let checklist = peers.map(x => x.address);
      if (checklist.includes(proposal.address)) return res.redirect(303, `/peers/${proposal.address}`);

      let result = await server._POST('/peers', proposal);
      if (!result) return res.end(500, { '@type': 'Error', '@data': { 'message': 'Something went wrong saving.' } });

      return res.redirect(303, result);
    });

    server.express.get('/peers', async function (req, res) {
      let peers = await server._GET('/peers');
      if (!peers) peers = [];
      res.send(peers);
    });

    // player manager
    server.express.post('/players', async function (req, res) {
      let proposal = req.body;
      let players = await server._GET('/players');

      if (!players) players = [];
      if (!proposal.address) return res.send({ '@type': 'Error', '@data': { 'message': 'An address is required.' } });

      // duplicate checking
      // TODO: use Fabric implementation
      let checklist = players.map(x => x.address);
      if (checklist.includes(proposal.address)) return res.redirect(303, `/players/${proposal.address}`);

      let result = await server._POST('/players', proposal);
      if (!result) return res.end(500, { '@type': 'Error', '@data': { 'message': 'Something went wrong saving.' } });

      return res.redirect(303, result);
    });

    server.express.get('/players', async function (req, res) {
      let players = await server._GET('/players');
      if (!players) players = [];
      return res.send(players);
    });

    server.http = http.createServer(server.express);

    this.wss = new WebSocket.Server({
      server: server.http,
      /* verifyClient: (info, done) => {
        server.sessions(info.req, {}, () => {
          // TODO: reject unknown (!info.req.session.identity)
          done();
        });
      } */
    });
    this.wss.on('connection', this._handleWebSocket.bind(this));

    server.http.listen(this.config.port);

    return server;
  }
}

module.exports = Hub;
