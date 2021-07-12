'use strict';

const Component = require('@fabric/http/components/component');

class PlayerList extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'Players',
      handle: 'rpg-player-list'
    }, settings);

    return this;
  }

  _getInnerHTML () {
    return `<h2>${this.settings.title}</h2>`;
  }

  render () {
    return `<${this.settings.handle}>${this._getInnerHTML()}</${this.settings.handle}>`;
  }
}

module.exports = PlayerList;
