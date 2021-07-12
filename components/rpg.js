'use strict';

// Core application
const Application = require('./application');

// Game Engine

/**
 * Core Class for RPG-style games.
 * @property {Object} settings List of current settings.
 */
class RPG extends Application {
  /**
   * Create an instance of the {@link RPG}.
   * @param {Object} [settings] Configuration options:
   * @param {String} [settings.name] Name of the {@link Game} as a human-friendly string.
   * @param {String} [settings.handle] Name of the {@link Entity} in the DOM model.
   */
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      name: 'RPG',
      handle: 'rpg-app'
    }, settings);

    return this;
  }

  _getInnerHTML () {
    console.log('[RPG:APP]', 'Getting innerHTML...', 'types:', this.types);
    const html = `<rpg-app route="${this.route}">
    <fabric-grid>
      <fabric-grid-row id="details">
        <h1>${this.settings.name}</h1>
        <fabric-channel></fabric-channel>
      </fabric-grid-row>
      <fabric-grid-row id="types">${this.types.render()}</fabric-grid-row>
      <fabric-grid-row id="circuit">${this.circuit.render()}</fabric-grid-row>
      <fabric-grid-row id="graph"></fabric-grid-row>
    </fabric-grid>
    <script type="text/javascript" src="/scripts/index.min.js"></script>
  </rpg-app>`;

    console.trace('[RPG:APP]', 'Retrieved innerHTML...', html);
    return html;
  }

  render () {
    console.log('[RPG:APP]', 'Rendering...', 'types:', this.types);
    let html = this._getInnerHTML();
    return html;
  }
}

module.exports = RPG;
