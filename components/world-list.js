'use strict';

const Component = require('@fabric/http/components/component');

class WorldList extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'WorldList',
      handle: 'rpg-world-list'
    }, settings);

    this.state = {
      worlds: {}
    };

    return this;
  }

  _getInnerHTML () {
    return `<div class="ui segment">
    <h3>World List</h3>
    <rpg-world-table></rpg-world-table>
    <pre><code>${JSON.stringify(this.state)}</code></pre>
    </div>`;
  }
}

module.exports = WorldList;
