'use strict';

class Group {
  constructor (settings = {}) {
    this.settings = Object.assign({}, settings);
    this.players = [];
    return this;
  }
}

module.exports = Group;
