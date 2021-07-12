'use strict';

const Component = require('@fabric/http/components/component');

class MapView extends Component {
  constructor (settings = {}) {
    super(settings);
    this.settings = Object.assign({
      handle: 'character-list'
    }, settings);
    return this;
  }

  render () {
    return `<div></div>`;
  }
}

module.exports = MapView;
