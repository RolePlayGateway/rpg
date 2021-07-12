'use strict';

const Avatar = require('@fabric/http/types/avatar');
const Entity = require('@fabric/core/types/entity');
const Key = require('@fabric/core/types/key');

class Player extends Entity {
  /**
   * In-game representation of our humble hero, the {@link User}.
   * @param  {Object} [settings={}] Settings to pass from the player's will.
   * @return {Player}               Player-controllable instance of themselves.
   */
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      created: Date.now()
    }, settings);

    this.name = null;
    this.position = null;
    this.presence = 'offline';
    this.avatar = new Avatar({
      height: 256,
      width: 256,
      alpha: null
    });

    this.key = new Key();
    // TODO: check semantics of `dedupe` and `key` parameters, refactor out uses
    // of `this.id = x` where `x` is setting a value which should only be
    // computed upon read (i.e., once, at runtime).
    this.address = this.key.address;

    return this;
  }

  async _revealToWorld () {
    await this.avatar._drawAvatar();
    await this.avatar.render();
    await this._presenceToReady();
    console.log('rendered avatar:', this.avatar.render());
    console.log('rendered avatar toDataURI:', this.avatar.toDataURI());
    return this;
  }

  async _presenceFromReady () {
    this.presence = 'online';
    this.commit();
    return this;
  }

  async _setName (name) {
    this.name = name;
    this.commit();
    return this;
  }

  _isOther () {
    return this.other;
  }

  render () {
    return `<rpg-player><player-address>${this.key.address}</player-address></rpg-player>`;
  }
}

module.exports = Player;
