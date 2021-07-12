'use strict';

const Component = require('@fabric/http/components/component');

class CharacterList extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'Characters',
      handle: 'rpg-character-list'
    }, settings);

    this.characters = [];
    this.state = { characters: this.characters };

    return this;
  }

  _getInnerHTML () {
    let html = ``;
    html += `<div class="ui segment">`;
    html += `<h2>${this.settings.title}</h2>`;
    html += `<div class="ui cards">`;
    for (let i = 0; i < this.state.characters.length; i++) {
      let character = this.state.characters[i];
      html += `<div class="ui card"><div class="content">${JSON.stringify(character)}</div></div>`;
    }
    html += `</div>`;
    return html;
  }

  render () {
    return `<${this.settings.handle}>${this._getInnerHTML()}</${this.settings.handle}>`;
  }
}

module.exports = CharacterList;
