'use strict';

const Component = require('@fabric/http/components/component');
const Tile = require('../types/tile');

// const PixelEditor = require('./pixel-editor');

class TileView extends Component {
  constructor (settings = {}) {
    super(settings);
    // this.editor = new PixelEditor('#pixel-editor');
    this.tile = null;
    this.state = Object.assign({
      tile: {}
    }, settings);

    return this;
  }

  _loadTile (tile) {
    this.tile = new Tile(tile);
    return this;
  }

  _getInnerHTML (state) {
    if (!state) state = this.state;
    return `<div class="ui card">
      <div class="image">
        <img src="/tiles/${state.tile.id}.png" />
      </div>
      <div class="content">
        <a class="header" href="/tiles/${state.tile.id}"><small class="subtle">#</small>${state.tile.id}</a>
        <div class="description">
          <code>${JSON.stringify(state.tile.id)}</code>
        </div>
      </div>
    </div>`;
  }

  render () {
    return `<${this.settings.handle}>${this._getInnerHTML()}</${this.settings.handle}>`;
  }
}

module.exports = TileView;
