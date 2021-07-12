'use strict';

const {
  HTTP_HOST,
  TICK_INTERVAL
} = require('../constants');

const Fabric = require('@fabric/core');

class Agent {
  constructor (settings = {}) {
    this.settings = Object.assign({}, settings);
    this.remote = new Fabric.Remote({ host: HTTP_HOST });
    this.current = null;
    this.heartbeat = null;
    this.ticks = 0;
  }

  async move (direction, type = 'Mob') {
    let agent = this;
    let result = await this.remote._POST(`/movements`, {
      actor: { id: agent.id, type: type },
      object: { direction },
      target: '/movements'
    });

    return result;
  }

  async compute () {
    ++this.ticks;
    console.log(`[AGENT:${this.id}]`, `beginning tick:`, this.ticks, 'current:', this.current);

    switch (this.settings.type) {
      default:
        console.log('Unhandled type:', this.settings.type);
        break;
      case 'Shuttle':
        if (this.current.mode && this.current.mode === 'active') {
          // let movement = await this.move('in', 'Shuttle');
          // console.log('movement:', movement);
        }
        break;
      case 'Mob':
        if (this.current.mood && this.current.mood === 'aggressive') {
          let place = await this.getCurrentLocation();

          if (place.active.length) {
            console.log('found character!', place.active[0]);
            // TODO: attack!
          } else {
            console.log('No nearby characters found.  Moving...');

            let exits = await this.getExits();
            let choice = this.randomFrom(exits);

            console.log('options:', exits);
            console.log('choice:', choice);

            let movement = await this.move(choice.direction, this.type);

            console.log('movement:', movement);
          }
        }
        break;
    }
  }

  async start () {
    let agent = this;

    agent.id = this.settings.id;
    agent.current = await agent.getState();
    agent.heartbeat = setInterval(agent.compute.bind(agent), TICK_INTERVAL);

    return agent;
  }

  async getState () {
    let state = null;
    switch (this.settings.type) {
      default:
        console.log('unhandled type:', this.settings.type);
        break;
      case 'Shuttle':
        state = await this.remote._GET(`/shuttles/${this.id}`);
        break;
      case 'Mob':
        state = await this.remote._GET(`/mobs/${this.id}`);
        break;
    }
    return state;
  }

  async getCurrentLocation () {
    let place = await this.remote._GET(`/places/${this.current.location}`);
    return place;
  }

  async getExits () {
    let place = await this.remote._GET(`/places/${this.current.location}`);
    return place.exits;
  }

  randomFrom (items) {
    return items[Math.floor(Math.random() * items.length)];
  }
}

module.exports = Agent;
