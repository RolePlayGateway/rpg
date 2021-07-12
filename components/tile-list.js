'use strict';

const Avatar = require('@fabric/http/types/avatar');
const Component = require('@fabric/http/components/component');

class TileList extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'Tiles',
      handle: 'rpg-tile-list'
    }, settings);

    this.state = Object.assign({
      tiles: []
    }, settings);

    return this;
  }

  connectedCallback () {
    super.connectedCallback();
    window.app.circuit._registerMethod('_showTileGenerationPrompt', this._showTileGenerationPrompt.bind(this));
  }

  _showTileGenerationPrompt (event) {
    event.preventDefault();
    // TODO: use prompt from Maki (upstream)
    console.log('TODO: show prompt here');
  }

  _getInnerHTML (state) {
    if (!state) state = this.state;
    let html = `<div class="${this.settings.handle}-content ui segment">
      <h2>${this.settings.title}</h2>
      <div class="controls">
        <div class="ui buttons">
          <button class="ui secondary button" data-action="_generateTile">generate</button>
        </div>
      </div>`;

    html += '<div class="ui segment">';

    if (!state.tiles || !state.tiles.length) {
      html += `<div class="content"><h3 class="header">No ${this.settings.title} Found!</h3>
        <p>Try generating a Tile of your own by pressing the <strong>generate</strong> above.</p></div>`;
    }

    html += `<ul class="ui cards" data-bind="/tiles">`;

    for (let id in state.tiles) {
      let tile = state.tiles[id];
      let avatar = new Avatar();

      console.log('tile:', tile);
      console.log('avatar:', avatar);

      html += `<li class="card">
        <div class="image">
          <img src="${avatar.toDataURI()}" />
        </div>
        <div class="content">
          <a class="header" href="/tiles/${id}"><small class="subtle">#</small>${id}</a>
          <div class="description">
            <code>${JSON.stringify(state.tiles[id])}</code>
          </div>
        </div>
      </li>`;
    }

    html += `</ul>`;
    html += `</div>`;
    html += `</div>`;

    return html;
  }

  render () {
    let html = this._getInnerHTML();
    return `<${this.settings.handle}>${html}</${this.settings.handle}>`;
  }
}

module.exports = TileList;
