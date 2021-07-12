'use strict';

const Component = require('@fabric/http/components/component');

class PlaceList extends Component {
  constructor (settings = {}) {
    super(settings);
    this.settings = Object.assign({
      title: 'Places',
      handle: 'rpg-place-list'
    }, settings);
    return this;
  }

  _getInnerHTML () {
    return `<div class="ui segment"><h2 class="ui header">${this.settings.title}</h2></div>`;
  }

  render () {
    return `<${this.settings.handle}>${this._getInnerHTML()}</${this.settings.handle}>`;
  }
}

module.exports = PlaceList;
