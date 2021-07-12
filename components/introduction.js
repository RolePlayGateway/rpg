'use strict';

const Component = require('@fabric/http/components/component');
const WorldTable = require('./world-table');

class RPGIntroduction extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'Welcome to RPG!',
      handle: 'rpg-introduction'
    }, settings);

    this.worldTable = new WorldTable();

    return this;
  }

  _getInnerHTML () {
    let table = this.worldTable._getElement();
    return `<div class="ui segment">
  <div class="content">
    <h2>Welcome home, traveler.</h2>
    <p>Select a world to begin playing.</p>
  </div>
</div>
<div class="ui segment">
  <h3>Worlds</h3>
  <div>${table.outerHTML}</div>
</div>`;
  }

  render () {
    return `<rpg-introduction>${this._getInnerHTML()}</rpg-introduction>`;
  }
}

module.exports = RPGIntroduction;
