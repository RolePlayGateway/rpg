'use strict';

const Component = require('@fabric/http/components/component');

class WorldTable extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'WorldTable',
      handle: 'rpg-world-table'
    }, settings);

    this.state = {
      worlds: {}
    };

    return this;
  }
}

module.exports = WorldTable;
