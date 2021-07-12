'use strict';

const Component = require('@fabric/http/components/component');

class PlayerView extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'Player Profile',
      handle: 'player-view'
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

module.exports = PlayerView;
