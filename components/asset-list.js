'use strict';

const Avatar = require('@fabric/http/types/avatar');
const Component = require('@fabric/http/components/component');

class AssetList extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'Assets',
      handle: 'rpg-asset-list'
    }, settings);

    this.state = Object.assign({
      assets: []
    }, settings);

    return this;
  }

  connectedCallback () {
    super.connectedCallback();
    window.app.circuit._registerMethod('_showAssetGenerationPrompt', this._showAssetGenerationPrompt.bind(this));
  }

  _showAssetGenerationPrompt (event) {
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
          <button class="ui secondary button" data-action="_generateAsset">generate</button>
        </div>
      </div>`;

    html += '<div class="ui segment">';

    if (!state.assets || !state.assets.length) {
      html += `<div class="content"><h3 class="header">No ${this.settings.title} Found!</h3>
        <p>Try generating a Asset of your own by pressing the <strong>generate</strong> above.</p></div>`;
    }

    html += `<ul class="ui cards" data-bind="/assets">`;

    for (let id in state.assets) {
      let asset = state.assets[id];
      let avatar = new Avatar();

      console.log('asset:', asset);
      console.log('avatar:', avatar);

      html += `<li class="card">
        <div class="image">
          <img src="${avatar.toDataURI()}" />
        </div>
        <div class="content">
          <a class="header" href="/assets/${id}"><small class="subtle">#</small>${id}</a>
          <div class="description">
            <code>${JSON.stringify(state.assets[id])}</code>
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

module.exports = AssetList;
