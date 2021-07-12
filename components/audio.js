'use strict';

class Audio {
  constructor (settings = {}) {
    this.settings = Object.assign({
      sources: []
    });

    return this;
  }

  render () {
    return `<rpg-audio></rpg-audio>`;
  }
}

module.exports = Audio;
