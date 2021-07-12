'use strict';

const Component = require('@fabric/http/types/component');

class CharacterView extends Component {
  constructor (settings = {}) {
    super(settings);
    this.settings = Object.assign({
      title: 'Character Profile',
      handle: 'rpg-character-view'
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

module.exports = CharacterView;
