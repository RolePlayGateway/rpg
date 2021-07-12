'use strict';

const Component = require('@fabric/http/components/component');

class TradeList extends Component {
  constructor (settings = {}) {
    super(settings);

    this.settings = Object.assign({
      title: 'Trading Interface',
      handle: 'rpg-trade-list'
    }, settings);

    this.state = {
      trades: {}
    };

    return this;
  }

  connectedCallback () {
    super.connectedCallback();
    window.app.circuit._registerMethod('_openTradeCreationModal', this._openTradeCreationModal.bind(this));
  }

  _openTradeCreationModal (event) {
    event.preventDefault();
    console.log('open trade modal, event:', event);
  }

  _getInnerHTML () {
    return `<div class="ui segment">
      <h3>Trade List</h3>
      <rpg-trade-table></rpg-trade-table>
      <pre><code>${JSON.stringify(this.state)}</code></pre>
      <button class="ui right labeled icon button"></button>
      <h4>Open Trades</h4>
      <table class="ui table">
        <thead>
          <tr>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr><td></td></tr>
        </tbody>
      </table>
    </div>`;
  }
}

module.exports = TradeList;
