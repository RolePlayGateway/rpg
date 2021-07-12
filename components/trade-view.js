'use strict';

const Component = require('@fabric/http/components/component');

class WorldView extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'WorldView',
      handle: 'rpg-world-view'
    }, settings);

    this.state = {
      worlds: {}
    };

    return this;
  }
}

module.exports = WorldView;
