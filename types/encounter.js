'use strict';

const {
  MIN_LOOT_WORTH,
  MAX_LOOT_WORTH,
  MIN_ITEM_DURABILITY,
  MAX_ITEM_DURABILITY
} = require('../constants');

const Battle = require('./battle');
const Entity = require('@fabric/core/types/entity');

const random = function (items) {
  return items[Math.floor(Math.random() * items.length)];
};

const randomBetween = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const monsters = require('../inputs/monsters');
const rarities = require('../inputs/rarities');
const weapons = require('../inputs/weapons');

class Encounter {
  constructor (entity) {
    let local = new Entity(entity);

    this.entity = Object.assign({
      id: local.id,
      name: local.name,
      path: local.path,
      data: local.data
    }, entity);
    this.state = {};
    this.type = this._getType();

    this.compute();
  }

  compute () {
    switch (this.type) {
      case 'blessing':
        this.entity.data.health = 100;
        this.entity.data.stamina = 100;
        this.entity.data.effects['blessed'] = true;
        break;
      case 'monster':
        this.state.monster = new Entity(random(monsters));
        this.state.battle = new Battle([this.entity, this.state.monster]);

        // this.state.battle.compute();

        // TODO: compute wealth + experience from battle
        this.state.loot = randomBetween(MIN_LOOT_WORTH, MAX_LOOT_WORTH);
        this.entity.data.wealth += this.state.loot;
        break;
      case 'item':
        this.state.item = this._randomWeapon();
        if (!this.entity.weapon) {
          this.entity.data.weapon = this.state.item;
          this.state.equipped = true;
        } else if (this.entity.data.inventory.length < 5) {
          // TODO: automated inventory sorting
          this.entity.data.inventory.push(this.state.item);
        } else {
          this.state.skipped = true;
        }
        break;
    }
  }

  _getType () {
    return random([
      'item',
      'item',
      'item',
      'monster',
      'monster',
      'blessing'
    ]);
  }

  _randomWeapon () {
    let template = random(weapons);
    let rarity = random(rarities);

    return Object.assign({}, template, {
      name: [rarity.name, template.name].join(' '),
      durability: randomBetween(MIN_ITEM_DURABILITY, MAX_ITEM_DURABILITY)
    });
  }
}

module.exports = Encounter;
