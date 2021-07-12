'use strict';

const Component = require('@fabric/http/components/component');

class PlaceView extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      handle: 'rpg-place-view'
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

module.exports = PlaceView;
