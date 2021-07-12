'use strict';

const Component = require('@fabric/http/components/component');

class TradeTable extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'TradeTable',
      handle: 'rpg-trade-table'
    }, settings);

    this.state = {
      trades: {}
    };

    return this;
  }
}

module.exports = TradeTable;
